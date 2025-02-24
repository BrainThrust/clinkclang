import { z } from 'zod';
import { BaseProvider } from 'packages/core/providers/base-provider';
import { OpenAIProvider } from 'packages/core/providers/openai-provider';
import { ClaudeProvider } from 'packages/core/providers/claude-provider';
import { DeepSeekProvider } from 'packages/core/providers/deepseek-provider';
import { Message, ModelResponse, Schema } from 'packages/core/schema/core-schema';
import { Tool } from 'packages/core/tools/tool';
import { ShortTermMemory } from 'packages/core/memory/short-term';
import { MemoryMessage } from 'packages/core/schema/memory-schema';

type ProviderConfig = OpenAIProviderConfig | ClaudeProviderConfig | DeepSeekProviderConfig;

interface BaseProviderConfig {
	apiKey: string;
	modelName: string;
	temperature?: number;
	maxTokens?: number;
}

interface OpenAIProviderConfig extends BaseProviderConfig {
	type: 'openai';
}

interface ClaudeProviderConfig extends BaseProviderConfig {
	type: 'claude';
	version?: string;
}

interface DeepSeekProviderConfig extends BaseProviderConfig {
	type: 'deepseek';
	stream?: boolean;
}

export interface AgentConfig {
	provider: ProviderConfig;
	systemPrompt?: string;
	tools?: Tool[];
	structure?: {
		strict?: boolean;
		maxRetries?: number | 'unlimited';
		debug?: boolean;
		maxContextTokens?: number;
	};
	outputSchema?: Schema;
	retries?: number;
}

const providerMap = {
	openai: OpenAIProvider,
	claude: ClaudeProvider,
	deepseek: DeepSeekProvider
};

export function describeTool(tool: Tool): string {
	const params = Object.entries(tool.parameters.shape)
		.map(([key, value]) => {
			const zodType = value as z.ZodTypeAny;
			return `${key}: ${zodType.description} (${zodType._def.typeName.replace('Zod', '').toLowerCase()})`;
		})
		.join('\n');

	return `Tool: ${tool.name}
      Description: ${tool.description}
      Parameters (JSON format):{${params}}
      Usage: toolCall:${tool.name}({"param1": value, "param2": value})`;
}

export function describeTools(tools: Tool[]): string {
	return tools.length > 0
		? `Available Tools:\n${tools.map((t) => describeTool(t)).join('\n')}`
		: '';
}

export abstract class Agent {
	public provider: BaseProvider;
	public tools: Tool[];
	public config: AgentConfig;
	public memory: ShortTermMemory;
	public history: Message[] = [];

	constructor(config: AgentConfig) {
		this.config = {
			...config,
			structure: {
				debug: config.structure?.debug ?? false,
				maxRetries: config.structure?.maxRetries ?? 3,
				strict: config.structure?.strict ?? false
			}
		};

		this.tools = config.tools || [];
		this.provider = this.createProvider(config.provider);

		const maxContextTokens = this.config.structure?.maxContextTokens || 4000;
		const initialSystemPrompt = this.buildSystemPrompt(config);

		this.memory = new ShortTermMemory({
			provider: this.provider,
			tokenLimit: maxContextTokens,
			initialMessages: [
				this.createMemoryMessage('system', initialSystemPrompt, {
					type: 'system_prompt',
					priority: 3
				})
			]
		});
	}

	private createProvider(config: ProviderConfig): BaseProvider {
		switch (config.type) {
			case 'openai':
				return new OpenAIProvider(config);
			case 'claude':
				return new ClaudeProvider(config);
			case 'deepseek':
				return new DeepSeekProvider(config);
			default:
				throw new Error('Unsupported provider');
		}
	}

	protected createMemoryMessage(
		role: MemoryMessage['role'],
		content: string,
		metadata?: Record<string, any>
	): MemoryMessage {
		return {
			role,
			content,
			tokens: Math.ceil(content.length / 4) + 4,
			createdAt: Date.now(),
			metadata
		};
	}

	protected buildSystemPrompt(config: AgentConfig): string {
		const outputSchema = config.outputSchema?.schema;
		const isZodObject = outputSchema instanceof z.ZodObject;
		const isZodEffects = outputSchema instanceof z.ZodEffects;

		const lines = [
			config.systemPrompt,
			describeTools(config.tools || []),
			config.outputSchema && (isZodObject || isZodEffects)
				? `Output must be in JSON format matching: ${JSON.stringify(
						isZodEffects ? outputSchema._def.schema.shape : outputSchema.shape
					)}`
				: 'Invalid schema type'
		].filter(Boolean);

		return lines.join('\n');
	}

	abstract generate(input: string): Promise<string>;

	extractToolCall(response: ModelResponse): { name: string; arguments: any } | null {
		const text = response.content;
		const toolCallRegex = /toolCall:\s*(\w+)\s*\(\s*((?:[^{}]|{[^{}]*}|)*)\s*\)/s;
		const match = text.match(toolCallRegex);

		if (match?.[1] && match?.[2]) {
			try {
				return {
					name: match[1],
					arguments: JSON.parse(match[2])
				};
			} catch (e) {
				console.error('Tool argument parsing failed:', e);
			}
		}
		return null;
	}

	getHistory(): Message[] {
		return this.memory.getMessages().map((msg) => ({
			role: msg.role,
			content: msg.content
		}));
	}
}
