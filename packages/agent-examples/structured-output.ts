import { z } from "zod";
import { StrategyName } from "packages/agent-strategies/index"; 
import { Agent } from "@/agent-core/core";
import { Schema } from "@/agent-core/schema/core-schema";

export const FRAMEWORKS = ["react"] as const;

const OPENAI_API_KEY = 'openai_api_key';

const MovieSchema: Schema = {
  name: "Movie",
  schema: z.object({
    title: z.string(),
    year: z.number().int().min(1900).max(new Date().getFullYear()),
    genre: z.array(z.enum([
      "Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Documentary"
    ])),
    director: z.object({
      name: z.string(),
      nationality: z.string().optional()
    }),
    actors: z.array(z.string()).min(3),
    ratings: z.object({
      imdb: z.number().min(0).max(10),
      rottenTomatoes: z.number().min(0).max(100)
    })
  }),
  example: {
    title: "Inception",
    year: 2010,
    genre: ["Action", "Sci-Fi"],
    director: {
      name: "Christopher Nolan",
      nationality: "British-American"
    },
    actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
    ratings: {
      imdb: 8.8,
      rottenTomatoes: 87
    }
  }
};

async function testStrategy(strategy: StrategyName) {
  console.log(`${'-'.repeat(40)}`);
  console.log(`Testing ${strategy.toUpperCase()} strategy`);
  console.log(`${'-'.repeat(40)}\n`);

  try {
    const agent = new Agent({
      providerName: "openai",
      modelName: "gpt-4o",
      apiKey: OPENAI_API_KEY,
      strategy: strategy,
      structure: {
        debug: true,
        maxRetries: 3
      },
      temperature: 0.7,
      retries: 3
    });

    const response = await agent.generate(
      `Provide detailed information about the movie "The Matrix" in EXACTLY this format: 
      ${JSON.stringify(MovieSchema.example, null, 2)}`,
      MovieSchema
    );

    console.log(`[${strategy}] SUCCESS:`);
    console.log(JSON.stringify(JSON.parse(response), null, 2));
   
  } catch (error) {
    console.error(`[${strategy}] ERROR:`, error instanceof Error ? error.message : error);
  }
}

async function structuredOutput() {
  console.log("STARTING MOVIE SCHEMA TEST");
  console.log("==========================\n");

  if (!OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY environment variable");
    process.exit(1);
  }

  for (const strategy of FRAMEWORKS) {
    await testStrategy(strategy);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\nALL STRATEGY TESTS COMPLETED");
}

structuredOutput().catch(console.error);
