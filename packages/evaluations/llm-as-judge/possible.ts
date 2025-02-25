import { ReactAgent } from "../../core/agents/react";
import { Possible } from "autoevals";

// this is a test to check whether an output is a possible solution to the challenge posed in the input
const OPENAI_API_KEY = 'openai_api_key';

async function runPossibleTest() {
    try {
      const agent = new ReactAgent({
        provider: {
          type: "openai",
          apiKey: OPENAI_API_KEY,
          modelName: "gpt-3.5-turbo",
        },
      })
  
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
  