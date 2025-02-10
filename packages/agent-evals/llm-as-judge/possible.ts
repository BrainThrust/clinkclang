import { Agent } from "@/agent-core/core";
import { Possible } from "autoevals";

// this is a test to check whether an output is a possible solution to the challenge posed in the input
const OPENAI_API_KEY = "openai_api_key";

async function runPossibleTest() {
    try {
      const agent = new Agent({
        providerName: "openai",
        modelName: "gpt-4o",
        apiKey: OPENAI_API_KEY,
      });
  
      const challenge = "Solve the equation 2x + 3 = 7";
      const output = await agent.generate(challenge);
  
      const result = await Possible({ input: challenge, output, openAiApiKey: OPENAI_API_KEY });
  
      console.log(`Challenge: ${challenge}`);
      console.log(`Agent Output: ${output}`);
      console.log(`Possible Score: ${result.score}`);
      console.log(`Rationale: ${result.metadata?.rationale}`);
    } catch (error) {
      console.error("Possible Test Error:", error);
    }
  }
  
  runPossibleTest();
  