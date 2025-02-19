import { Agent } from '@/agent-core/core';

const OPENAI_API_KEY = 'openai_api_key';

const agent = new Agent({
    provider: {
      type: "openai",
      apiKey: OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo"
    },
    systemPrompt: "You're a helpful assistant",
    strategy: "react",
    structure: {
      debug: true, 
      maxRetries: 3, // need to add this to the config to customize
      strict: true
    }
  });

async function testSimpleQA() {
  const response = await agent.generate("What is the capital of France?");
  console.log("Simple QA Test:");
  console.log(response);
}

testSimpleQA();