// TODO: complete the implementation of long-term memory
import { BaseMemory } from "@/agent-core/memory/memory";
import { MemorySection } from "@/agent-core/schema/memory-schema";
import { getEmbeddingsOpenAI } from "packages/functions/memory/get-embeddings-openai";
import { memoryTable } from "./db/schema";
import { OpenAIEmbedding } from "@/agent-core/schema/memory-shcema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, l2Distance } from "drizzle-orm";
import { config } from "dotenv";
config({ path: __dirname + "./../../../.env" });

type PgVectorMemoryRow = {
  memory: string;
  embedding: number[];
};

export class LongTermMemory extends BaseMemory {
  dbClient = drizzle(process.env.DATABASE_URL!);

  async getAndFormatEmbeddings(memories: string[]): Promise<PgVectorMemoryRow[]> {
    const embeddings: OpenAIEmbedding[] = await getEmbeddingsOpenAI(memories);
    if (embeddings.length == 0) {
      console.log("An error occurred during embedding generation.");
      return [];
    }

    const embeddingData = embeddings.flatMap((e) =>
      e.index >= memories.length
        ? []
        : { memory: memories[e.index]!, embedding: e.embedding }
    );

    return embeddingData;
  }

  async append(memories: string[]) {
    const embeddingData = await this.getAndFormatEmbeddings(memories);
    try {
      await this.dbClient.insert(memoryTable).values(embeddingData);
    } catch (e) {
      console.error(e);
    }
  }

  async remove(memory: string) {
    try {
      await this.dbClient.delete(memoryTable).where(eq(memoryTable.memory, memory));
    } catch (e) {
      console.error(e);
    }
  }

  async retrieve(memory: string) {
    const embeddingData = await this.getAndFormatEmbeddings([memory]);
    try {
      return await this.dbClient
        .select()
        .from(memoryTable)
        .orderBy(l2Distance(memoryTable.embedding, embeddingData[0]?.embedding!))
        .limit(5);
    } catch (e) {
      console.error(e);
    }
  }

  async reset() {
    try {
      await this.dbClient.delete(memoryTable);
    } catch (e) {
      console.error(e);
    }
  }

  addContent(content: string, type: MemorySection['type'], priority = 0): void {
    this.append([content]).catch((e) => console.error('Error in addContent:', e));
  }


  getContext(priorityThreshold = 0): string {
    // because "retrieve" is async, but this method is not, we do something basic:
    // i think we'll just warn that the user should call retrieve(...) directly, or do a short-circuit for now.
    console.warn('getContext() is not truly synchronous. Returning placeholder string.');
    return 'Long-term memory is asynchronous. Please use retrieve(...) directly.';
  }


  getMemorySections(): MemorySection[] {
    console.warn('getMemorySections() is not fully implemented for async DB usage.');
    // return an empty array or a cached copy if you have one
    return [];
  }

  clear(): void {
    this.reset().catch((e) => console.error('Error clearing vector memory:', e));
  }


  getTokenUsage(): number {
    // for now, we can say we are not tracking tokens here
    return 0;
  }
}
