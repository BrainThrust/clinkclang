import { Base } from "./base-provider";
import { Message, ModelResponse, ModelConfig } from "../schema/base";

// creating a claude provider handler class
export class ClaudeProvider extends Base {
    constructor(config: ModelConfig) {
        super(config);
    }

    async generateResponse(messages: Message[]): Promise<ModelResponse> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },

      // can add more parameters if needed
      body: JSON.stringify({
        model: this.config.modelName,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    const data = await response.json();

    // can return metadata if needed
    return {
      content: data.content[0].text,
    };
  }
}
