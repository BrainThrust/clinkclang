// new agent core
// allows for plugging in different providers
// allows for implementing different frameworks
// provides function to call tools
// manages conversation flow and tool usage
// User Input → Agent → Framework → Provider → Model → Framework → Tool Execution → Final Output

import { z } from "zod";
import { Base } from "./providers/base-provider";
import { OpenAIProvider } from "./providers/openai-provider";
import { ClaudeProvider } from "./providers/claude-provider";
import { Message, ModelResponse, Schema } from "./schema/core-schema";
import { Tool } from "../agent-tools/tool-interface";
import { StructuredOutputProcessor } from "./schema/output-validator";
import { StrategyName, ReActStrategy, ReflexionStrategy } from "packages/agent-strategies/index";

export type ProviderName = "openai" | "claude" | "huggingface" | "deepseek";

// config for the agent that defines what can be passed in to the agent
export interface AgentConfig {
  providerName: ProviderName;
  modelName: string;
  apiKey: string;
  temperature?: number;
  systemPrompt?: string;
  maxTokens?: number;
  version?: string;
  tools?: Tool[];
  structure?: {
    strict?: boolean;
    maxRetries?: number;
    debug?: boolean;
  };
  outputSchema?: Schema;
  retries?: number;
  strategy?: StrategyName;
}

// function to describe a tool
export function describeTool(tool: Tool): string {
  const params = Object.entries(tool.parameters.shape)
    .map(([key, value]) => {
      const zodType = value as z.ZodTypeAny;
      const type = zodType instanceof z.ZodString ? "string" :
        zodType instanceof z.ZodNumber ? "number" :
        zodType instanceof z.ZodBoolean ? "boolean" :
        zodType instanceof z.ZodArray ? "array" : "object";
      return `${key}: ${type}${zodType.isOptional() ? "" : " (required)"}`;
    })
    .join(", ");

  return `
  Tool Name: ${tool.name}
  Description: ${tool.description}
  Parameters: {${params}}
  Usage: toolCall: ${tool.name}({"param": "value"})
  `;
}

// function to describe all tools so that the LLM can decide which tool to use
export function describeTools(tools: Tool[]): string {
  return `Available Tools:\n${tools.map(describeTool).join("\n---\n")}`;
}

// agent class
export class Agent {
  public provider: Base;
  public systemPrompt?: string;
  public history: Message[] = [];
  public outputSchema?: Schema;
  public retries: number;
  public tools: Tool[] = [];
  public structuredOutputProcessor: StructuredOutputProcessor;
  private activeFramework?: ReActStrategy | ReflexionStrategy;

  // constructor
  constructor(config: AgentConfig) {
    this.provider = this.createProvider(config);
    this.outputSchema = config.outputSchema;
    this.retries = config.retries || 3;
    this.systemPrompt = config.systemPrompt || "";
    this.tools = config.tools || [];
    this.structuredOutputProcessor = new StructuredOutputProcessor(config.structure);

    // add tools to system prompt if there are any
    if (this.tools.length > 0) {
      const toolsDescription = describeTools(this.tools);
      this.systemPrompt += `\n${describeTools(this.tools)}\nInstructions:\n1. Use toolCall format\n2. Wait for TOOL RESULT`;
    }

    // add output schema to system prompt if there is one. this will be used to validate the output
    if (this.outputSchema) {
      this.systemPrompt += `\n${this.structuredOutputProcessor.generatePrompt(this.outputSchema.schema)}`;
    }

    // if there is a system prompt, add it to the history
    if (this.systemPrompt) {
      this.history.push({ role: "system", content: this.systemPrompt });
    }

    // initialize framework
    this.initializeFramework(config.strategy);
  }

  
  // initialize framework if there is one specified, else switch to default
  private initializeFramework(framework?: StrategyName) {
    switch (framework) {
      case "react":
        this.activeFramework = new ReActStrategy(this, this.structuredOutputProcessor);
        break;
      case "reflexion":
        this.activeFramework = new ReflexionStrategy(this, this.structuredOutputProcessor);
        break;
      default:
        // set default to the react framework
        this.activeFramework = new ReActStrategy(this, this.structuredOutputProcessor);
    }
  }

  // create provider instance to communicate
  private createProvider(config: AgentConfig): Base {
    switch (config.providerName) {
      case "openai":
        return new OpenAIProvider({
          apiKey: config.apiKey,
          modelName: config.modelName,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          systemPrompt: this.systemPrompt,
        });
      case "claude":
        return new ClaudeProvider({
          apiKey: config.apiKey,
          modelName: config.modelName,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          version: config.version,
          systemPrompt: this.systemPrompt,
        });
      default:
        throw new Error(`Unsupported provider: ${config.providerName}`);
    }
  }


  // generate function
  async generate(input: string, schema?: Schema): Promise<string> {
    if (!this.activeFramework) {
      throw new Error("Agent framework not initialized");
    }
    // this is built within each framework to allow for customization. because each framework is different in the way they receive and output answer
    return this.activeFramework.execute(input, schema?.schema);
  }

  // simple regex that parses response for tool call
  extractToolCall(response: ModelResponse): { name: string; arguments: any } | null {
    const text = response.content;
    const toolCallRegex = /toolCall:\s*(\w+)\s*\(\s*({.*?})\s*\)/s;
    const match = text.match(toolCallRegex);

    if (match?.[1] && match?.[2]) {
      try {
        return {
          name: match[1],
          arguments: JSON.parse(match[2])
        };
      } catch (e) {
        console.error("Tool argument parsing failed:", e);
      }
    }
    return null;
  }

  // get history
  getHistory(): Message[] {
    return [...this.history];
  }

  // get config
  get config() {
    return {
      retries: this.retries,
      tools: this.tools,
      outputSchema: this.outputSchema,
      structure: this.structuredOutputProcessor.config
    };
  }
};

