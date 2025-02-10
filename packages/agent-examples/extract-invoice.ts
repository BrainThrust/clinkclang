import { StrategyName } from "@/agent-strategies/index"; 
import { Agent } from "@/agent-core/core";
import { ImageProcessorTool } from "@/agent-tools/image-processor";
import { PDFProcessorTool } from "@/agent-tools/pdf-processor";
import { z } from "zod";
import { Schema } from "@/agent-core/schema/core-schema";
import { ProviderName } from "@/agent-core/core";

const OPENAI_API_KEY = 'openai_api_key';
const DEEPSEEK_API_KEY = 'deepseek_api_key';

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

async function testStrategy(strategy: StrategyName, provider: ProviderName, filePath: string, schema: Schema) {
  console.log(`${'-'.repeat(40)}`);
  console.log(`Testing ${strategy.toUpperCase()} strategy with ${filePath}`);
  console.log(`${'-'.repeat(40)}\n`);


  try {
    let agent: Agent;

    if (provider === 'openai') {
      if (!OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY for OpenAI provider");
      }

      agent = new Agent({
        providerName: provider,
        modelName: "gpt-4",
        apiKey: OPENAI_API_KEY,
        systemPrompt: `You are an expert invoice processing assistant...`,
        strategy,
        tools: [ImageProcessorTool, PDFProcessorTool],
        structure: {
          debug: true,
          maxRetries: 4,
        },
        temperature: 0.7,
        retries: 4,
      });
    } else if (provider === 'deepseek') {
      if (!DEEPSEEK_API_KEY) {
        throw new Error("Missing DEEPSEEK_API_KEY for DeepSeek provider");
      }

      agent = new Agent({
        providerName: provider,
        modelName: "deepseek-chat",
        apiKey: DEEPSEEK_API_KEY,
        systemPrompt: `You are an expert invoice processing assistant...`,
        strategy,
        tools: [ImageProcessorTool, PDFProcessorTool],
        structure: {
          debug: true,
          maxRetries: 4,
        },
        temperature: 0.7,
        retries: 4,
        stream: false,
      });
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const response = await agent.generate(
      `Analyze the document at "${filePath}". Extract all items, prices, and relevant details.`,
      schema
    );

    console.log(`[${strategy}/${provider}] SUCCESS:`);
    console.log(JSON.stringify(JSON.parse(response), null, 2));
    return true;
  } catch (error) {
    console.error(`[${strategy}/${provider}] ERROR:`, error instanceof Error ? error.message : error);
    return false;
  }
}

async function runStrategyTests() {
  const strategies: StrategyName[] = ['react'];
  const providers: ProviderName[] = ['openai', 'deepseek'];
  
  for (const provider of providers) {
    for (const strategy of strategies) {
      await testStrategy(strategy, provider, '@agent-examples/samples/invoice.jpg', imageInvoiceSchema);
      await new Promise(resolve => setTimeout(resolve, 2000));

      await testStrategy(strategy, provider, '@agent-examples/samples/invoice.pdf', pdfInvoiceSchema);
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log();
    }
  }
}

async function extractInvoice() {
  console.log("STARTING DOCUMENT PROCESSING TESTS");
  console.log("==================================\n");
  
  if (!OPENAI_API_KEY || !DEEPSEEK_API_KEY) {
    console.error("Missing API keys: OPENAI_API_KEY or DEEPSEEK_API_KEY");
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
