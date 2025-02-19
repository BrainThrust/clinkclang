import { z } from "zod";
import { BaseStrategy } from "./base";
import { Agent } from "@/agent-core/core";
import { Message, ModelResponse } from "@/agent-core/schema/core-schema";

const REACT_SYSTEM_PROMPT = (hasTools: boolean, hasSchema: boolean) => `
### Role:
You are a reasoning agent using ReAct framework to solve the user's task. Follow these core rules:
1. Always begin with Thought: analysis
2. ${hasTools ? "Use tools only when necessary" : "No tools available"}
3. Final Answer must be ${hasSchema ? "valid JSON" : "plain text"}
${hasTools ? "4. Tool parameters must be valid JSON objects" : ""}

### Response Requirements:
${
  hasSchema 
  ? `1. Directly answer the original question
2. Use EXACT structure: { "key": value }
3. Never describe/explain the schema
4. Only include real data values
5. Maintain JSON validity at all times`
  : "Provide clear, concise response in plain text"
}

### Process:
Thought: <analyze problem step-by-step>
${
  hasTools 
  ? `Action: toolCall:<tool_name>(<valid JSON parameters>)
Observation: <tool result>`
  : ""
}
Final Answer: ${hasSchema ? "{\"key\": <value>}" : "<answer>"}
`.trim();

export class ReActStrategy extends BaseStrategy {
  private maxIterations = 4; // modify the code to allow the user to configure this value
  private context: Message[] = [];
  private debug: boolean;

  constructor(agent: Agent) {
    super(agent);
    this.debug = agent.config?.structure?.debug ?? false;
  }

  private debugLog(...args: any[]) {
    if (this.debug) {
      console.log('[DEBUG]', ...args);
    }
  }

  async execute(input: string, schema?: z.ZodSchema): Promise<string> {
    this.debugLog('Starting execution with input:', input);

    this.context = this.initializeContext(input, Boolean(schema));
    let iteration = 0;
    let finalAnswer = "";

    while (iteration < this.maxIterations && !finalAnswer) {
      this.debugLog(`\n--- Iteration ${iteration + 1} ---`);
      
      try {
        const response = await this.generateStep();
        this.debugLog('Generated response:', response.content);

        const { thought, action, answer } = this.parseResponse(response.content);
        
        if (thought) {
          this.debugLog('[Thought]', thought);
        }

        if (action) {
          const toolCall = this.parseToolCall(action);
          if (toolCall) {
            this.debugLog(
              `[Action] Calling tool: ${toolCall.name}`,
              'with parameters:',
              JSON.stringify(toolCall.args, null, 2)
            );
          }
          
          const toolResult = await this.executeAction(action);
          this.debugLog('[Tool Result]', toolResult);
          
          this.context.push(
            { role: "assistant", content: response.content },
            { role: "system", content: `Observation: ${toolResult}` }
          );
        }

        if (answer) {
          this.debugLog('[Proposed Answer]', answer);
          finalAnswer = await this.validateAnswer(answer, schema) || "";
          
          if (finalAnswer) {
            this.debugLog('[Validated Answer]', finalAnswer);
          }
        }

        iteration++;
      } catch (error) {
        this.debugLog(
          '[Error]', 
          error instanceof Error ? error.message : 'Unknown error',
          '\nRetrying with error context...'
        );
        
        if (error instanceof Error) {
          this.context.push({
            role: "system",
            content: `Error: ${error.message}`
          });
        }
        
        iteration++;
      }
    }

    if (!finalAnswer) {
      throw new Error(`Failed after ${this.maxIterations} iterations`);
    }

    return finalAnswer;
  }

  private initializeContext(input: string, hasSchema: boolean): Message[] {
    const baseContext: Message[] = [
      ...this.history,
      { role: "user", content: input },
      { 
        role: "system", 
        content: REACT_SYSTEM_PROMPT(this.tools.length > 0, hasSchema)
      }
    ];

    if (this.tools.length > 0) {
      const toolsContent = `Tools:\n${this.tools.map(t => `${t.name}: ${t.description}`).join("\n")}`;
      baseContext.push({ role: "system", content: toolsContent });
    }

    return baseContext;
  }

  private async generateStep(): Promise<ModelResponse> {    
    return this.agent.provider.generateResponse(this.context);
  }

  private parseResponse(content: string) {
    return {
      thought: this.extractSection(content, "Thought"),
      action: this.extractSection(content, "Action"),
      answer: this.extractSection(content, "Final Answer")
    };
  }

  private async executeAction(action: string): Promise<string> {
    const toolCall = this.parseToolCall(action);
    
    if (!toolCall) {
      throw new Error('Malformed tool call');
    }

    const tool = this.tools.find(t => t.name === toolCall.name);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolCall.name}`);
    }

    try {
      const args = tool.parameters.parse(toolCall.args);
      return await tool.execute(args);
    } catch (error) {
      throw new Error(
        `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private parseToolCall(action: string) {
    const match = action.match(/toolCall:(\w+)\((.+)\)/);
    if (!match || !match[2]) return null;
  
    try {
      return {
        name: match[1],
        args: JSON.parse(
          match[2]
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') 
            .replace(/'/g, '"')
        )
      };
    } catch (e) {
      return null;
    }
  }

  private async validateAnswer(answer: string, schema?: z.ZodSchema): Promise<string> {
    if (!schema) return answer;

    const cleaned = this.cleanJSON(answer);
    const validation = await this.validateOutput(cleaned, schema);
    
    if (validation.success) {
      return JSON.stringify((validation as z.SafeParseSuccess<any>).data);
    }

    this.debugLog(
      '[Validation Failed]',
      'Errors:',
      validation.error.issues.map(e => 
        `${e.path.join('.')}: ${e.message}`
      )
    );
    
    return this.retryWithSchema(validation.error.issues, schema); 
  }

  private retryWithSchema(errors: z.ZodIssue[], schema: z.ZodSchema): string {
    const errorList = errors.map(e => `- ${e.path.join('.')}: ${e.message}`);
    const retryMessage = [
      'Validation failed. Issues:',
      ...errorList,
      'Required format:',
      this.generateSchemaPrompt(schema)
    ].join('\n');

    this.context.push({ role: "system", content: retryMessage });
    return "";
  }

  private extractSection(content: string, section: string): string {
    const regex = new RegExp(`${section}:\\s*([\\s\\S]*?)(?=\\n\\w+:|$)`, "i");
    return content.match(regex)?.[1]?.trim() || "";
  }
}