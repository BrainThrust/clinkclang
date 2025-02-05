import { Base } from "@/agent-core/providers/base-provider";
import {
  Message,
  ModelResponse,
  ModelConfig,
} from "@/agent-core/schema/core-schema";

export class DeepSeekProvider extends Base {
    constructor(config: ModelConfig) {
      super(config);
    }
  
    async generateResponse(messages: Message[]): Promise<ModelResponse> {
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        };
        
        // added parameters (need to check impleme  ntation)
        const body = JSON.stringify({
          model: this.config.modelName,
          messages: messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens,
          stream: this.config.stream || false,
        });

        const response = await fetch(
          "https://api.deepseek.com/chat/completions",
          {
            method: "POST",
            headers: headers,
            body: body,
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `DeepSeek API request failed with status ${
              response.status
            }: ${JSON.stringify(errorData)}` 
          );
        }
  
        const data = await response.json();
        if (!data?.choices?.[0]?.message) {
          throw new Error("Invalid response format from DeepSeek API"); 
        }
  
        const content = data.choices[0].message.content || "";
        return { content };
      } catch (error) {
        console.error("Error generating response with DeepSeek:", error); 
        throw error;
      }
    }
  }