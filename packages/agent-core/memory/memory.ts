export type MemoryFragment = {
  memory: string;
  sessionId: string;
};
export abstract class Memory {
  abstract append(memory: string[]): Promise<void>;

  abstract remove(memory: string): Promise<void>;
  
  removeMany(memories: string[]): void {
    memories.forEach((m) => this.remove(m));
  }

  abstract reset(): Promise<void>;

  abstract retrieve(task: string): Promise<MemoryFragment[]>;
}
