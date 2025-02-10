import { z } from "zod";

export interface Tool {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (params: { [key: string]: any }) => Promise<string>;
}