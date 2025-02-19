import { z } from "zod";
import { Agent } from "@/agent-core/core";
import { WebScraperTool } from "@/agent-tools/web-scrapper";

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

const analysisAgent = new Agent({
  provider: {
    type: "openai",
    apiKey: OPENAI_API_KEY,
    modelName: "gpt-4", 
    temperature: 0.3,
    maxTokens: 1200
  },
  systemPrompt: "You're a helpful assistant.",
  tools: [new WebScraperTool()],
  outputSchema: {
    name: "IMFAnalysis",
    schema: IMFAnalysisSchema
  },
  strategy: "react",
  structure: {
    strict: true,
    maxRetries: 4, // need to add this to the config to customize
    debug: true
  }
});

export async function analyzeIMFReport(url: string) {
  try {
    const result = await analysisAgent.generate(
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
  main().catch(console.error);
}
