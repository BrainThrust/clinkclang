import { z } from 'zod';
import { Agent, AgentConfig } from './base';
import { ModelResponse } from '../schema/core-schema';
import { REACT_PROMPT } from './prompt-templates/react-prompt';

export class ReactAgent extends Agent {
	private maxIterations: number;
	private debug: boolean;

	constructor(config: AgentConfig) {
		super(config);
		this.debug = config.structure?.debug ?? false;
		const configMaxRetries = config.structure?.maxRetries;
		this.maxIterations =
			configMaxRetries === 'unlimited' ? Number.MAX_SAFE_INTEGER : configMaxRetries || 3;
	}

	private debugLog(...args: any[]) {
		if (this.debug) {
			console.log('[DEBUG]', ...args);
		}
	}

	async generate(input: string): Promise<string> {
		this.debugLog('Starting ReAct strategy with input:', input);
		await this.initializeContext(input, Boolean(this.config.outputSchema));

		let iteration = 0;
		let finalAnswer = '';

		while (
			(this.maxIterations === Number.MAX_SAFE_INTEGER || iteration < this.maxIterations) &&
			!finalAnswer
		) {
			this.debugLog(`\n--- Iteration ${iteration + 1} ---`);
			try {
				const response = await this.generateStep();
				const { thought, action, answer } = this.parseResponse(response.content);

				if (thought) this.debugLog('[Thought]', thought);
				if (action) this.debugLog('[Action]', action);

				if (action) {
					if (this.isValidToolCall(action)) {
						const toolResult = await this.handleToolAction(action, response, iteration);
						this.debugLog('[Observation]', toolResult.substring(0, 100) + '...');
					} else {
						finalAnswer = await this.validateAnswer(action, this.config.outputSchema?.schema);
					}
				}
				if (answer) {
					finalAnswer = await this.validateAnswer(answer, this.config.outputSchema?.schema);
					if (finalAnswer) {
						this.debugLog('[Final Response]', finalAnswer);
					}
				}
				iteration++;
			} catch (error) {
				this.handleError(error, iteration);
				iteration++;
			}
		}
		if (!finalAnswer) {
			throw new Error(`Failed after ${this.maxIterations} iterations`);
		}
		return finalAnswer;
	}

	private async initializeContext(input: string, hasSchema: boolean) {
		await this.memory.addMessage({
			role: 'user',
			content: input,
			metadata: { type: 'user_input', priority: 2 }
		});

		const reactPrompt = REACT_PROMPT(this.tools.length > 0, hasSchema);
		await this.memory.addMessage({
			role: 'system',
			content: reactPrompt,
			metadata: { type: 'system_prompt', priority: 3 }
		});

		if (this.tools.length > 0) {
			const toolsContent = `Tools:\n${this.tools.map((t) => `${t.name}: ${t.description}`).join('\n')}`;
			await this.memory.addMessage({
				role: 'system',
				content: toolsContent,
				metadata: { type: 'tools_list', priority: 2 }
			});
		}
	}

	private async generateStep(): Promise<ModelResponse> {
		return this.provider.generateResponse(
			this.memory.getMessages().map((msg) => ({
				role: msg.role,
				content: msg.content
			}))
		);
	}

	private parseResponse(content: string) {
		const thought = this.extractSection(content, 'Thought');
		const action = this.extractSection(content, 'Action');
		const answer = this.extractSection(content, 'Final Answer');
		return { thought, action, answer };
	}

	private async handleToolAction(
		action: string,
		response: ModelResponse,
		iteration: number
	): Promise<string> {
		const toolResult = await this.executeAction(action);

		await this.memory.addMessage({
			role: 'assistant',
			content: response.content,
			metadata: {
				type: 'action_response',
				tool_call: {
					action: action,
					result: toolResult,
					iteration
				}
			}
		});

		await this.memory.addMessage({
			role: 'system',
			content: `Observation: ${toolResult}`,
			metadata: { type: 'tool_result' }
		});

		return toolResult;
	}

	private isValidToolCall(action: string): boolean {
		return action.startsWith('toolCall:');
	}

