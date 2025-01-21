import { config } from "dotenv";
import {
  OpenAIEmbeddingResponseSchema,
  OpenAIEmbeddingResponse,
  OpenAIEmbedding,
  OpenAIEmbeddingSchema,
} from "@/agent-core/schema/memory";
config({ path: __dirname + "./../../../.env" });

const ENDPOINT_URI = "https://api.openai.com/v1/embeddings";
const EMBEDDING_MODEL = "text-embedding-ada-002";

export async function getEmbeddingOpenAI(
  text: string
): Promise<OpenAIEmbedding> {
  const embeddingResponse: Response = await fetch(ENDPOINT_URI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: EMBEDDING_MODEL,
      encoding_format: "float",
    }),
  });

  try {
    const parsedResponse: OpenAIEmbeddingResponse =
      OpenAIEmbeddingResponseSchema.parse(embeddingResponse);
    const embeddingData: OpenAIEmbedding = OpenAIEmbeddingSchema.parse(
      parsedResponse.data
    );
    return embeddingData;
  } catch (e) {
    console.error(e);
    return OpenAIEmbeddingSchema.parse({});
  }
}
