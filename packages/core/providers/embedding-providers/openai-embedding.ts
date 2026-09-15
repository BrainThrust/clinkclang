import { EmbeddingProvider, EmbeddingProviderConfig } from './base-embedding';

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
	private apiKey: string;
	private model: string;
	private dimensions: number;
	private batchSize: number;

	constructor(config: EmbeddingProviderConfig) {
		this.apiKey = config.apiKey;
		this.model = config.model || 'text-embedding-3-small';
		this.dimensions = config.dimensions || 1536;
		this.batchSize = config.batchSize || 100;
	}

	async generateEmbedding(text: string): Promise<number[]> {
		try {
			const response = await fetch('https://api.openai.com/v1/embeddings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.apiKey}`
				},
				body: JSON.stringify({
					input: text,
					model: this.model
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const status = response.status;

				console.error(`OpenAI API Error (${status}):`, errorData);

				if (status === 401) {
					throw new Error('Invalid API key. Please check your OpenAI API key.');
				} else if (status === 429) {
					throw new Error(
						'Rate limit exceeded. Please try again later or check your usage limits.'
					);
				}

				throw new Error(
					`OpenAI API error: ${errorData.error?.message || response.statusText || 'Unknown error'}`
				);
			}

			const data = await response.json();
			return data.data[0].embedding;
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error(`Failed to generate embedding: ${String(error)}`);
		}
	}

	async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
		const embeddings: number[][] = [];

		for (let i = 0; i < texts.length; i += this.batchSize) {
			const batch = texts.slice(i, i + this.batchSize);
			const batchResults = await Promise.all(batch.map((text) => this.generateEmbedding(text)));
			embeddings.push(...batchResults);
		}

		return embeddings;
	}
}
