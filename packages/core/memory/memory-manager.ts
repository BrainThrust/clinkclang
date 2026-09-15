import { BaseMemory } from './base-memory';
import { ShortTermMemory } from './short-term';
import { LongTermMemory } from './long-term';
import { MemoryMessage, MemorySummary } from '../schema/memory-schema';
import { BaseProvider } from '../providers/llm-providers/base-llm';
import { EmbeddingProvider } from '../providers/embedding-providers/base-embedding';

export interface MemoryManagerConfig {
    provider: BaseProvider;
    tokenLimit?: number;
    initialMessages?: MemoryMessage[];
    longTerm?:{
        enabled: boolean;
        dbConnectionString: string;
        embeddingProvider: EmbeddingProvider;
        conversationId?: string;    
    }
}

export class MemoryManager extends BaseMemory {
    private shortTermMemory: ShortTermMemory;
    private longTermMemory?: LongTermMemory;
    private useLongTerm: boolean;
  
    constructor(config: MemoryManagerConfig) {
      super();
      
      this.useLongTerm = config.longTerm?.enabled || false;
      
      this.shortTermMemory = new ShortTermMemory({
        provider: config.provider,
        tokenLimit: config.tokenLimit,
        initialMessages: config.initialMessages
      });
      
      if (this.useLongTerm && config.longTerm) {
        this.longTermMemory = new LongTermMemory({
          provider: config.provider,
          dbConnectionString: config.longTerm.dbConnectionString,
          embeddingProvider: config.longTerm.embeddingProvider,
          conversationId: config.longTerm.conversationId,
          tokenLimit: config.tokenLimit,
          initialMessages: config.initialMessages
        });
      }
    }
  
    async addMessage(message: Omit<MemoryMessage, 'tokens' | 'createdAt'>): Promise<void> {
      await this.shortTermMemory.addMessage(message);
      
      if (this.useLongTerm && this.longTermMemory) {
        await this.longTermMemory.addMessage(message);
      }
    }
  
    async getMessages(): Promise<MemoryMessage[]> {
      return this.shortTermMemory.getMessages();
    }
  
    async getSummaries(): Promise<MemorySummary[]> {
      return this.shortTermMemory.getSummaries();
    }
  
    getTokenUsage(): number {
      return this.shortTermMemory.getTokenUsage();
    }
  
    async clear(): Promise<void> {
      await this.shortTermMemory.clear();
      
      if (this.useLongTerm && this.longTermMemory) {
        await this.longTermMemory.clear();
      }
    }
    
    async retrieveRelevantHistory(query: string, maxTokens: number = 1000): Promise<MemoryMessage[]> {
      if (this.useLongTerm && this.longTermMemory) {
        return this.longTermMemory.retrieveRelevantHistory(query, maxTokens);
      }
      
      return this.getMessages();
    }
    
    async searchSimilarMessages(query: string, limit: number = 5): Promise<MemoryMessage[]> {
      if (this.useLongTerm && this.longTermMemory) {
        return this.longTermMemory.searchSimilarMessages(query, limit);
      }
      
      return [];
    }
    
    async loadConversation(conversationId: string): Promise<void> {
      if (this.useLongTerm && this.longTermMemory) {
        await this.longTermMemory.loadConversation(conversationId);
        
        const messages = await this.longTermMemory.getMessages();
        await this.shortTermMemory.clear();
        
        for (const message of messages.slice(-10)) { 
          await this.shortTermMemory.addMessage({
            role: message.role,
            content: message.content,
            metadata: message.metadata
          });
        }
      }
    }
    
    getConversationId(): string | undefined {
      return this.longTermMemory?.getConversationId();
    }
    
    isLongTermEnabled(): boolean {
      return this.useLongTerm;
    }
  }