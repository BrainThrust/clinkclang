import { MemorySection } from '@/agent-core/memory/memory-schema';
import { BaseMemory } from '@/agent-core/memory/memory';

function defaultTokenizer(text: string): number {
  return Math.ceil(text.length / 4);
}

export class ShortTermMemory extends BaseMemory {
  private memory: MemorySection[] = [];
  private maxTokens: number;
  private currentTokens = 0;
  private tokenizer: (text: string) => number;


  constructor(
    maxTokens = 4000,
    tokenizer: (text: string) => number = defaultTokenizer
  ) {
    super();
    this.maxTokens = maxTokens;
    this.tokenizer = tokenizer;
  }


  addContent(content: string, type: MemorySection['type'], priority = 0) {
    const tokens = this.tokenizer(content);

    const newEntry: MemorySection = {
      priority,
      tokens,
      content,
      type
    };

    this.memory.push(newEntry);
    this.currentTokens += tokens;
    while (this.currentTokens > this.maxTokens && this.memory.length > 1) {
      const lowestPriority = Math.min(...this.memory.map(m => m.priority));
      const evictIndex = this.memory.findIndex(m => m.priority === lowestPriority);

      if (evictIndex === -1) break;

      const [evicted] = this.memory.splice(evictIndex, 1);
      if (evicted) {
        this.currentTokens -= evicted.tokens;
      }
    }
  }

  getContext(priorityThreshold = 0): string {
    const relevant = this.memory.filter(m => m.priority >= priorityThreshold);
    relevant.sort((a, b) => b.priority - a.priority);

    return relevant.map(m => m.content).join('\n\n');
  }

  getMemorySections(): MemorySection[] {
    return [...this.memory];
  }

  clear(): void {
    this.memory = [];
    this.currentTokens = 0;
  }

  getTokenUsage(): number {
    return this.currentTokens;
  }
}
