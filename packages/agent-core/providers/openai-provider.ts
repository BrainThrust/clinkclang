import { Base } from "@/agent-core/providers/base-provider";
import { Message, ModelResponse, ModelConfig } from "@/agent-core/schema/core-schema";
import { Tool } from "@/agent-tools/tool-interface";

export class OpenAIProvider extends Base {
  constructor(config: ModelConfig) {
    super(config);
  }

  async generateResponse(
    messages: Message[],
    tools: Tool[] = []
  ): Promise<ModelResponse> {
    try {
      const headers = {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      };

      const body = JSON.stringify({
        model: this.config.modelName,
        messages: messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: headers,
        body: body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API request failed with status ${response.status}: ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();

      if (!data || !data.choices || data.choices.length === 0) {
        throw new Error("Invalid response format from OpenAI API");
      }

      if (data.choices[0].finish_reason === "tool_calls") {
        return {
          content: "",
          metadata: {
            toolCalls: data.choices[0].message.tool_calls,
          },
        };
      }

      const content = data.choices[0].message?.content || "";

      return { content };
    } catch (error) {
      console.error("Error generating response with OpenAI:", error);
      throw error;
    }
  }
}