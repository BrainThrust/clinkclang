import { Agent } from "@/agent-core/core";
import { Battle } from "autoevals";

// this one is unique. this is a test to determine whether an output _better_ performs the `instructions` than the original (expected) value
const OPENAI_API_KEY = "openai_api_key";

async function runBattleTest() {
  try {
    const agent = new Agent({
      providerName: "openai",
      modelName: "gpt-4o",
      apiKey: OPENAI_API_KEY,
    });

    const input = "Generate a motivational quote";
    const output = await agent.generate(input);
    const expected = "Believe in yourself and you can achieve anything";

    const result = await Battle({
      output,
      expected,
      instructions: input, // must include the instructions in the prompt, otherwise the llm will not understand the prompt and will not generate the output correctly
      openAiApiKey: OPENAI_API_KEY
    });

    console.log(`Input: ${input}`);
    console.log(`Output: ${output}`);
    console.log(`Battle Score: ${result.score}`);
    console.log(`Rationale: ${result.metadata?.rationale}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Battle Test Error:", error.message);
    }
  }
}

runBattleTest();