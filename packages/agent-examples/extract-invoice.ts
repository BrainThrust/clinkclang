import { StrategyName } from "packages/agent-strategies/index"; 
import { Agent } from "@/agent-core/core";
import { ImageProcessorTool } from "@/agent-tools/image-processor";
import { PDFProcessorTool } from "@/agent-tools/pdf-processor";
import { z } from "zod";
import { Schema } from "@/agent-core/schema/core-schema";

const OPENAI_API_KEY = 'openai_api_key';

const imageInvoiceSchema: Schema = {
  name: "InvoiceData",
  schema: z.object({
    item_names: z.array(z.string()).describe("List of item names from the invoice"),
    unit_prices: z.array(z.string()).describe("Corresponding prices for each item"),
    total: z.string().optional().describe("Total amount if present"),
    invoice_number: z.string().optional().describe("Invoice identification number"),
    date: z.string().optional().describe("Invoice date"),
  }),
};

const pdfInvoiceSchema: Schema = {
  name: "InvoiceData",
  schema: z.object({
    invoice_number: z.string().describe("Invoice identification number"),
    customer_number: z.string().describe("Customer identification number"),
    invoice_period: z.string().describe("Billing period for the invoice"),
    date: z.string().describe("Invoice date"),
    items: z.array(
      z.object({
        service_description: z.string().describe("Description of the service"),
        amount_without_vat: z.string().describe("Price per unit without VAT"),
        quantity: z.number().describe("Quantity of units"),
        total_amount: z.string().describe("Total amount for the line item without VAT"),
      })
    ).describe("List of items in the invoice"),
  }),
};

const baseConfig = {
  providerName: "openai" as const,
  modelName: "gpt-4o",
  apiKey: OPENAI_API_KEY,
  systemPrompt: `You are an expert invoice processing assistant...`,
  tools: [ImageProcessorTool, PDFProcessorTool],
  structure: {
    strict: true,
    maxRetries: 4,
    debug: true,
  },
};

async function testStrategy(strategy: StrategyName, filePath: string, schema: Schema) {
  console.log(`${'-'.repeat(40)}`);
  console.log(`Testing ${strategy.toUpperCase()} strategy with ${filePath}`);
  console.log(`${'-'.repeat(40)}\n`);

  try {
    const agent = new Agent({
      ...baseConfig,
      strategy: strategy,
      structure: {
        ...baseConfig.structure,
        debug: true, 
      }
    });

    const response = await agent.generate(
      `Analyze the document at "${filePath}". Extract all items, prices, and relevant details.`,
      schema
    );

    console.log(`[${strategy}] SUCCESS:`);
    console.log(JSON.stringify(JSON.parse(response), null, 2));
    return true;
  } catch (error) {
    console.error(`[${strategy}] ERROR:`, error instanceof Error ? error.message : error);
    return false;
  }
}

async function runStrategyTests() {
  const strategies: StrategyName[] = ["react"];
  
  for (const strategy of strategies) {
    await testStrategy(strategy, "./samples/invoice.jpg", imageInvoiceSchema);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testStrategy(strategy, "./samples/invoice.pdf", pdfInvoiceSchema);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log();
  }
}

async function extractInvoice() {
  console.log("STARTING DOCUMENT PROCESSING TESTS");
  console.log("==================================\n");
  
  if (!OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY environment variable");
    process.exit(1);
  }

  try {
    await runStrategyTests();
    console.log("\nALL STRATEGY TESTS COMPLETED");
  } catch (error) {
    console.error("MAIN PROCESS ERROR:", error);
    process.exit(1);
  }
}

extractInvoice().catch(console.error);
