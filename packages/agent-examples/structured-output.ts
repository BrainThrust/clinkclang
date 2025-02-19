import { Agent } from '@/agent-core/core';
import { z } from 'zod';

const OPENAI_API_KEY = 'openai_api_key';

const BookSchema = z.object({
  title: z.string().describe("Title of the book"),
  author: z.string().describe("Author's full name"),
  year: z.number().int().min(1800).max(new Date().getFullYear()),
  genre: z.enum(["fiction", "non-fiction", "biography", "science"]),
  rating: z.number().min(1).max(5).describe("1-5 star rating"),
  awards: z.array(z.string()).optional()
});

const agent = new Agent({
  provider: {
    type: "openai",
    apiKey: OPENAI_API_KEY,
    modelName: "gpt-4o",
    temperature: 0.5
  },
  systemPrompt: "You're a professional book recommender",
  outputSchema: { 
    name: "BookSchema",
    schema: BookSchema 
  },
  strategy: "react",
  structure: {
    debug: true, 
    maxRetries: 3, // need to add this to the config to customize
    strict: true
  }
});

async function recommendBook() {
  try {
    const response = await agent.generate(
      "Recommend a groundbreaking science fiction book about space exploration"
    );
    
    const parsed = BookSchema.parse(JSON.parse(response));
    
    console.log("\nRecommended Book:");
    console.log(parsed);
    if(parsed.awards) console.log(`Awards: ${parsed.awards.join(', ')}`);
    
  } catch (error) {
    console.error("Recommendation failed:", error instanceof Error ? error.message : error);
  }
}

recommendBook();
