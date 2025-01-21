export abstract class Memory {
  abstract append(memory: string[]): void;

  abstract remove(memory: string): void;
  removeMany(memories: string[]): void {
    memories.forEach((m) => this.remove(m));
  }

  abstract reset(): void;

  abstract retrieve(task: string): void;
}
