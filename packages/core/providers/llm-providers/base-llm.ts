import { Message, ModelConfig, ModelResponse } from "../schema/core-schema";

export abstract class BaseProvider {
  protected config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  abstract generateResponse(
    messages: Message[],
    tools?: any[] 
  ): Promise<ModelResponse>;
}

export interface ProviderConfig {
  apiKey: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  version?: string;
  systemPrompt?: string;
  stream?: boolean;
}