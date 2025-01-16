import { Agent } from "../core";

async function main() { 
    const openAIAgent = new Agent({
        providerName: "openai",
        apiKey: 'openai_api_key', 
        modelName: "gpt-4o", // can go to 3.5 turbo 
        systemPrompt: "You are aan assistant that answers accurately.",
        temperature: 0.2,
      });
    
      const claudeAgent = new Agent({
        providerName: "claude",
        apiKey: 'claude_api_key', 
        modelName: "claude-3-opus-20240229", // have to test claude since I don't have access to an api_key
        systemPrompt: "You are a helpful assistant that answers accurately.",
        temperature: 0.2,
        maxTokens: 200, 
      });
    
      const openaiResponse = await openAIAgent.generate("What is the capital of France?");
      console.log("OpenAI:", openaiResponse);
    
      const claudeResponse = await claudeAgent.generate("What is the capital of France?");
      console.log("Claude:", claudeResponse);
}

main().catch(console.error); 