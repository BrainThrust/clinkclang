import { Agent } from "../agent-core/core";
import { z } from "zod";

async function generateResponseTest() { 
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

      try {
        const openaiResponse = await openAIAgent.generate(
          "What is the capital of France?"
        );
        console.log("OpenAI:", openaiResponse);
      } catch (error) {
        console.error("Error generating response from OpenAI:", error); 
      }
        
      const claudeResponse = await claudeAgent.generate("What is the capital of France?");
      console.log("Claude:", claudeResponse);
}


async function structuredOutputTest() {
    const agent = new Agent({
        providerName: "openai",
        apiKey: 'openai_api_key',
        modelName: "gpt-4o",
        systemPrompt: "You are a helpful assistant that provides accurate structured data.",
        temperature: 0.2,
        structure: {
            strict: true,
            maxRetries: 3,
            debug: true
        }
    });

    // Example 1 - Simple object
    const userSchema = z.object({
        name: z.string(),
        age: z.number().min(0).max(150),
        interests: z.array(z.string()).min(1)
    });

    console.log("\n User Profile");
    const userResult = await agent.generateStructured(
        "Create a profile for a typical software developer",
        userSchema
    );
    console.log("User Profile:", userResult);

    // Example 2 - Lengthy nested object
    const surveySchema = z.object({
        responses: z.array(z.object({
            questionId: z.number().int(),
            answer: z.string(),
            confidence: z.number().min(0).max(100),
            followUp: z.string().optional()
        })).min(2),
        metadata: z.object({
            completionTime: z.number().positive(),
            valid: z.boolean(),
            qualityScore: z.number().min(0).max(10)
        })
    });

    console.log("\nSurvey Response");
    const surveyResult = await agent.generateStructured(
        "Generate a survey response about user satisfaction with a mobile app",
        surveySchema
    );
    console.log("Survey Response:", surveyResult);
}


// Run the tests
// Generate response
generateResponseTest().catch(console.error); 

// Generate Structured output response
structuredOutputTest().catch(console.error);
