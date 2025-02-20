import { MemorySection } from "@/agent-core/memory/memory-schema";

export abstract class BaseMemory {
  abstract addContent(
    content: string, 
    type: MemorySection['type'], 
    priority?: number
  ): void;

  abstract getContext(priorityThreshold?: number): string;

  abstract getMemorySections(): MemorySection[];

  abstract clear(): void;

  abstract getTokenUsage(): number;
}
