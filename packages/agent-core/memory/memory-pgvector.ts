import { Memory } from "./memory";
import { getEmbeddingsOpenAI } from "@/agent-functions/memory/get-embeddings-openai";
import { memoryTable } from "./db/schema";
import { OpenAIEmbedding } from "@/agent-core/schema/memory";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, l2Distance } from "drizzle-orm";

type PgVectorMemoryRow = {
  memory: string;
  embedding: number[];
  session_id: string;
};

export class PgVectorMemory extends Memory {
  private dbClient: NodePgDatabase;

  constructor(connectionUrl: string) {
    super();
    this.dbClient = drizzle(connectionUrl);
  }

  async getAndFormatEmbeddings(
    memories: string[],
    ssid?: string
  ): Promise<PgVectorMemoryRow[]> {
    const embeddings: OpenAIEmbedding[] = await getEmbeddingsOpenAI(memories);
    if (embeddings.length == 0) {
      console.log("An error occurred during embedding generation.");
      return [];
    }

    const embeddingData = embeddings.flatMap((e) =>
      e.index >= memories.length
        ? []
        : {
            memory: memories[e.index]!,
            embedding: e.embedding,
            session_id: ssid ? ssid : "",
          }
    );

    return embeddingData;
  }

  async append(memories: string[], ssid?: string) {
    const embeddingData = await this.getAndFormatEmbeddings(
      memories,
      ssid ? ssid : ""
    );

    try {
      await this.dbClient.insert(memoryTable).values(embeddingData);
    } catch (e) {
      console.error(e);
    }
  }

  async remove(memory: string) {
    try {
      await this.dbClient
        .delete(memoryTable)
        .where(eq(memoryTable.memory, memory));
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
        .orderBy(
          l2Distance(memoryTable.embedding, embeddingData[0]?.embedding!)
        )
        .limit(5);
    } catch (e) {
      console.error(e);
    }
  }

  async initialize(prompt: string, ssid?: string) {
    this.append([prompt], ssid ? ssid : "");
  }

  async reset() {
    try {
      await this.dbClient.delete(memoryTable);
    } catch (e) {
      console.error(e);
    }
  }
}
