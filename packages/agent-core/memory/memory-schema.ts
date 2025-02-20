export interface MemorySection {
    priority: number;
    tokens: number;
    content: string;
    type: 'system' | 'tool' | 'history' | 'observation';
  }
  