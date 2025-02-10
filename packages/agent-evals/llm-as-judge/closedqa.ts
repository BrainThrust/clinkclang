import { Agent } from "@/agent-core/core";
import { ClosedQA, Factuality } from "autoevals";

// test whether an output answers the input using knowledge built into the model
const OPENAI_API_KEY = "openai_api_key";

async function runClosedQATest() {
    const agent = new Agent({ providerName: "openai", apiKey: OPENAI_API_KEY, modelName: "gpt-4o" });
    const input = "What is the capital of France?";
    const output = await agent.generate(input);
    const result = await ClosedQA({ input, output, expected: "Paris", criteria: "The answer should be a single city name and nothing more", openAiApiKey: OPENAI_API_KEY }); 
    console.log(`Input: ${input}`);
    console.log(`Output: ${output}`);
    console.log(`ClosedQA Score: ${result.score} | ${result.metadata?.rationale}`);
}

runClosedQATest();