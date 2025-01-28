import { BaseStrategy } from "packages/agent-strategies/base";
import { z } from "zod";
import { Message } from "@/agent-core/schema/core-schema";
import { describeTools } from "@/agent-core/core";
import { ModelResponse } from "@/agent-core/schema/core-schema";
import { Tool } from "@/agent-tools/tool-interface";

// system prompt to guide ReAct
// this is buggy. needs to be fixed as its calling tools that dont exist.
const REACT_SYSTEM_PROMPT = `
You must follow the ReAct reasoning format. Structure your response as:

Thought: [your analytical reasoning about the task]
Action: toolCall:[tool_name]({parameters}) 
Observation: [tool result]
... (repeat as needed)

Final Answer: [structured response${"{{SCHEMA_NOTE}}"}]

Guidelines:
1. Carefully analyze the problem before taking action
${"{{TOOL_GUIDELINES}}"}${"{{SCHEMA_GUIDELINES}}"}
5. Always conclude with Final Answer when task is complete
`.trim();

export class ReActStrategy extends BaseStrategy {
  private maxIterations = 5;
  private currentContext: Message[] = [];

  // this is the main function
  async execute(input: string, schema?: z.ZodSchema): Promise<string> {

    // initialize context
    this.initializeContext(input, schema);
    let iteration = 0;
    let finalAnswer = "";
    let currentContent = input;

    // if debug is on, print out the tools available
    if (this.agent.config.structure?.debug) {
      if (schema) console.log("Output schema required");
      if (this.agent.tools.length)
        console.log(
          `Tools available: ${this.agent.tools
            .map((t: Tool) => t.name)
            .join(", ")}`
        );
    }

    // while we have not reached the max iterations and we have not found the final answer then keep trying
    while (iteration < this.maxIterations && !finalAnswer) {
      try {

        // first step is to get response.
        // if debug is on, print out the prompt
        const response = await this.generateStep();
        // parse the response to get thought, action, and final answer
        const parsed = this.parseReactResponse(response.content);

        if (this.agent.config.structure?.debug) {
          if (parsed.thought) console.log(`\nTHOUGHT: ${parsed.thought}`);
          if (parsed.action) console.log(`ACTION: ${parsed.action}`);
          if (parsed.finalAnswer)
            console.log(`FINAL ANSWER ATTEMPT: ${parsed.finalAnswer}`);
        }

        // if there is a final answer then validate it only if there is a schema
        if (parsed.finalAnswer) {
          const processed = await this.processToolOutput(
            parsed.finalAnswer,
            schema
          );

          if (schema) {
            // use schema to validate from the structured output processor
            const validation = await this.validateOutput(processed, schema);
            if (validation.success) {
              finalAnswer = JSON.stringify(validation.data);
              if (this.agent.config.structure?.debug) {
                console.log("\nVALIDATION SUCCEEDED");
              }
              break;
            }

            // if debug is on, print out the errors
            if (this.agent.config.structure?.debug) {
              console.log("\nVALIDATION FAILED");
              console.log(
                "Errors:",
                validation.errors
                  ?.map((e: { message: string }) => e.message)
                  .join("\n")
              );
            }

            // if there are errors then prompt the user to correct their previous attempt
            currentContent = this.getRetryPrompt(schema, validation.errors);
          } else {
            finalAnswer = processed;
            break;
          }
        }

        // if there is an action then execute it
        if (parsed.action) {
          if (this.agent.config.structure?.debug) {
            console.log("\nEXECUTING ACTION");
          }

          // execute the action or tool
          const toolResult = await this.executeAction(parsed.action);

          if (this.agent.config.structure?.debug) {
            console.log(`RECEIVED TOOL RESULT!`);
          }

          // update the context
          this.updateContext(response.content, toolResult);
        }

        iteration++;
      } catch (error) {
        if (this.agent.config.structure?.debug) {
          console.log("\nERROR OCCURRED:");
          console.error(error instanceof Error ? error.message : error);
        }

        if (iteration >= this.maxIterations) throw error;
        iteration++;
        currentContent = this.getErrorRetryPrompt(error, schema);
      }
    }

    // if we have not found the final answer within the max iterations then throw an error
    if (!finalAnswer) {
      throw new Error("Max ReAct iterations reached");
    }

    if (this.agent.config.structure?.debug) {
      console.log("\nFINAL ANSWER:");
      console.log(JSON.stringify(JSON.parse(finalAnswer), null, 2));
      console.log("\nPROCESS COMPLETE");
    }

    return finalAnswer;
  }

