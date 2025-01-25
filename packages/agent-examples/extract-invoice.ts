import { Agent, AgentConfig } from "@/agent-core/core";
import { ImageProcessorTool } from "@/agent-tools/image-processor";
import { PDFProcessorTool } from "@/agent-tools/pdf-processor";
import { z } from "zod";
import { Schema } from "@/agent-core/schema/core-schema";

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

const imageInvoiceConfig: AgentConfig = {
  providerName: "openai",
  modelName: "gpt-4o",
  apiKey: 'openai_api_key', 
  systemPrompt: `You are an expert invoice processing assistant that extracts structured data from documents. 
  Follow these steps:
  1. Analyze the input document
  2. Select the appropriate tool based on document type
  3. Extract and validate invoice components
  4. Maintain strict item-price relationships`,
  tools: [ImageProcessorTool, PDFProcessorTool],
  outputSchema: imageInvoiceSchema,
  structure: {
    strict: true,
    maxRetries: 4,
    debug: true,
  },
};

const pdfInvoiceConfig: AgentConfig = {
  providerName: "openai",
  modelName: "gpt-4o",
  apiKey: 'openai_api_key', 
  systemPrompt: `You are an expert invoice processing assistant that extracts structured data from documents. 
  Follow these steps:
  1. Analyze the input document
  2. Select the appropriate tool based on document type
  3. Extract and validate invoice components
  4. Maintain strict item-price relationships`,
  tools: [ImageProcessorTool, PDFProcessorTool],
  outputSchema: pdfInvoiceSchema,
  structure: {
    strict: true,
    maxRetries: 4,
    debug: true,
  },
};

async function processImageInvoice(filePath: string): Promise<string> {
  const agent = new Agent(imageInvoiceConfig);
  const response = await agent.generate(
    `Analyze the document at "${filePath}". Extract all items, prices, and relevant details.`
  );
  return response;
}

async function processPDFInvoice(filePath: string): Promise<string> {
  const agent = new Agent(pdfInvoiceConfig);
  const response = await agent.generate(
    `Analyze the document at "${filePath}". Extract all items, prices, and relevant details.`
  );
  return response;
}

(async () => {
  try {
    // test with image file
    console.log("Testing with image file:");
    const imageInvoiceData = await processImageInvoice("./samples/invoice.jpg");
    console.log("\nExtracted Invoice Data (Image):");
    console.log(JSON.stringify(JSON.parse(imageInvoiceData), null, 2));

    // test with PDF file
    console.log("\nTesting with PDF file:");
    const pdfInvoiceData = await processPDFInvoice("./samples/invoice.pdf");
    console.log("\nExtracted Invoice Data (PDF):");
    console.log(JSON.stringify(JSON.parse(pdfInvoiceData), null, 2));

    console.log("\nAll tests completed successfully!");
  } catch (error) {
    console.error("Document processing failed:", error);
    process.exit(1);
  }
})();