import { BaseMemory } from './base-memory';
import type { MemoryMessage, MemorySummary } from '../schema/memory-schema';
import { BaseProvider } from '../providers/llm-providers/base-llm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, l2Distance, and, desc, sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { pgTable, text, timestamp, integer, jsonb, uuid, vector } from 'drizzle-orm/pg-core';
import { SUMMARIZE_PROMPT } from './prompt-templates/summarize-prompt';

// schema
const messagesTable = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  tokens: integer('tokens').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  conversationId: uuid('conversation_id').notNull(),
  metadata: jsonb('metadata'),
  embedding: vector('embedding', { dimensions: 1536 }).notNull()
});

const summariesTable = pgTable('summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  originalTokens: integer('original_tokens').notNull(),
  summarizedTokens: integer('summarized_tokens').notNull(),
  summaryDate: timestamp('summary_date').notNull().defaultNow(),
  conversationId: uuid('conversation_id').notNull(),
  metadata: jsonb('metadata')
});

export interface LongTermMemoryConfig {
  provider: BaseProvider;
  dbConnectionString: string;
  embeddingProvider: EmbeddingProvider;
  conversationId?: string;
  tokenLimit?: number;
  initialMessages?: MemoryMessage[];
}

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}

type MessageRow = typeof messagesTable.$inferSelect;
type SummaryRow = typeof summariesTable.$inferSelect;

export class LongTermMemory extends BaseMemory {
  private provider: BaseProvider;
  private embeddingProvider: EmbeddingProvider;
  private db: ReturnType<typeof drizzle>;
  private tokenLimit: number;
  private conversationId: string;
  private cachedMessages: MemoryMessage[] = [];
  private cachedSummaries: MemorySummary[] = [];
  private dirty: boolean = false;

  constructor(config: LongTermMemoryConfig) {
    super();
    this.provider = config.provider;
    this.embeddingProvider = config.embeddingProvider;
    this.tokenLimit = config.tokenLimit || 4000;
    this.conversationId = config.conversationId || crypto.randomUUID();
    
    // intialize database connection
    const pool = new Pool({
      connectionString: config.dbConnectionString,
    });
    this.db = drizzle(pool);
    
    if (config.initialMessages && config.initialMessages.length > 0) {
      this.cachedMessages = [...config.initialMessages];
      this.dirty = true;
    }
    
    // sync every minute?
    setInterval(() => this.syncMemory(), 60 * 1000); 
  }

  // adding a message (caller must provide all info about the message except tokens and createdAt)
  async addMessage(message: Omit<MemoryMessage, 'tokens' | 'createdAt'>): Promise<void> {
    const newMessage = this.createMessage(message.role, message.content, message.metadata);
    this.cachedMessages.push(newMessage);

    // signal to indicate that the in-memory state (the cached messages) has been modified and is now different from what's stored in the database
    this.dirty = true;
    const embedding = await this.embeddingProvider.generateEmbedding(message.content);
    await this.db.insert(messagesTable).values({
      role: newMessage.role,
      content: newMessage.content,
      tokens: newMessage.tokens,
      createdAt: new Date(newMessage.createdAt),
      conversationId: this.conversationId,
      metadata: newMessage.metadata || {},
      embedding: embedding
    });
    await this.manageMemory();
  }
  
  async getMessages(): Promise<MemoryMessage[]> {
    return [...this.cachedMessages];
  }
  
  async getSummaries(): Promise<MemorySummary[]> {
    if (this.cachedSummaries.length === 0) {
      // fetch the summaries from database (query) using the conversationId and order them by summaryDate
      const dbSummaries = await this.db.select().from(summariesTable)
        .where(eq(summariesTable.conversationId, this.conversationId))
        .orderBy(desc(summariesTable.summaryDate));
      
      // map the db summaries to MemorySummary objects to return
      this.cachedSummaries = dbSummaries.map((s: SummaryRow) => ({
        content: s.content,
        originalTokens: s.originalTokens,
        summarizedTokens: s.summarizedTokens,
        summaryDate: s.summaryDate.getTime()
      }));
    } 
    return [...this.cachedSummaries];
  }
  
  // token usage from the cached messages
  getTokenUsage(): number {
    return this.cachedMessages.reduce((acc, m) => acc + m.tokens, 0);
  }
  
  async clear(): Promise<void> {
    // delete all records for this conversation
    await this.db.delete(messagesTable)
      .where(eq(messagesTable.conversationId, this.conversationId));
    
    await this.db.delete(summariesTable)
      .where(eq(summariesTable.conversationId, this.conversationId));
    
    this.cachedMessages = [];
    this.cachedSummaries = [];
    this.dirty = false;
  }

