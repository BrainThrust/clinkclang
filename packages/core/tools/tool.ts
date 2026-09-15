// src/agent-core/tools/tool-interface.ts
import { z } from "zod";

export interface Tool<T extends z.ZodTypeAny = any> {
  name: string;
  description: string;
  parameters: T;
  execute: (args: z.infer<T>) => Promise<string>;
}

export type ToolDescription = {
  name: string;
  description: string;
  parameters: z.ZodTypeAny;
};

export function describeTool(tool: Tool): string {
  return `
Tool: ${tool.name}
Description: ${tool.description}
Parameters: ${JSON.stringify(tool.parameters.shape, null, 2)}
  `.trim();
}

export function describeTools(tools: Tool[]): string {
  return tools.map(describeTool).join("\n\n");
}
