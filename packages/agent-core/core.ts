import { z } from 'zod';
import { BaseProvider } from '@/agent-core/providers/base-provider';
import { OpenAIProvider } from '@/agent-core/providers/openai-provider';
import { ClaudeProvider } from '@/agent-core/providers/claude-provider';
import { DeepSeekProvider } from '@/agent-core/providers/deepseek-provider';
import { Message, ModelResponse, Schema } from './schema/core-schema';
import { Tool } from '@/agent-tools/tool-interface';
import { StrategyName, ReActStrategy, ReflexionStrategy } from '@/agent-strategies/index';
import { ShortTermMemory } from '@/agent-core/memory/short-term';

// TODO: refactoring folder structure
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
		maxRetries?: number | 'unlimited'; // allowing 'unlimited' as an option
		debug?: boolean;
		maxContextTokens?: number;
	};
	outputSchema?: Schema;
	retries?: number;
	strategy?: StrategyName;
}

const providerMap = {
	openai: OpenAIProvider,
	claude: ClaudeProvider,
	deepseek: DeepSeekProvider
};

const strategyMap = {
	react: ReActStrategy,
	reflexion: ReflexionStrategy
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

export class Agent {
	public provider: BaseProvider;
	public history: Message[] = [];
	private activeFramework: ReActStrategy | ReflexionStrategy;
	public tools: Tool[];
	public config: AgentConfig; // keeping full config type
	public memory: ShortTermMemory; // shared memory

	constructor(config: AgentConfig) {
		this.config = {
			...config,
			structure: {
				debug: config.structure?.debug ?? false,
				maxRetries: config.structure?.maxRetries ?? 3,
				strict: config.structure?.strict ?? false
			}
		};

		this.history = [
			{
				role: 'system',
				content: this.buildSystemPrompt(config)
			}
		];

		this.tools = config.tools || [];
		this.provider = new providerMap[config.provider.type](config.provider);
		this.activeFramework = new strategyMap[config.strategy || 'react'](this);
		const maxContextTokens = this.config.structure?.maxContextTokens || 4000; // default max context tokens
		this.memory = new ShortTermMemory(maxContextTokens); // initialize memory
		const initialSystemPrompt = this.buildSystemPrompt(config);
		this.memory.addContent(initialSystemPrompt, 'system', 3); // 3 means high priority
	}

	private buildSystemPrompt(config: AgentConfig): string {
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

	async generate(input: string): Promise<string> {
		const schema = this.config.outputSchema;
		return this.activeFramework.execute(input, schema?.schema);
	  }
	
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
		// memory back into an array of {role, content} to replicate old usage
		const sections = this.memory.getMemorySections();
		return sections
		  .filter(sec => sec.type === 'history' || sec.type === 'system')
		  .map(sec => ({
			role: sec.type === 'system' ? 'system' : 'user',
			content: sec.content
		  }));
	  }
}
