import { z } from "zod";

export const OpenAIEmbeddingSchema = z.object({
  object: z.string().default(''),
  index: z.number().default(-1),
  embedding: z.array(z.number()).default([]),
}).default({});

export type OpenAIEmbedding = z.infer<typeof OpenAIEmbeddingSchema>

export const OpenAIEmbeddingResponseSchema = z.object({
  object: z.string(),
  data: z.array(OpenAIEmbeddingSchema),
  model: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAIEmbeddingResponse = z.infer<typeof OpenAIEmbeddingResponseSchema>