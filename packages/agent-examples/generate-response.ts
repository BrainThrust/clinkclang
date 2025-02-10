import { Agent } from "@/agent-core/core";
import { StrategyName } from "@/agent-strategies/index"; 
import { z } from "zod";
import { ProviderName } from "@/agent-core/core";

const OPENAI_API_KEY = 'openai_api_key';
const DEEPSEEK_API_KEY = 'deepseek_api_key';


async function testStrategy(strategy: StrategyName, provider: ProviderName, schema?: z.ZodSchema) {
  console.log(`${'-'.repeat(40)}`);
  console.log(`Testing ${strategy.toUpperCase()} strategy`);
  console.log(`${'-'.repeat(40)}\n`);
  
  try {
    let agent: Agent;

    if (provider === 'openai') {
      if (!OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY for OpenAI provider");
      }
      agent = new Agent({
        providerName: provider,
        modelName: "gpt-4o",
        apiKey: OPENAI_API_KEY,
        systemPrompt: "You are a helpful assistant.",
        strategy: strategy,
        structure: {
          debug: true,
          maxRetries: 3
        },
        temperature: 0.7,
        retries: 3
      });
    } else if (provider === 'deepseek') {
      if (!DEEPSEEK_API_KEY) {
        throw new Error("Missing DEEPSEEK_API_KEY for DeepSeek provider");
      }
      agent = new Agent({
        providerName: provider,
        modelName: "deepseek-chat", // DeepSeek V3 by default
        apiKey: DEEPSEEK_API_KEY,
        systemPrompt: "You are a helpful assistant.",
        strategy: strategy,
        structure: {
          debug: true,
          maxRetries: 3
        },
        temperature: 0.7,
        retries: 3,
        stream: false // disable streaming
      });
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const response = await agent.generate("What's the capital of France?");
    if (schema) {
      console.log("Structured Response:", JSON.stringify(JSON.parse(response), null, 2));
    } else {
      console.log("Direct Answer:", response);
    }
    
    return true;
  } catch (error) {
    console.error(`[${strategy}] ERROR:`, error instanceof Error ? error.message : error);
    return false;
  }
}

async function generateResponse() {
  console.log("STARTING SIMPLE RESPONSE TEST");
  console.log("=============================\n");

  if (!OPENAI_API_KEY || !DEEPSEEK_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY or DEEPSEEK_API_KEY");
  }

  const providers: ProviderName[] = ['openai', 'deepseek'];
  const strategies: StrategyName[] = ['react'];
  
  for (const provider of providers) {
    for (const strategy of strategies) {
      await testStrategy(strategy, provider);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log("\nALL STRATEGY TESTS COMPLETED");
}

generateResponse().catch(console.error);
