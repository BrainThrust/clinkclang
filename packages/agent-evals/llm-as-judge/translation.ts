import { Agent } from "@/agent-core/core";
import { Translation } from "autoevals";

// this is a test to determine whether an `output` is as good of a translation of the `input` in the specified `language` as an expert
const OPENAI_API_KEY = "openai_api_key";

async function runTranslationTest() {
  try {
      const agent = new Agent({
      providerName: "openai",
      modelName: "gpt-4o",
      apiKey: OPENAI_API_KEY,
    });

    // english -> french
    const input = "Translate 'Goodbye' to French";
    const expected = "Au revoir";
    const language = "fr";

    const output = await agent.generate(input);

    const result = await Translation({
      output: output,
      expected: expected,
      language: language,
      input: "Goodbye",
      openAiApiKey: OPENAI_API_KEY
    });

    console.log(`Original Text: Goodbye`);
    console.log(`Target Language: French`);
    console.log(`Agent Output: ${output}`);
    console.log(`Expected Translation: ${expected}`);
    console.log(`Translation Score: ${result.score}`);
    console.log(`Rationale: ${result.metadata?.rationale}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Translation Test Error:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
}

runTranslationTest();