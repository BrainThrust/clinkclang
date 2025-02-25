export interface MemoryMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tokens: number;
  createdAt: number;
  metadata?: Record<string, any>;
}

export interface MemorySummary {
  content: string;
  originalTokens: number;
  summarizedTokens: number;
  summaryDate: number;
}
