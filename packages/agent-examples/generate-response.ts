import { Agent, AgentConfig } from "@/agent-core/core";

const config: AgentConfig = {
  providerName: "openai",
  modelName: "gpt-4o",
  apiKey: 'openai_api_key', 
  systemPrompt: "You are a helpful assistant."
};

async function generateResponse(input: string): Promise<string> {
  const agent = new Agent(config);
  const response = await agent.generate(input);
  return response;
}

// calling the function 
(async () => {
  try {
    const response = await generateResponse("Hi, how are you?");
    console.log("Response:", response);
  } catch (error) {
    console.error("Error:", error);
  }
})();