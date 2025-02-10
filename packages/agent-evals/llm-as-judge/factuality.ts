import { Agent } from "@/agent-core/core";
import { Factuality } from "autoevals";

// this is a test to determine whether an output is factual, compared to an original (`expected`) value
const OPENAI_API_KEY = "openai_api_key";

async function runFactualityTest() {
    const agent = new Agent({ providerName: "openai", apiKey: OPENAI_API_KEY, modelName: "gpt-4o" });
    const input = "What is the capital of India?";
    const output = await agent.generate(input);
    const expected = "New Delhi";
    const result = await Factuality({ input, output, expected, openAiApiKey: OPENAI_API_KEY });
    console.log(`Input: ${input}`);
    console.log(`Output: ${output}`);
    console.log(`Factuality Score: ${result.score} | ${result.metadata?.rationale}`);
}

runFactualityTest();