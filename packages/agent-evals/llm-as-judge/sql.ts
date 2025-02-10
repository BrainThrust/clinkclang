import { Agent } from "@/agent-core/core";
import { Sql } from "autoevals";

// The idea is to test whether an SQL query is semantically the same as a reference (output) query.
const OPENAI_API_KEY = "openai_api_key";

async function runSQLTest() {
  try {
    const agent = new Agent({
      providerName: "openai",
      modelName: "gpt-4o",
      apiKey: OPENAI_API_KEY,
    });

    // SQL query generation
    const prompt = "Write a SQL query to select users older than 30";
    const expectedQuery = "SELECT * FROM users WHERE age > 30;";
    const output = await agent.generate(prompt);

    const result = await Sql({
      input: prompt,
      expected: expectedQuery,
      output,
      openAiApiKey: OPENAI_API_KEY
    });

    console.log(`Prompt: ${prompt}`);
    console.log(`Agent Output: ${output}`);
    console.log(`Expected Query: ${expectedQuery}`);
    console.log(`Score: ${result.score}`);
    console.log(`Rationale: ${result.metadata?.rationale}`);
  } catch (error) {
    console.error("SQL Test Error:", error);
  }
}

runSQLTest();