import { Agent } from "@/agent-core/core";
import { Humor } from "autoevals";

// check if output is funny
const OPENAI_API_KEY = "openai_api_key";

async function runHumorTest() {
  try {
    const agent = new Agent({
      providerName: "openai",
      modelName: "gpt-4o",
      apiKey: OPENAI_API_KEY,
    });

    // funny content
    const input1 = "Tell me a funny joke about coding";
    const output1 = await agent.generate(input1);

    // unfunny content
    const input2 = "Explain the concept of quantum computing";
    const output2 = await agent.generate(input2);

    const result1 = await Humor({ output: output1, openAiApiKey: OPENAI_API_KEY });
    const result2 = await Humor({ output: output2, openAiApiKey: OPENAI_API_KEY });

    console.log(`Input: ${input1}`);
    console.log(`Output: ${output1}`);
    console.log(`Humor Score: ${result1.score}`);
    console.log(`Rationale: ${result1.metadata?.rationale}`);

    console.log(`Input: ${input2}`);
    console.log(`Output: ${output2}`);
    console.log(`Humor Score: ${result2.score}`);
    console.log(`Rationale: ${result2.metadata?.rationale}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
}

runHumorTest();
