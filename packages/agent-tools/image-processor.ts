import Tesseract from "tesseract.js";
import { z } from "zod";
import { Tool } from "@/agent-tools/tool-interface";

export const ImageProcessorTool: Tool = {
  name: "extractImage",
  description:
    "Extracts text content from an image file. Use this tool when you need to get text from an image. Input should be a file path.",
  parameters: z.object({
    filePath: z.string().describe("The path to the image file"),
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