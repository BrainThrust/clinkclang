import { z } from "zod";
import { Agent } from "@/agent-core/core";
import { Message } from "@/agent-core/schema/core-schema";

export abstract class BaseStrategy {
  constructor(protected agent: Agent) {}

  abstract execute(input: string, schema?: z.ZodSchema): Promise<string>;

  protected cleanJSON(content: string): string {
    return content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/(\w+):/g, '"$1":')
      .replace(/'/g, '"');
  }

  protected async validateOutput<T>(content: string, schema: z.ZodSchema<T>) {
    try {
      const cleaned = this.cleanJSON(content);
      const parsed = JSON.parse(cleaned);
      return schema.safeParse(parsed);
    } catch (error) {
      return {
        success: false,
        error: new z.ZodError([
          {
            code: "invalid_type",
            expected: "object",
            received: "string",
            path: [],
            message: `Malformed JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ])
      };
    }
  }

  protected generateSchemaPrompt(schema: z.ZodSchema): string {
    if (schema instanceof z.ZodObject) {
      const example = Object.entries(schema.shape).reduce((acc, [key, value]) => {
        acc[key] = value instanceof z.ZodType ? this.getTypeExample(value) : 'unknown';
        return acc;
      }, {} as Record<string, any>);
      
      return `Required JSON format:\n${JSON.stringify(example, null, 2)}`;
    }
    return `Required format: ${schema.description || 'Valid JSON matching the schema'}`;
  }

  private getTypeExample(type: z.ZodType): any {
    if (type instanceof z.ZodString) return "string";
    if (type instanceof z.ZodNumber) return 0;
    if (type instanceof z.ZodBoolean) return true;
    if (type instanceof z.ZodArray) return [this.getTypeExample(type.element)];
    return "value";
  }

  protected get tools() {
    return this.agent.tools;
  }

  protected get history() {
    return this.agent.getHistory();
  }

  protected isToolOutput(content: string): boolean {
    try {
      JSON.parse(content);
      return false;
    } catch {
      return true;
    }
  }
}
