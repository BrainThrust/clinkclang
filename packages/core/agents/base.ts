import { z } from 'zod';
import { BaseProvider } from '../providers/llm-providers/base-llm';
import { OpenAIProvider } from '../providers/llm-providers/openai-llm';
import { ClaudeProvider } from '../providers/llm-providers/claude-llm';
import { DeepSeekProvider } from '../providers/llm-providers/deepseek-llm';
import type { Message, ModelResponse, Schema } from '../schema/core-schema';
import type { Tool } from '../tools/tool';
import { ShortTermMemory } from '../memory/short-term';
import type { MemoryMessage } from '../schema/memory-schema';
import { MemoryManager } from '../memory/memory-manager';
import type {
	EmbeddingProvider,
	EmbeddingProviderConfig
} from '../providers/embedding-providers/base-embedding';
import { OpenAIEmbeddingProvider } from '../providers/embedding-providers/openai-embedding';

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

interface MemoryConfig {
	type: 'short-term' | 'long-term' | 'hybrid';
	dbConnectionString?: string;
	embeddingProvider?: {
		type: 'openai' | 'claude';
		apiKey: string;
		model?: string;
	};
	conversationId?: string;
}

export interface AgentConfig {
	provider: ProviderConfig;
	systemPrompt?: string;
	tools?: Tool[];
	structure?: {
		strict?: boolean;
		maxRetries?: number | 'unlimited';
		debug?: boolean;
	};
	outputSchema?: Schema;
	retries?: number;
	memory?: MemoryConfig;
	tokenLimit?: number;
}

export function createEmbeddingProvider(
	config: EmbeddingProviderConfig & { type: 'openai' | 'claude' }
): EmbeddingProvider {
	switch (config.type) {
		// for now, we only support OpenAI embeddings
		case 'openai':
			return new OpenAIEmbeddingProvider(config);
		default:
			throw new Error('Unsupported embedding provider');
	}
}

// improved tool description
export function describeTool(tool: Tool): string {
	const params = Object.entries(tool.parameters.shape)
		.map(([key, value]) => {
			const zodType = value as z.ZodTypeAny;

			if (zodType._def.typeName === 'ZodEnum') {
				const options = zodType._def.values;
				return `${key}: ${zodType.description || ''} (enum: ${options.join(' | ')})`;
			} else if (zodType._def.typeName === 'ZodArray' || zodType._def.typeName === 'ZodTuple') {
				const innerType =
					zodType._def.typeName === 'ZodArray'
						? zodType._def.type._def.typeName.replace('Zod', '').toLowerCase()
						: 'tuple';
				return `${key}: ${zodType.description || ''} (${innerType})`;
			} else {
				const typeStr = zodType._def.typeName.replace('Zod', '').toLowerCase();
				return `${key}: ${zodType.description || ''} (${typeStr})`;
			}
		})
		.join('\n');

	return `Tool: ${tool.name}
  Description: ${tool.description}
  Parameters (JSON format):{
  ${params}
  }
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
	public memory: ShortTermMemory | MemoryManager;
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

		const initialSystemPrompt = this.buildSystemPrompt(config);
		const tokenLimit = this.config.tokenLimit || 4000;

		this.memory = this.createMemory(config, tokenLimit, initialSystemPrompt);
	}

	private createMemory(
		config: AgentConfig,
		maxContextTokens: number,
		initialSystemPrompt: string
	): ShortTermMemory | MemoryManager {
		const initialMessage = this.createMemoryMessage('system', initialSystemPrompt, {
			type: 'system_prompt',
			priority: 3
		});

		if (!config.memory) {
			return new ShortTermMemory({
				provider: this.provider,
				tokenLimit: maxContextTokens,
				initialMessages: [initialMessage]
			});
		}

		const memoryConfig = config.memory;
		if (memoryConfig.type === 'short-term') {
			return new ShortTermMemory({
				provider: this.provider,
				tokenLimit: maxContextTokens,
				initialMessages: [initialMessage]
			});
		}

		let embeddingProvider: EmbeddingProvider | undefined;

		if (
			(memoryConfig.type === 'long-term' || memoryConfig.type === 'hybrid') &&
			memoryConfig.embeddingProvider &&
			memoryConfig.dbConnectionString
		) {
			embeddingProvider = createEmbeddingProvider({
				type: memoryConfig.embeddingProvider.type,
				apiKey: memoryConfig.embeddingProvider.apiKey,
				model: memoryConfig.embeddingProvider.model
			});

			return new MemoryManager({
				provider: this.provider,
				tokenLimit: maxContextTokens,
				initialMessages: [initialMessage],
				longTerm: {
					enabled: true,
					dbConnectionString: memoryConfig.dbConnectionString,
					embeddingProvider: embeddingProvider,
					conversationId: memoryConfig.conversationId
				}
			});
		}

		// fallback to short-term if configuration is incomplete?
		return new ShortTermMemory({
			provider: this.provider,
			tokenLimit: maxContextTokens,
			initialMessages: [initialMessage]
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

	async retrieveRelevantMemory(query: string, maxTokens: number = 1000): Promise<MemoryMessage[]> {
		if (this.memory instanceof MemoryManager && this.memory.isLongTermEnabled()) {
			return await this.memory.retrieveRelevantHistory(query, maxTokens);
		}
		return this.memory.getMessages();
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

	async getHistory(): Promise<Message[]> {
		const messages = await this.memory.getMessages();
		return messages.map((msg) => ({
			role: msg.role,
			content: msg.content
		}));
	}
}
