import { z } from "zod";
import { Tool } from "@/agent-tools/tool-interface";
import pdf from "pdf-parse";
import { readFile } from "fs/promises";

export const PDFProcessorTool: Tool = {
  name: "processPDFInvoice",
  description: "Extracts text from text-based PDF invoices",
  parameters: z.object({
    filePath: z.string().describe("Path to the PDF file"),
    maxPages: z.number().optional().default(5).describe("Maximum pages to process"),
  }),
  execute: async ({ filePath, maxPages }) => {
    try {
      console.log(`[PDFProcessor] - Starting PDF processing on ${filePath}`);
      const textData = await extractPDFText(filePath, maxPages);
      if (textData.trim().length === 0) {
        throw new Error("No text extracted - document may be image-based");
      }
      return textData;
    } catch (error) {
      console.error("[PDFProcessor] Error:", error);
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : error}`);
    }
  },
};

async function extractPDFText(filePath: string, maxPages: number): Promise<string> {
  const dataBuffer = await readFile(filePath);
  const data = await pdf(dataBuffer, { max: maxPages });
  return data.text;
}