  private async generateStep(): Promise<ModelResponse> {
    return this.agent.provider.generateResponse(this.currentContext);
  }

  // the initialize context function works in a way where if there are tools or a schema, the system prompt has additional instructions
  private initializeContext(input: string, schema?: z.ZodSchema) {
    const hasTools = this.agent.tools.length > 0;
    const hasSchema = !!schema;

    //  if there are tools, add them to the system prompt using the describeTools function
    const toolSection = hasTools
      ? `Available Tools:\n${describeTools(this.agent.tools)}\n`
      : "";

    const schemaNote = hasSchema
      ? " following the required schema EXACTLY"
      : "";

    const toolGuidelines = hasTools
      ? `
        2. Validate tool parameters match their schemas
        3. Handle errors gracefully - retry with corrected parameters if needed
        4. Combine multiple observations to form complete answers`
      : "";

    // this could be done in a better way
    const schemaGuidelines = hasSchema
      ? `
      5. Validate final answer against schema constraints
      6. Format output as valid JSON`
      : "";

    this.currentContext = [
      ...this.agent.getHistory(),
      { role: "user", content: input },
      {
        role: "system",
        content:
          REACT_SYSTEM_PROMPT.replace("{{TOOL_GUIDELINES}}", toolGuidelines)
            .replace("{{SCHEMA_GUIDELINES}}", schemaGuidelines)
            .replace("{{SCHEMA_NOTE}}", schemaNote) +
          (hasTools ? `\n${toolSection}` : "") +
          (hasSchema ? `\n${this.outputProcessor.generatePrompt(schema)}` : ""),
      },
    ];
  }

  // this tries to extract the thought, action, and final answer from the response
  private parseReactResponse(response: string): {
    thought?: string;
    action?: string;
    finalAnswer?: string;
  } {
    return {
      thought: this.extractSection(response, "Thought"),
      action: this.extractSection(response, "Action"),
      finalAnswer: this.extractSection(response, "Final Answer"),
    };
  }

  // uses regex to extract a section from the response needed for the previous function
  private extractSection(
    response: string,
    section: string
  ): string | undefined {
    const regex = new RegExp(`${section}:\\s*(.*?)(?=\\n\\w+:|$)`, "s");
    const match = response.match(regex);
    return match?.[1]?.trim();
  }

  // uses extractToolCall to find the action (or tools). once you find the arguments, execute the tool. the regex is a bit hacky
  private async executeAction(action: string): Promise<string> {
    const toolCall = this.agent.extractToolCall({ content: action });
    if (!toolCall) throw new Error(`Invalid action format: ${action}`);

    const tool = this.agent.tools.find((t: Tool) => t.name === toolCall.name);
    if (!tool) throw new Error(`Tool ${toolCall.name} not registered`);

    try {
      return await tool.execute(toolCall.arguments);
    } catch (error) {
      return `Tool error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  // update the context every time
  private updateContext(response: string, toolResult: string) {
    this.currentContext.push(
      { role: "assistant", content: response },
      { role: "system", content: `Observation: ${toolResult}` }
    );
  }

  // when we receive an error, we want to prompt the user to correct their previous attempt and the error to be fixed
  private getRetryPrompt(schema: z.ZodSchema, errors?: any[]): string {
    return [
      // simply join the errors into a string
      this.outputProcessor.generatePrompt(schema),
      "Previous attempt failed due to:",
      errors?.map((e) => `- ${e.message}`).join("\n") ||
        "Invalid output format",
      "Please correct the following issues and try again:",
    ].join("\n");
  }

  private getErrorRetryPrompt(error: unknown, schema?: z.ZodSchema): string {
    const basePrompt = [
      "Error occurred during processing:",
      error instanceof Error ? error.message : "Unknown error",
      "Please correct your previous attempt.",
    ].join("\n");

    return schema
      ? `${this.outputProcessor.generatePrompt(schema)}\n${basePrompt}`
      : basePrompt;
  }
}
