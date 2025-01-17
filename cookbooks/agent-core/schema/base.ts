// assigning type definition to Role as either system, user, or assistant using the union operator
export interface Message {
    role: "system" | "user" | "assistant";
    content: string;
}

// blueprint for model configuration
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

