import { vector, pgTable, serial, text } from "drizzle-orm/pg-core";

export const memoryTable = pgTable("memory_list", {
  id: serial("id").primaryKey(),
  memory: text("memory").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  session_id: text("session_id").notNull(),
});
