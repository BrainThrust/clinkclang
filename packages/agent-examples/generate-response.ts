import { Agent } from "@/agent-core/core";
import { StrategyName } from "packages/agent-strategies/index"; 
import { z } from "zod";

const OPENAI_API_KEY = 'openai_api_key';

async function initAgent(strategy: StrategyName) {
  return new Agent({
    providerName: "openai",
    modelName: "gpt-3.5-turbo", 
    apiKey: OPENAI_API_KEY,
    systemPrompt: "You are a helpful assistant.",
    strategy: strategy,
  });
}

async function testStrategy(strategy: StrategyName, schema?: z.ZodSchema) {
  console.log(`${'-'.repeat(40)}`);
  console.log(`Testing ${strategy.toUpperCase()} strategy`);
  console.log(`${'-'.repeat(40)}\n`);
  
  try {
    const agent = await initAgent(strategy);
    const response = await agent.generate(
      "What's the capital of France?"
    );
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

  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const strategies: StrategyName[] = ["react"];
  
  for (const strategy of strategies) {
    await testStrategy(strategy);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\nALL STRATEGY TESTS COMPLETED");
}

generateResponse().catch(console.error);
