import { Agent } from "@/agent-core/core";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { config } from "dotenv";
config({ path: __dirname + "./../../.env" });

class RAG {
  private vectorStore: NodePgDatabase;
  constructor(vs: NodePgDatabase) {
    this.vectorStore = vs;
  }

  async augmentConversation(agent: Agent, input: string) {
    // At the moment, RAG will simply use the Agent's memory to augment its conversation.
    // More implementations can be added in the future, and this class can be abstracted
    // Once a more concrete implementation is decided upon.

    const augments = await agent.memoryStrategy.retrieve(input);
    const stringAugments = augments.map((m) => m.memory);
    agent.augments = stringAugments;

    // The augments are simply added into a class variable called "augments,"
    // which can be used in future implementations of the generate() function.
  }
}
