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

export async function getEmbeddingsOpenAI(
  inputTexts: string[]
): Promise<OpenAIEmbedding[]> {
  if (inputTexts.length > 2048) {
    return [];
  }

  const embeddingResponse: Response = await fetch(ENDPOINT_URI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: inputTexts,
      model: EMBEDDING_MODEL,
      encoding_format: "float",
    }),
  }).then((e) => e.json());
  
  try {
    const parsedResponse: OpenAIEmbeddingResponse =
      OpenAIEmbeddingResponseSchema.parse(embeddingResponse);

    if (parsedResponse.data.length < 0) return [];
    const embeddingData: OpenAIEmbedding[] = parsedResponse.data.map((d) =>
      OpenAIEmbeddingSchema.parse(d)
    );

    return embeddingData;
  } catch (e) {
    console.error(e);
    return [];
  }
}
