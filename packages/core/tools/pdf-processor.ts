import { z } from "zod";
import { Tool } from "packages/core/tools/tool";
import pdf from "pdf-parse";
import { readFile } from "fs/promises";
import path from "path";

export class PDFProcessorTool implements Tool {
  name = "processPDFInvoice";
  description = "Extracts text from text-based PDF invoices";
  parameters = z.object({
    filePath: z.string().describe("Path to the PDF file"),
    maxPages: z.number().optional().default(5).describe("Maximum pages to process"),
  });

  async execute(params: z.infer<typeof this.parameters>): Promise<string> {
    const { filePath, maxPages } = params;
    
    try {
      if (!filePath || typeof filePath !== 'string') {
        throw new Error("Invalid file path provided");
      }

      const absolutePath = path.resolve(filePath);
      console.log(`[PDFProcessor] Starting processing: ${absolutePath}`);

      const textData = await this.extractPDFText(absolutePath, maxPages);

      if (textData.trim().length === 0) {
        throw new Error("No text extracted - document may be image-based");
      }

      console.log(`[PDFProcessor] Successfully processed ${absolutePath}`);
      return textData;
    } catch (error) {
      console.error(`[PDFProcessor] Error processing ${filePath}:`, error);
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  private async extractPDFText(filePath: string, maxPages: number): Promise<string> {
    try {
      const dataBuffer = await readFile(filePath);
      const { text } = await pdf(dataBuffer, { 
        max: maxPages,
        pagerender: this.renderPage
      });
      return text;
    } catch (error) {
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : error}`);
    }
  }

  private renderPage(pageData: any): string {
    return pageData.getTextContent().then((textContent: any) => {
      return textContent.items
        .map((item: any) => item.str)
        .join(' ');
    });
  }
}
