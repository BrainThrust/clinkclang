import { Base } from "./base-provider";
import { Message, ModelResponse, ModelConfig } from "../schema/base";

// creating a openai provider handler class
export class OpenAIProvider extends Base {
    constructor(config: ModelConfig) {
        super(config);
    }
    async generateResponse(messages: Message[]): Promise<ModelResponse> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
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
      content: data.choices[0].message.content,
    };
  }
}
