import { ReactAgent } from '../core/agents/react';
import crypto from 'crypto';
import type { MemoryMessage } from '../core/schema/memory-schema';

const OPENAI_API_KEY = 'openai_api_key';

const dbConfig = {
  host: '...',
  port: 5432,
  database: '...',
  user: '...',
  password: '...'
};

const conversationId = crypto.randomUUID();

const agent = new ReactAgent({
  provider: {
    type: "openai",
    apiKey: OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo"
  },
  systemPrompt: `As a customer support agent, you have access to:
- Complete conversation history
- Internal notes and case resolutions
- Shipping and order databases
`,
  structure: {
    debug: true,
    maxRetries: 3,
    strict: true,
  },
  memory: {
    type: "long-term",
    conversationId: conversationId,
    embeddingProvider: {
      type: "openai",
      apiKey: OPENAI_API_KEY
    },
    dbConnectionString: `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
  },
  tools: [],
  tokenLimit: 4000
});

async function addingHistoricalData() {
  const historicalMessages = [
    {
      role: "user",
      content: "I contacted support last month about a damaged shipment (7890)",
      metadata: { type: "historical_case", priority: 1 },
    },
    {
      role: "assistant", 
      content: "We processed a replacement for order 7890 on May 20th and issued a 15% refund",
      metadata: { type: "resolution", case_id: "7890" },
    },
    {
      role: "system",
      content: "Customer has a history of delayed shipments - priority support required",
      metadata: { type: "internal_note" },
    }
  ];

  for (const msg of historicalMessages) {
    await agent.memory.addMessage({
      role: msg.role as MemoryMessage['role'],
      content: msg.content,
      metadata: msg.metadata,
    });
  }
}


async function runLongTermMemory() {
  console.log("--- Customer Support Session 2 (Same conversation ID) ---\n");
  
  console.log("Customer: What was the resolution for my previous case 7890?");
  const response1 = await agent.generate("What was the resolution for my previous case 7890?");
  console.log(`Support: ${response1}`);

  console.log("\nCustomer: I'm worried this order might also get delayed");
  const response2 = await agent.generate("I'm worried this order might also get delayed");
  console.log(`Support: ${response2}`);

  const memory = agent.memory;
  const tokenUsage = memory.getTokenUsage();
  const messageCount = await memory.getMessages();
  console.log("\n--- Memory Stats ---");
  console.log(`Total messages: ${messageCount.length}`);
  console.log(`Token usage: ${tokenUsage}`);
}

async function demonstrateLongTermMemory() {
  await addingHistoricalData();
  await runLongTermMemory();
}

demonstrateLongTermMemory();