  // search for similar messages using vector similarity
  async searchSimilarMessages(query: string, limit: number = 5): Promise<MemoryMessage[]> {
    // first generate embedding for the query
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(query);
    
    // using the l2Distance function, search for similar messages using vector similarity
    const similarMessages = await this.db.select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, this.conversationId))
      .orderBy(l2Distance(messagesTable.embedding, queryEmbedding))
      .limit(limit);
    
    // convert to MemoryMessage format
    return similarMessages.map((m: MessageRow) => ({
      role: m.role as MemoryMessage['role'],
      content: m.content,
      tokens: m.tokens,
      createdAt: m.createdAt.getTime(),
      metadata: m.metadata as Record<string, any>
    }));
  }
  
  async retrieveRelevantHistory(query: string, maxTokens: number = 1000): Promise<MemoryMessage[]> {
    // get the top 5 similar messages
    const similarMessages = await this.searchSimilarMessages(query, 5);
    
    // trim to fit within the token lenght
    let tokenCount = 0;
    const relevantMessages: MemoryMessage[] = [];
    
    // iterate over the similar messages 
    for (const msg of similarMessages) {
      if (tokenCount + msg.tokens <= maxTokens) {
        relevantMessages.push(msg);
        tokenCount += msg.tokens;
      } else {
        break;
      }
    }
    return relevantMessages;
  }
  
  // summarize the messages if the token usage exceeds the token limit
  private async manageMemory(): Promise<void> {
    if (this.getTokenUsage() <= this.tokenLimit) return;
    
    while (this.getTokenUsage() > this.tokenLimit) {
      const { toKeep, toSummarize } = this.splitMessages();
      
      if (toSummarize.length === 0) break;
      const summary = await this.createSummary(toSummarize);
      
      // store summary in database
      await this.db.insert(summariesTable).values({
        content: summary.content,
        originalTokens: summary.originalTokens,
        summarizedTokens: summary.summarizedTokens,
        summaryDate: new Date(summary.summaryDate),
        conversationId: this.conversationId,
        metadata: { messageIds: toSummarize.map(m => m.metadata?.id) }
      });
      
      this.cachedSummaries.push(summary);
      
      const message = this.createMessage('system', summary.content, {
        type: 'summary',
        originalTokens: summary.originalTokens,
        summaryDate: summary.summaryDate
      });
      
      this.cachedMessages = [...[message], ...toKeep];
      this.dirty = true;
    }
  }
  
  // splits messages into two (to keep or to summarize)
  private splitMessages(): { toKeep: MemoryMessage[]; toSummarize: MemoryMessage[] } {
    let tokenCount = 0;
    const toKeep: MemoryMessage[] = [];
    const toSummarize: MemoryMessage[] = [];
    
    // keeep most recent messages up to 80% of token limit
    // the rest is summarized
    for (let i = this.cachedMessages.length - 1; i >= 0; i--) {
      const msg = this.cachedMessages[i];
      
      if (msg) {
        if (msg.metadata?.type === 'summary' && tokenCount + msg.tokens <= this.tokenLimit * 0.8) {
          toKeep.unshift(msg);
          tokenCount += msg.tokens;
        } else if (tokenCount + msg.tokens <= this.tokenLimit * 0.8) {
          toKeep.unshift(msg);
          tokenCount += msg.tokens;
        } else {
          toSummarize.push(msg);
        }
      }
    }
    return { toKeep, toSummarize };
  }

  // pass in default prompt and summarize with provider
  private async createSummary(messages: MemoryMessage[]): Promise<MemorySummary> {
    const conversation = messages
      .map((m) => `${m.role.toUpperCase()} (${new Date(m.createdAt).toISOString()}): ${m.content}`)
      .join('\n\n');
    
    const prompt = `${SUMMARIZE_PROMPT}\n\n${conversation}`;
    const response = await this.provider.generateResponse([
      {
        role: 'system',
        content: prompt
      }
    ]);
    
    return {
      content: response.content,
      originalTokens: messages.reduce((acc, m) => acc + m.tokens, 0),
      summarizedTokens: this.calculateTokens(response.content),
      summaryDate: Date.now()
    };
  }
  
  
  private async syncMemory(): Promise<void> {
    if (!this.dirty) return;
    
    // this would sync any unsaved changes to the database
    // im already saving messages as they added
    this.dirty = false;
  }
  
  getConversationId(): string {
    return this.conversationId;
  }
  
  async loadConversation(conversationId: string): Promise<void> {
    this.conversationId = conversationId;
    
    // load the messages from database
    const dbMessages = await this.db.select().from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);
    
    this.cachedMessages = dbMessages.map((m: MessageRow) => ({
      role: m.role as MemoryMessage['role'],
      content: m.content,
      tokens: m.tokens,
      createdAt: m.createdAt.getTime(),
      metadata: m.metadata as Record<string, any>
    }));
    
    // load the summaries
    const dbSummaries = await this.db.select().from(summariesTable)
      .where(eq(summariesTable.conversationId, conversationId))
      .orderBy(summariesTable.summaryDate);
    
    this.cachedSummaries = dbSummaries.map((s: SummaryRow) => ({
      content: s.content,
      originalTokens: s.originalTokens,
      summarizedTokens: s.summarizedTokens,
      summaryDate: s.summaryDate.getTime()
    }));
  }
}