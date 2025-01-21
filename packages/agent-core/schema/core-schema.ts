import { z } from "zod";

// assigning type definition to Role as either system, user, assistant, or tool using the union operator
// this message is used by the agent's history
export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
}

// blueprint for model configuration (whenever we create a new model)
export interface ModelConfig {
  apiKey: string;
  modelName: string;
  temperature?: number; // optional since only available for a few models
  maxTokens?: number;
  version?: string; // only needed for claude
  [key: string]: any;
}

// blueprint for model response
export interface ModelResponse {
  content: string;
  metadata?: any;
}

// blueprint for schemas sent into the model for the structured output
export interface Schema {
  name: string;
  schema: z.ZodType<any, any>;
}

