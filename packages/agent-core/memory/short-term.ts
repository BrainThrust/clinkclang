import { Message } from "@/agent-core/schema/core-schema";

export class ShortTermMemory {
  private messages: Message[];
  private maxTokens: number;
  private currentTokens: number;

  constructor(initialMessages: Message[] = [], maxContextTokens = 1000) {
    this.messages = [];
    this.maxTokens = maxContextTokens;
    this.currentTokens = 0;
    initialMessages.forEach(msg => this.addMessage(msg));
  }

  addMessage(message: Message): void {
    const messageTokens = this.estimateTokens(message.content);
    
    // remove the oldest messages until we have enough space
    while (this.currentTokens + messageTokens > this.maxTokens) {
      const removed = this.messages.shift();
      if (removed) {
        this.currentTokens -= this.estimateTokens(removed.content);
      } else {
        break; // this is to prevent an infinite loop if the memory is full
      }
    }
    
    // Add new message
    this.messages.push(message);
    this.currentTokens += messageTokens;
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
    this.currentTokens = 0;
  }

  getCurrentTokenCount(): number {
    return this.currentTokens;
  }

  private estimateTokens(text: string): number {
    // 1 token ≈ 4 characters (conservative estimate)
    return Math.ceil(text.length / 4);
  }

  printMemoryStatus(): void {
    console.log(`Memory usage: ${this.currentTokens}/${this.maxTokens} tokens`);
    console.log(`Stored messages: ${this.messages.length}`);
  }
}
