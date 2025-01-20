# Updates

## Overview

The agent core provides:

- Support for two LLM providers (OpenAI, Claude)
- Built-in message history tracking

---

## File Structure

```
agent-core/
├── providers/
│   ├── base-provider.ts
│   ├── openai-provider.ts
│   └── claude-provider.ts
├── schema/
│   └── base.ts
├── examples/
│   └── example.ts
└── core.ts
```

---

## The Core Components

### Agent Class (core.ts)

The main class that handles model interactions and message history.

```typescript
const agent = new Agent({
  providerName: "openai",
  apiKey: "your_api_key",
  modelName: "gpt-4o",
  systemPrompt: "You are an assistant.",
  temperature: 0.2
});
```

### Base Provider (providers/base-provider.ts)

Abstract class defining the interface for model providers.

```typescript
abstract class Base {
    abstract generateResponse(messages: Message[]): Promise<ModelResponse>;
}
```

### Configuration Types (schema/base.ts)

Type definitions for messages, configurations, and responses.

```typescript
interface ModelConfig {
  apiKey: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}
```

---

## Usage Example

```typescript
import { Agent } from "../core";

async function main() {
    const openAIAgent = new Agent({
        providerName: "openai",
        apiKey: 'openai_api_key',
        modelName: "gpt-4o",
        systemPrompt: "You are an assistant.",
        temperature: 0.2,
    });

    const response = await openAIAgent.generate("What is the capital of France?");
    console.log(response);

    const history = openAIAgent.getHistory();
}
```

## Running Examples

1. Install Typescript if not already

```bash
npm install -g typescript
```

2. Compile

```bash
tsc example.ts
```

3. Run the compiled

```bash
node example.js
```

---

## Upcoming Updates

- Additional model providers (DeepSeek)
- XML/JSON input handling
- Structured output formatting
- Cost tracking
- Questions for Integration
