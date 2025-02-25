import { ReactAgent } from '../core/agents/react';

const OPENAI_API_KEY = 'openai_api_key';

const agent = new ReactAgent({
  provider: {
      type: "openai",
      apiKey: OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo"
  },
  systemPrompt: "You're a helpful assistant",
  structure: {
      debug: true,
      maxRetries: 3,
      strict: true,
  },
  tools: []
});

async function testSimpleQA() {
  const response = await agent.generate("What is the capital of France?");
  console.log("Simple QA Test:");
  console.log(response);
}

testSimpleQA();