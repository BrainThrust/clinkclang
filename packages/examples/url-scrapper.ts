import { z } from "zod";
import { ReactAgent } from '../core/agents/react';
import { WebScraperTool } from "../core/tools/web-scrapper";

const OPENAI_API_KEY = 'openai_api_key';

const IMFAnalysisSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]), 
  keyPeople: z.array(
    z.object({
      name: z.string(),
      role: z.string().optional(),
    })
  ),
  countryGrowth: z.record(z.number())
});

const agent = new ReactAgent({
	provider: {
		type: 'openai',
		apiKey: OPENAI_API_KEY,
		modelName: 'gpt-4o',
		temperature: 0
	},
	tools: [new WebScraperTool()],
	structure: {
		debug: true,
		maxRetries: 3,
	},
  outputSchema: { 
    name: "IMFAnalysisSchema",
    schema: IMFAnalysisSchema
  },
});

export async function analyzeIMFReport(url: string) {
  try {
    const result = await agent.generate(
      `Analyze IMF report at ${url}. Scrape content then perform analysis.`
    );
    return IMFAnalysisSchema.parse(JSON.parse(result));
  } catch (error) {
    console.error("Analysis failed:", error instanceof Error ? error.message : error);
    throw error;
  }
}

async function main() {
  const report = await analyzeIMFReport(
    "https://www.imf.org/en/News/Articles/2025/01/17/tr011725-january-2025-world-economic-outlook-update"
  );
  console.log("Analysis Result:", report);
}

if (require.main === module) {
  main().then(() => {
    console.log("Done!");
    process.exit(0);
  }).catch(console.error);
}