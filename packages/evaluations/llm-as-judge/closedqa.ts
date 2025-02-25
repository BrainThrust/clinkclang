import { ReactAgent } from "../../core/agents/react";
import { ClosedQA } from "autoevals";

const OPENAI_API_KEY = 'openai_api_key';

// testing whether an output answers the input using knowledge built into the model
async function runClosedQA() {
    const agent = new ReactAgent({
        provider: {
            type: "openai",
            apiKey: OPENAI_API_KEY,
            modelName: "gpt-3.5-turbo",
        }
    })

    const input = "What is the capital of India?";
    const output = await agent.generate(input);

    // you can also specify criteria to further constrain the answer
    const criteria = "Answer with just the name of the capital and nothing else.";
    const result = await ClosedQA({ input, output, criteria: criteria, openAiApiKey: OPENAI_API_KEY });
    console.log(`Input: ${input}`);
    console.log(`Output: ${output}`);
    console.log(`ClosedQA Score: ${result.score} | ${result.metadata?.rationale}`);
}

runClosedQA();