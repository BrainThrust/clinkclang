import { Base } from "@/agent-core/providers/base-provider";
import { Message, ModelResponse, ModelConfig } from "@/agent-core/schema/core-schema";

export class ClaudeProvider extends Base {
  systemPrompt?: string;

  constructor(config: ModelConfig) {
    super(config);
    this.systemPrompt = config.systemPrompt;
  }

  async generateResponse(messages: Message[]): Promise<ModelResponse> {
    try {
      const headers = {
        "x-api-key": this.config.apiKey,
        "anthropic-version": this.config.version || "2023-06-01",
        "Content-Type": "application/json",
      };

      const formattedMessages = messages.map((message) => ({
        role: message.role === "user" ? "user" : "assistant",
        content: message.content,
      }));

      const body = JSON.stringify({
        model: this.config.modelName,
        messages: formattedMessages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: this.systemPrompt,
      });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: headers,
        body: body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Anthropic API request failed with status ${response.status}: ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();
      const content = data.content[0]?.text || "";

      return { content };
    } catch (error) {
      console.error("Error generating response with Anthropic:", error);
      throw error;
    }
  }
}