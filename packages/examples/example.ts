import { Agent } from "@/agent-core/core";

async function main() { 
    const openAIAgent = new Agent({
        providerName: "openai",
        apiKey: 'openai_api_key', 
        modelName: "gpt-4o", // can go to 3.5 turbo 
        systemPrompt: "You are an assistant that answers accurately.",
        temperature: 0.2,
      });
    
      const claudeAgent = new Agent({
        providerName: "claude",
        apiKey: 'claude_api_key',
        modelName: "claude-3-opus-20240229",
        version: "2024-01-01"  // must specify version
      });

      const openaiResponse = await openAIAgent.generate("What is the capital of France?");
      console.log("OpenAI:", openaiResponse);
    
      const claudeResponse = await claudeAgent.generate("What is the capital of France?");
      console.log("Claude:", claudeResponse);
}

main().catch(console.error); 