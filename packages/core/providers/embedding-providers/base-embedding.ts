export interface EmbeddingProviderConfig {
  apiKey: string;
  model?: string;
  dimensions?: number;
  batchSize?: number;
}

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
}