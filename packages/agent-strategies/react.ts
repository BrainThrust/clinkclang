import { z } from 'zod';
import { BaseStrategy } from './base';
import { Agent } from '@/agent-core/core';
import { Message, ModelResponse } from '@/agent-core/schema/core-schema';
import { REACT_PROMPT_TEMPLATE } from '@/agent-strategies/prompt-template/react-prompt-template';

// TODO: find a way to make this prompt strict
// TODO: better error handling (what if the tool call fails? what if the tool returns invalid JSON? how many retries will that take to fix?)
// TODO: better debug and logging for the developer and the user
export class ReActStrategy extends BaseStrategy {
  private maxIterations: number;
  private debug: boolean;

  constructor(agent: Agent) {
    super(agent);
    this.debug = agent.config?.structure?.debug ?? false;
    const configMaxRetries = this.agent.config.structure?.maxRetries;
    this.maxIterations = configMaxRetries === 'unlimited'
      ? Number.MAX_SAFE_INTEGER
      : configMaxRetries || 3;
  }

	private debugLog(...args: any[]) {
		if (this.debug) {
			console.log('[DEBUG]', ...args);
		}
	}

	async execute(input: string, schema?: z.ZodSchema): Promise<string> {
		this.debugLog('Starting ReAct strategy with input:', input);

		this.initializeContext(input, Boolean(schema));

		let iteration = 0;
		let finalAnswer = '';

		while (
			(this.maxIterations === Number.MAX_SAFE_INTEGER || iteration < this.maxIterations) &&
			!finalAnswer
		) {
			this.debugLog(`\n--- Iteration ${iteration + 1} ---`);

			try {
				const response = await this.generateStep();
				this.debugLog('Generated response:', response.content);

				// parse Thought, Action, Answer
				const { thought, action, answer } = this.parseResponse(response.content);

				if (thought) {
					this.debugLog('[Thought]', thought);
				}

				if (action) {
					const toolResult = await this.executeAction(action);
					this.debugLog('[Tool Result]', toolResult.substring(0, 80) + '...');

					this.agent.memory.addContent(response.content, 'history', 0);
					this.agent.memory.addContent(`Observation: ${toolResult}`, 'observation', 1);
				}

				if (answer) {
					this.debugLog('[Proposed Answer]', answer);
					finalAnswer = (await this.validateAnswer(answer, schema)) || '';

					if (finalAnswer) {
						this.debugLog('[Validated Answer]', finalAnswer);
					}
				}

				iteration++;
			} catch (error) {
				this.debugLog(
					'[Error]',
					error instanceof Error ? error.message : 'Unknown error',
					'\nRetrying with error context...'
				);

				if (error instanceof Error) {
					this.agent.memory.addContent(`Error: ${error.message}`, 'system', 2);
				}

				iteration++;
			}
		}

		if (!finalAnswer) {
			throw new Error(`Failed after ${this.maxIterations} iterations`);
		}

		return finalAnswer;
	}

  private initializeContext(input: string, hasSchema: boolean) {
    // add the user input at priority 2 (important) (can be changed to a different priority)
    this.agent.memory.addContent(`User Input:\n${input}`, 'history', 2);

    const reactPrompt = REACT_PROMPT_TEMPLATE(this.agent.tools.length > 0, hasSchema);
    // add the ReAct system prompt at priority 3 so it doesn't get evicted
    this.agent.memory.addContent(reactPrompt, 'system', 3);

    if (this.agent.tools.length > 0) {
      const toolsContent = `Tools:\n${this.agent.tools
        .map((t) => `${t.name}: ${t.description}`)
        .join('\n')}`;
      // add the tools content at priority 2 (can be changed to a different priority)
      this.agent.memory.addContent(toolsContent, 'system', 2);
    }
  }

	private async generateStep(): Promise<ModelResponse> {
		const prompt = this.agent.memory.getContext(0);
		const messages: Message[] = [{ role: 'system', content: prompt }];

		// pass messages to the provider
		return this.agent.provider.generateResponse(messages);
	}

	private parseResponse(content: string) {
		return {
			thought: this.extractSection(content, 'Thought'),
			action: this.extractSection(content, 'Action'),
			answer: this.extractSection(content, 'Final Answer')
		};
	}

	private async executeAction(action: string): Promise<string> {
		const toolCall = this.parseToolCall(action);

		if (!toolCall) {
			throw new Error('Malformed tool call');
		}

		const tool = this.agent.tools.find((t) => t.name === toolCall.name);
		if (!tool) {
			throw new Error(`Unknown tool: ${toolCall.name}`);
		}

		try {
			const args = tool.parameters.parse(toolCall.args);
			const result = await tool.execute(args);
			return result;
		} catch (error) {
			throw new Error(
				`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	private parseToolCall(action: string) {
		const match = action.match(/toolCall:(\w+)\((.+)\)/);
		if (!match || !match[2]) return null;

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
			return JSON.stringify((validation as z.SafeParseSuccess<any>).data);
		}

		this.debugLog(
			'[Validation Failed]',
			'Errors:',
			validation.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
		);

		return this.retryWithSchema(validation.error.issues, schema);
	}

	private retryWithSchema(errors: z.ZodIssue[], schema: z.ZodSchema): string {
		const errorList = errors.map((e) => `- ${e.path.join('.')}: ${e.message}`);
		const retryMessage = [
			'Validation failed. Issues:',
			...errorList,
			'Required format:',
			this.generateSchemaPrompt(schema)
		].join('\n');

		// in this code, you had a local `this.context` previously.
		// we might store the message in memory instead:
		this.agent.memory.addContent(retryMessage, 'system', 2);
		return '';
	}

	private extractSection(content: string, section: string): string {
		const regex = new RegExp(`${section}:\\s*([\\s\\S]*?)(?=\\n\\w+:|$)`, 'i');
		return content.match(regex)?.[1]?.trim() || '';
	}
}
