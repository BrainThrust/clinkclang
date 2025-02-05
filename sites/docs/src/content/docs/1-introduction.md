---
layout: githubMarkdownLight
title: Introduction
date: '2025-01-27'
description: 'Introduction to the Agent Docs'
---
# Introduction

This is the introduction to the Agent Docs.


### Agent Core

The Agent Core is a flexible system that enables integration with various AI providers and frameworks while managing conversation flow and tool usage.


##### Overview

```
User Input → Agent → Framework → Provider → Model → Framework → Tool Execution → Final Output
```

##### Creating an Agent

To create a new agent, use the `Agent` class with a configuration object

```typescript
const agent = new Agent({
  providerName: "openai", // or "claude", "huggingface", "deepseek"
  modelName: "gpt-4",
  apiKey: "your-api-key",
  // Optional parameters
  temperature?: number,
  systemPrompt?: string,
  maxTokens?: number,
  version?: string,
  tools?: Tool[],
  structure?: {
    strict?: boolean,
    maxRetries?: number,
    debug?: boolean
  },
  outputSchema?: Schema,
  retries?: number,
  strategy?: StrategyName
});
```

### Configuration Options

| Parameter    | Type         | Required | Description                                                        |
| ------------ | ------------ | -------- | ------------------------------------------------------------------ |
| providerName | ProviderName | Yes      | AI provider to use ("openai", "claude", "huggingface", "deepseek") |
| modelName    | string       | Yes      | Name of the model to use                                           |
| apiKey       | string       | Yes      | API key for the selected provider                                  |
| temperature  | number       | No       | Controls randomness in responses                                   |
| systemPrompt | string       | No       | Initial system prompt for the conversation                         |
| maxTokens    | number       | No       | Maximum tokens in response                                         |
| version      | string       | No       | Provider API version (if applicable)                               |
| tools        | Tool[]       | No       | Array of tools available to the agent                              |
| structure    | object       | No       | Configuration for structured output                                |
| outputSchema | Schema       | No       | Schema for validating outputs                                      |
| retries      | number       | No       | Number of retries for failed requests                              |
| strategy     | StrategyName | No       | Strategy to use ("react" or "reflexion")                           |

##### Providers

The Agent Core supports multiple AI providers through a provider interface. Each provider implements the Base class:

```typescript
abstract class Base {
  protected config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  abstract generateResponse(
    messages: Message[],
    tools?: any[] 
  ): Promise<ModelResponse>;
}
```

##### Supported Providers

Currently supported providers

- OpenAI
- Claude
- DeepSeek

##### Adding a New Provider

To add a new provider

1. Create a new provider class that extends the Base class
2. Implement the required `generateResponse` method
3. Add the provider name to the ProviderName type

```typescript
export class CustomProvider extends Base {
  async generateResponse(
    messages: Message[],
    tools?: any[]
  ): Promise<ModelResponse> {
    // Implementation here
  }
}
```

##### Tools

Tools can be added to extend the agent's capabilities. Each tool must implement the Tool interface:

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (args: any) => Promise<any>;
}
```

Tools are automatically described to the model in a formatted way:

```
Tool Name: [name]
Description: [description]
Parameters: {param1: type, param2: type}
Usage: toolCall: toolName({"param": "value"})
```

##### Frameworks

The Agent Core supports different frameworks for processing:

- ReAct: Reasoning and Acting framework
- Reflexion: Self-reflective framework

The framework can be specified in the agent configuration using the `strategy` parameter.

##### Usage Example

```typescript
// Create an agent with OpenAI
const agent = new Agent({
  providerName: "openai",
  modelName: "gpt-4",
  apiKey: process.env.OPENAI_API_KEY,
  tools: [myCustomTool],
  strategy: "react"
});

// Generate a response
const response = await agent.generate("What's the weather like?");
```

For more examples, check the examples directory in the repository.
