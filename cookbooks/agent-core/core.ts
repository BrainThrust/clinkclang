// BRIAN'S COMMENTS
// Build the foundation of the agent-core

// agentjo has their strictjson
// openai has structured outpus
// form of `structured outputs` for clinkclang

// Requirements:
// Use multiple models
// Use structured outputs
// No lockin to big models

// Inspiration:
// https://github.com/tanchongmin/strictjson

// Build from zod:
// https://zod.dev/

// Take in either XML or JSON

// Define the agent-core - central system that handles communication between your UI and various AI models?
// Goals for now: - takes inputs (XML or JSON) - format it and input it to agent - gets responses from the agent - formats those responses into structured outputs
// Let's break it down:
// Tasks to do:
// 1. Core Interface to handle multiple models
// 2. Input Handler
// 3. Output Formatter (Structured Output)

import { Base } from "./providers/base-provider";
import { OpenAIProvider } from "./providers/openai-provider";
import { ClaudeProvider } from "./providers/claude-provider";
import { Message, ModelConfig, ModelResponse } from "./schema/base";

export type ProviderName = "openai" | "claude" | "huggingface" | "deepseek";

export interface AgentConfig {
  providerName: ProviderName;
  modelName: string;
  apiKey: string;
  temperature?: number;
  systemPrompt?: string;
  maxTokens?: number;
}

export class Agent {
  provider: Base;
  systemPrompt?: string;
  history: Message[] = [];
  constructor(config: AgentConfig) {
    this.provider = this.createProvider(config);
    this.systemPrompt = config.systemPrompt || "";
    if (this.systemPrompt) {
      this.history.push({ role: "system", content: this.systemPrompt });
    }
  }

  createProvider(config: AgentConfig): Base {
    switch (config.providerName) {
      case "openai":
        return new OpenAIProvider({
          apiKey: config.apiKey,
          modelName: config.modelName,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        });

      case "claude":
        return new ClaudeProvider({
          apiKey: config.apiKey,
          modelName: config.modelName,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        });

      default:
        throw new Error(`Unknown provider: ${config.providerName}`);
    }
  }

  async generate(input: string): Promise<string> {
    this.history.push({ role: "user", content: input });
    const response = await this.provider.generateResponse(this.history);
    this.history.push({ role: "assistant", content: response.content });
    return response.content;
  }

  getHistory(): Message[] {
    return this.history;
  }
}
