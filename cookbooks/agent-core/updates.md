# Updates

---

## 16th January 2025

### Overview

The agent core provides:

- Support for two LLM providers (OpenAI, Claude)
- Built-in message history tracking

### File Structure

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

### The Core Components

##### Agent Class (core.ts)

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

##### Base Provider (providers/base-provider.ts)

Abstract class defining the interface for model providers.

```typescript
abstract class Base {
    abstract generateResponse(messages: Message[]): Promise<ModelResponse>;
}
```

##### Configuration Types (schema/base.ts)

Type definitions for messages, configurations, and responses.

```typescript
interface ModelConfig {
  apiKey: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}
```

### Usage Example

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

### Running Examples

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

### Upcoming Updates

- Additional model providers (DeepSeek)
- XML/JSON input handling
- Structured output formatting
- Cost tracking
- Questions for Integration

---

## 17th January 2025

### **Overview**

The agent-core now supports generating structured JSON output that fits to user-defined Zod schema

### **Process Flow**

1. **Prompt Generation**  - The `Agent` uses `PromptBuilder` (`prompts/prompt-builder.ts`) to create a detailed prompt that instructs the modell to JSON that sticks to the provided schema.
2. **JSON Extraction** - The `StructuredOutputParser` (`utils/structured-output-parser.ts`) extracts a JSON object from the raw model response using its `extractJSON` method
3. **Schema Validation** - The extracted JSON is validatedt using the Zod schema using the `parse` method.
4. **Retry Mechanism** - If validation fails, there is a max retries option (configured in `AgentConfig`) where the system tries again until it hits the maximum retires to get a valid output.

### **Example Usage**

```typescript


// In example.ts:
import { Agent } from "../core"; // Adjust path if needed
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  age: z.number().min(0).max(150),
  interests: z.array(z.string()).min(1)
});

const agent = new Agent({
  providerName: "openai",
  apiKey: "YOUR_OPENAI_API_KEY", // **REPLACE WITH YOUR API KEY**
  modelName: "gpt-4o",
  systemPrompt: "You are a helpful assistant that provides accurate structured data.",
  temperature: 0.2,
  structure: {
    strict: true,
    maxRetries: 3,
    debug: true
  }
});

async function main() {
  try {
      const userResult = await agent.generateStructured(
          "Create a profile for a typical software developer",
          userSchema
      );
      console.log("User Profile:", userResult);
  } catch (error) {
      console.error("Error:", error);
  }
}

main();
```

### File Structure

```
agent-core/
├── providers/         # (LLM provider implementations)
│   ├── base-provider.ts
│   ├── claude-provider.ts
│   └── openai-provider.ts
├── schema/            # (Base types for providers)
│   └── base.ts
├── prompts/           # (Prompt generation logic)
│   └── prompt-builder.ts
├── utils/             # (Utility functions and classes)
│   └── structured-output-parser.ts
├── types/             # (Type definitions)
│   └── structured-output.ts
├── examples/
│   └── example.ts     # (Example usage of the Agent)
└── core.ts            # (Agent class, updated to use new structure)
```

---
