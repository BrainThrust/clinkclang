import type { MemoryMessage, MemorySummary } from '../schema/memory-schema';

export abstract class BaseMemory {
  abstract addMessage(message: Omit<MemoryMessage, 'tokens' | 'createdAt'>): Promise<void>;
  abstract getMessages(): Promise<MemoryMessage[]>;
  abstract getSummaries(): Promise<MemorySummary[]>;
  abstract getTokenUsage(): number;
  abstract clear(): Promise<void>;
  
  protected calculateTokens(content: string): number {
    return Math.ceil(content.length / 4) + 4; 
  }

  protected createMessage(
    role: MemoryMessage['role'],
    content: string,
    metadata?: Record<string, any>
  ): MemoryMessage {
    return {
      role,
      content,
      tokens: this.calculateTokens(content),
      createdAt: Date.now(),
      metadata
    };
  }
}