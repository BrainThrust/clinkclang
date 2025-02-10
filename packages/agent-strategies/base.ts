import { Agent } from "@/agent-core/core";
import { StructuredOutputProcessor } from "@/agent-core/schema/output-validator";
import { z } from "zod";

// abstract framework
export abstract class BaseStrategy {
  constructor(
    protected agent: Agent,
    protected outputProcessor: StructuredOutputProcessor
  ) {}

  // execute function
  abstract execute(input: string, schema?: z.ZodSchema): Promise<string>;

  // validate function
  protected async validateOutput(response: string, schema: z.ZodSchema) {
    return this.outputProcessor.parse(schema, response, 0);
  }

  // get tools
  protected get tools() {
    return this.agent.tools;
  }

  // get history
  protected get history() {
    return this.agent.getHistory();
  }

  // this is a way to process tool output into a JSON which is accessable by every framework
  protected async processToolOutput(content: string, schema?: z.ZodSchema): Promise<string> {
    if (!schema) return content;

    // Only process if we have a schema AND it's tool output
    if (schema && this.isToolOutput(content)) {
      const schemaPrompt = this.outputProcessor.generatePrompt(schema);
      
      const conversionPrompt = [
        schemaPrompt,
        "\n\nRAW TOOL OUTPUT TO CONVERT:",
        "```",
        content,
        "```",
        "STRICTLY FOLLOW THESE STEPS:",
        "1. Analyze the raw tool output above",
        "2. Extract relevant data matching the schema",
        "3. Generate ONLY the JSON object - no commentary",
        "4. Validate against all schema constraints",
        "\nFORMATTED JSON:"
      ].join("\n");
  
      if (this.agent.config.structure?.debug) {
        console.debug("[ToolOutput] Conversion prompt:", conversionPrompt);
      }
  
      const messages = [
        ...this.history,
        { role: "user" as const, content: conversionPrompt }
      ];
      
      const response = await this.agent.provider.generateResponse(messages);
      return response.content;
    }
  
    return content;
  }
  
  private isToolOutput(content: string): boolean {
    // Only check for tool results if schema exists
    return !!this.agent.outputSchema && (
      content.includes("TOOL RESULT") || 
      !content.startsWith("{")
    );
  }
};