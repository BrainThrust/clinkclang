import { BaseMemory } from 'packages/core/memory/memory';
import { MemoryMessage, MemorySummary } from 'packages/core/schema/memory-schema';
import { BaseProvider } from 'packages/core/providers/base-provider';

const DEFAULT_SUMMARIZE_PROMPT = `Condense this conversation history while preserving key details, 
relationships between questions and answers, and technical specifics. Include important numbers, 
names, and concepts:`;

export class ShortTermMemory extends BaseMemory {
	private messages: MemoryMessage[] = [];
	private summaries: MemorySummary[] = [];
	private tokenLimit: number;
	private provider: BaseProvider;

	constructor(config: {
		provider: BaseProvider;
		tokenLimit?: number;
		initialMessages?: MemoryMessage[];
	}) {
		super();
		this.provider = config.provider;
		this.tokenLimit = config.tokenLimit || 4000;
		this.messages = config.initialMessages || [];
	}

	async addMessage(message: Omit<MemoryMessage, 'tokens' | 'createdAt'>): Promise<void> {
		const newMessage = this.createMessage(message.role, message.content, message.metadata);
		this.messages.push(newMessage);
		await this.manageMemory();
	}

	private async manageMemory(): Promise<void> {
		while (this.getTokenUsage() > this.tokenLimit) {
			const { toKeep, toSummarize } = this.splitMessages();

			if (toSummarize.length === 0) break;

			const summary = await this.createSummary(toSummarize);
			this.summaries.push(summary);

			const message = this.createMessage('system', summary.content, {
				originalTokens: summary.originalTokens,
				summaryDate: summary.summaryDate
			});

			this.messages = [...[message], ...toKeep];
		}
	}

	private splitMessages(): { toKeep: MemoryMessage[]; toSummarize: MemoryMessage[] } {
		let tokenCount = 0;
		const toKeep: MemoryMessage[] = [];
		const toSummarize: MemoryMessage[] = [];

		for (let i = this.messages.length - 1; i >= 0; i--) {
			const msg = this.messages[i];

			if (msg) {
				if (tokenCount + msg.tokens <= this.tokenLimit * 0.8) {
					// leave 20% buffer
					toKeep.unshift(msg);
					tokenCount += msg.tokens;
				} else {
					toSummarize.push(msg);
				}
			}
		}

		return { toKeep, toSummarize };
	}

	private async createSummary(messages: MemoryMessage[]): Promise<MemorySummary> {
		const conversation = messages
			.map((m) => `${m.role.toUpperCase()} (${new Date(m.createdAt).toISOString()}): ${m.content}`)
			.join('\n\n');

		const prompt = `${DEFAULT_SUMMARIZE_PROMPT}\n\n${conversation}`;
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

	getMessages(): MemoryMessage[] {
		return [...this.messages];
	}

	getSummaries(): MemorySummary[] {
		return [...this.summaries];
	}

	getTokenUsage(): number {
		return (
			this.messages.reduce((acc, m) => acc + m.tokens, 0) +
			this.summaries.reduce((acc, s) => acc + s.summarizedTokens, 0)
		);
	}

	clear(): void {
		this.messages = [];
		this.summaries = [];
	}
}
