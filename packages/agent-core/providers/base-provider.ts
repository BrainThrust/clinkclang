// import { Message, ModelConfig, ModelResponse } from "../schema/core-schema";
import { Message, ModelConfig, ModelResponse } from "@/agent-core/schema/core-schema";

export abstract class Base {
  protected config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  abstract generateResponse(
    messages: Message[],
    tools?: any[] 
  ): Promise<ModelResponse>;
}