	private async executeAction(action: string): Promise<string> {
		const toolCall = this.parseToolCall(action);
		if (!toolCall) throw new Error('Malformed tool call');

		const tool = this.tools.find((t) => t.name === toolCall.name);
		if (!tool) throw new Error(`Unknown tool: ${toolCall.name}`);

		try {
			const args = tool.parameters.parse(toolCall.args);
			this.debugLog('[Tool Execution]', `Running ${tool.name} with args:`, args);
			const result = await tool.execute(args);
			this.debugLog('[Tool Result]', result.substring(0, 100) + '...');
			return result;
		} catch (error) {
			throw new Error(
				`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	private parseToolCall(action: string) {
		const match = action.match(/toolCall:(\w+)\((.+)\)/);
		if (!match?.[2]) return null;

		try {
			return {
				name: match[1],
				args: JSON.parse(match[2].replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3').replace(/'/g, '"'))
			};
		} catch (e) {
			return null;
		}
	}

	private async validateAnswer(answer: string, schema?: z.ZodSchema): Promise<string> {
		if (!schema) return answer;

		const cleaned = this.cleanJSON(answer);
		const validation = await this.validateOutput(cleaned, schema);

		if (validation.success) {
			this.debugLog('[Valid Response]', cleaned);
			return JSON.stringify((validation as z.SafeParseSuccess<any>).data);
		}
		this.debugLog(
			'[Validation Failed]',
			'Errors:',
			validation.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
		);
		return this.retryWithSchema(validation.error.issues, schema);
	}

	private async retryWithSchema(errors: z.ZodIssue[], schema: z.ZodSchema): Promise<string> {
		const errorList = errors.map((e) => `- ${e.path.join('.')}: ${e.message}`);
		const retryMessage = [
			'Validation failed. Issues:',
			...errorList,
			'Required format:',
			this.generateSchemaPrompt(schema)
		].join('\n');

		await this.memory.addMessage({
			role: 'system',
			content: retryMessage,
			metadata: { type: 'validation_error', priority: 2 }
		});

		return '';
	}

	private handleError(error: unknown, iteration: number) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		this.debugLog('[Error]', errorMessage, '\nRetrying with error context...');

		this.memory.addMessage({
			role: 'system',
			content: `Error: ${errorMessage}`,
			metadata: { type: 'error', iteration }
		});
	}

	private cleanJSON(content: string): string {
		return content
			.replace(/```json/g, '')
			.replace(/```/g, '')
			.replace(/(\w+):/g, '"$1":')
			.replace(/'/g, '"');
	}
	private async validateOutput<T>(content: string, schema: z.ZodSchema<T>) {
		try {
			const cleaned = this.cleanJSON(content);
			const parsed = JSON.parse(cleaned);
			return schema.safeParse(parsed);
		} catch (error) {
			return {
				success: false,
				error: new z.ZodError([
					{
					code: 'invalid_type',
					expected: 'object',
					received: 'string',
					path: [],
					message: `Malformed JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
					}
				])
			};
		}
	}

	private generateSchemaPrompt(schema: z.ZodSchema): string {
		if (schema instanceof z.ZodObject) {
			const example = Object.entries(schema.shape).reduce(
				(acc, [key, value]) => {
					acc[key] = value instanceof z.ZodType ? this.getTypeExample(value) : 'unknown';
					return acc;
				},
				{} as Record<string, any>
			);

			return `Required JSON format:\n${JSON.stringify(example, null, 2)}`;
		}
		return `Required format: ${schema.description || 'Valid JSON matching the schema'}`;
	}

	private getTypeExample(type: z.ZodType): any {
		if (type instanceof z.ZodString) return 'string';
		if (type instanceof z.ZodNumber) return 0;
		if (type instanceof z.ZodBoolean) return true;
		if (type instanceof z.ZodArray) return [this.getTypeExample(type.element)];
		return 'value';
	}

	private extractSection(content: string, section: string): string {
		const regex = new RegExp(`${section}:\\s*([\\s\\S]*?)(?=\\n\\w+:|$)`, 'i');
		return content.match(regex)?.[1]?.trim() || '';
	}
}
