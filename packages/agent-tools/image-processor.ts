import Tesseract from "tesseract.js";
import { z } from "zod";
import { Tool } from "@/agent-tools/tool-interface";

export const ImageProcessorTool: Tool = {
  name: "extractImage",
  description: "Extracts text from an image file",
  parameters: z.object({
    filePath: z.string().describe("Path to image file, e.g., ./samples/invoice.jpg")
  }),
  execute: async ({ filePath }) => {
    console.log(`[ImageProcessorTool] - Starting OCR on ${filePath}`);
    try {
      const worker = await Tesseract.createWorker("eng", 1, {
      });

      const {
        data: { text },
      } = await worker.recognize(filePath);
      await worker.terminate();
      console.log(`[ImageProcessorTool] - OCR completed.`);
      return text;
    } catch (error) {
      console.error("[ImageProcessorTool] - Image extraction error:", error);
      throw new Error(`Failed to extract image content: ${error}`);
    }
  },
};