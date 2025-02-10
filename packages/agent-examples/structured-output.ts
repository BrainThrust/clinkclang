import { z } from "zod";
import { StrategyName } from "@/agent-strategies/index"; 
import { Agent } from "@/agent-core/core";
import { Schema } from "@/agent-core/schema/core-schema";
import { ProviderName } from "@/agent-core/core";

export const FRAMEWORKS = ["react"] as const;

const OPENAI_API_KEY = 'openai_api_key';
const DEEPSEEK_API_KEY = 'deepseek_api_key';

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

async function testStrategy(provider: ProviderName, strategy: StrategyName) {
  console.log(`${'-'.repeat(40)}`);
  console.log(`Testing ${provider.toUpperCase()} with ${strategy.toUpperCase()} strategy`);
  console.log(`${'-'.repeat(40)}\n`);

  try {
    let agent: Agent;

    if (provider === 'openai') {
      if (!OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY for OpenAI provider");
      }
      agent = new Agent({
        providerName: provider,
        modelName: "gpt-4o",
        apiKey: OPENAI_API_KEY,
        systemPrompt: "You are a helpful assistant.",
        strategy: strategy,
        structure: {
          debug: true,
          maxRetries: 3
        },
        temperature: 0.7,
        retries: 3
      });
      
    } else if (provider === 'deepseek') {
      if (!DEEPSEEK_API_KEY) {
        throw new Error("Missing DEEPSEEK_API_KEY for DeepSeek provider");
      }
      agent = new Agent({
        providerName: provider,
        modelName: "deepseek-chat", // DeepSeek V3 by default
        apiKey: DEEPSEEK_API_KEY,
        systemPrompt: "You are a helpful assistant.",
        strategy: strategy,
        structure: {
          debug: true,
          maxRetries: 3
        },
        temperature: 0.7,
        retries: 3,
        stream: false // disable streaming
      });
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const response = await agent.generate(
      `Provide detailed information about the movie "The Matrix" in EXACTLY this format: 
      ${JSON.stringify(MovieSchema.example, null, 2)}`,
      MovieSchema // schema to validate structure
    );

    console.log(`[${provider}/${strategy}] SUCCESS:`);
    console.log(JSON.stringify(JSON.parse(response), null, 2));

  } catch (error) {
    console.error(`[${provider}/${strategy}] ERROR:`, error instanceof Error ? error.message : error);
  }
}

async function structuredOutput() {
  console.log("STARTING MOVIE SCHEMA TEST");
  console.log("==========================\n");

  const providers: ProviderName[] = ['openai', 'deepseek'];
  const FRAMEWORKS = ["react"] as const;

  if (!OPENAI_API_KEY || !DEEPSEEK_API_KEY) {
    console.error("Missing API keys for one or both providers.");
    process.exit(1);
  }

  for (const provider of providers) {
    for (const strategy of FRAMEWORKS) {
      await testStrategy(provider, strategy);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log("\nALL PROVIDERS AND STRATEGY TESTS COMPLETED");
}

structuredOutput().catch(console.error);

