// The core Idea of the agent is to:
// Process natural language inputs
// Automatically select and use tools when needed
// Validate and structure outputs using Zod schemas
// Work with multiple LLM providers (OpenAI, Claude, etc.)
import { z } from "zod";
import { Base } from "@/agent-core/providers/base-provider";
import { OpenAIProvider } from "@/agent-core/providers/openai-provider";
import { ClaudeProvider } from "@/agent-core/providers/claude-provider";
import { Message, ModelResponse, Schema } from "@/agent-core/schema/core-schema";
import { Tool } from "@/agent-tools/tool-interface";
import { StructuredOutputProcessor } from "@/agent-core/schema/output-validator";

export type ProviderName = "openai" | "claude" | "huggingface" | "deepseek";

// the interface defines the structure of the configuration object that you need to pass when creating an Agent instance
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
}

// the idea of this was to generate a human-readable description of a tool so that the model can understand it
function describeTool(tool: Tool): string {
  const params = Object.entries(tool.parameters.shape)
    .map(([key, value]) => {
      const zodType = value as z.ZodTypeAny;
      const type =
        zodType instanceof z.ZodString
          ? "string"
          : zodType instanceof z.ZodNumber
          ? "number"
          : zodType instanceof z.ZodBoolean
          ? "boolean"
          : zodType instanceof z.ZodArray
          ? "array"
          : "object";
      const required = zodType.isOptional() ? "" : " (required)";
      return `${key}: ${type}${required}`;
    })
    .join(", ");

  return `
  Tool Name: ${tool.name}
  Description: ${tool.description}
  Required Parameters: {${params}}
  When to use: Use this tool when you need to ${tool.description.toLowerCase()}
  Example usage: toolCall: ${tool.name}({"parameterName": "example value"})
  `;
}

// this generates a human-readable description of all the tools
function describeTools(tools: Tool[]): string {
  return `Available Tools:\n${tools.map(describeTool).join("\n---\n")}
  To use a tool, respond with: toolCall: toolName({"param1": "value1"})
  `;
}

// the agent class
export class Agent {
  provider: Base;
  systemPrompt?: string;
  history: Message[] = [];
  outputSchema?: Schema;
  retries: number;
  tools: Tool[] = [];
  structuredOutputProcessor: StructuredOutputProcessor;

  constructor(config: AgentConfig) {
    this.provider = this.createProvider(config); // calls the createProvider function to get the provider instance (either OpenAI or Claude)
    this.outputSchema = config.outputSchema; // output schema for structured output
    this.retries = config.retries || 3; // retries set to 3. this is used for structured output.
    this.systemPrompt = config.systemPrompt || ""; // system prompt for the agent
    this.tools = config.tools || []; // array of tools. We need to build a set of default tools for the agent (TODO)
    this.structuredOutputProcessor = new StructuredOutputProcessor(config.structure); // config.structure is from AgentConfig

    // if there are tools, add instructions for using them using describeTools
    if (this.tools.length > 0) {
      const toolInstructions = `
      ${describeTools(this.tools)}
      Instructions for Tool Usage:
      1. When you want to use a tool, respond ONLY with: toolCall: toolName({"param": "value"})
      2. The system will respond with a message starting with "TOOL RESULT [toolName]"
      3. Use these results to formulate your final answer`;      
      this.systemPrompt += toolInstructions;
    }

    // if there is an output schema add instructions to the LLM on how to structure the output using the generatePrompt function
    if (this.outputSchema) {
      const schemaInstructions = this.structuredOutputProcessor.generatePrompt(this.outputSchema.schema);
      this.systemPrompt += `\n\n${schemaInstructions}`;
    }

    if (this.systemPrompt) {
      this.history.push({ role: "system", content: this.systemPrompt });
    }
  }

  // the createProvider function simply creates an instance of the provider class
  createProvider(config: AgentConfig): Base {
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
        throw new Error(`Unknown provider: ${config.providerName}`);
    }
  }


  // this is the core method of the Agent class
  // it handles the interaction with the LLM (sending inputs, tool calls and validating output schema)
  async generate(input: string, schema?: Schema): Promise<string> {

    // the first step is to add the input to the history
    this.history.push({ role: "user", content: input });
    // this line determines whether to use a schema for output validation and also which one
    let outputSchemaToUse = schema || this.outputSchema;
  
    // the idea is that agent will try to generate a valid response up to this.retries
    for (let i = 0; i < this.retries; i++) {

      // get LLM's response - it will either choose a tool or provide a final answer
      const response = await this.provider.generateResponse(this.history);
      // from the llm response, extract the tool call
      const toolCall = this.extractToolCall(response);

      // if there is a tool call then execute the tool
      if (toolCall) {
        const tool = this.tools.find((t) => t.name === toolCall.name);
        if (!tool) {
          throw new Error(`Tool not found: ${toolCall.name}`);
        }
  
        try {
          const toolResult = await tool.execute(toolCall.arguments);
          
          // add tool result to history
          this.history.push({
            role: "assistant",
            content: response.content
          });
  
          // then add tool result to history for LLM to use in next iteration
          this.history.push({
            role: "user",
            content: `TOOL RESULT [${tool.name}]: ${toolResult}`
          });
  
          // then finally continue the conversation
          continue;
        } catch (error) {
          console.error(`Tool execution error:`, error);
          throw error;
        }
      }
  
      // if there is no tool call then the LLM will provide a final answer
      // now once we have a final answer, we need to validate it against the output schema
      if (outputSchemaToUse) {
        try {
          const result = await this.structuredOutputProcessor.parse(
            outputSchemaToUse.schema,
            response.content,
            i
          );
  
          if (result.success) {
            this.history.push({
              role: "assistant",
              content: JSON.stringify(result.data)
            });
            return JSON.stringify(result.data);
          }
  
          if (i < this.retries - 1) {
            this.history.push({
              role: "user",
              content: `Your response needs correction. Errors: ${JSON.stringify(result.errors)}. Please provide a valid response following the schema.`
            });
          }
        } catch (error) {
          if (i === this.retries - 1) throw error;
        }
      } else {
        this.history.push({ role: "assistant", content: response.content });
        return response.content;
      }
    }
  
    throw new Error(`Failed to get valid response after ${this.retries} attempts.`);
  }
  

  // this is a helper method to extract the tool call from the LLM's response using regex
  extractToolCall(response: ModelResponse): { name: string; arguments: any } | null {
    const text = response.content;
    const toolCallRegex = /toolCall:\s*(\w+)\s*\(\s*({.*?})\s*\)/s;
    const match = text.match(toolCallRegex);
  
    if (match) {
      const name = match[1]!; 
      const argsString = match[2]!; 
      if (!name || !argsString) return null;
  
      try {
        const args = JSON.parse(argsString);
        return { name, arguments: args };
      } catch (e) {
        console.error("Failed to parse tool arguments:", e);
        return null;
      }
    }
    return null;
  }
  
  // this is a helper method to get the history
  getHistory(): Message[] {
    return this.history;
  }
}
