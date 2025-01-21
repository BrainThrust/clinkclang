import { Agent, AgentConfig } from "@/agent-core/core";
import { z } from "zod";
import { Schema } from "@/agent-core/schema/core-schema";

const bookSchemaDefinition: Schema = {
  name: "BookSchema",
  schema: z.object({
    title: z.string(),
    author: z.string(),
    publicationYear: z.number(),
  }),
};

const productReviewSchemaDefinition: Schema = {
  name: "ProductReviewSchema",
  schema: z.object({
    productName: z.string(),
    reviewerName: z.string(),
    reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), 
    rating: z.number().min(1).max(5),
    reviewText: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
  }),
};

const surveySchemaDefinition: Schema = {
  name: "SurveySchema",
  schema: z.object({
    responses: z.array(
      z.object({
        questionId: z.number().int(),
        answer: z.string(),
        confidence: z.number().min(0).max(100),
        followUp: z.string().optional(),
      })
    ).min(2),
    metadata: z.object({
      completionTime: z.number().positive(),
      valid: z.boolean(),
      qualityScore: z.number().min(0).max(10),
    }),
  }),
};

function createAgent(schema: Schema, systemPrompt: string): Agent {
  const config: AgentConfig = {
    providerName: "openai",
    modelName: "gpt-4o", 
    apiKey: 'openai_api_key', 
    systemPrompt,
    temperature: 0.7,
    structure: {
      strict: true,
      maxRetries: 3,
      debug: true,
    },
    outputSchema: schema,
  };
  return new Agent(config);
}

async function generateStructuredResponse(
  input: string,
  schema: Schema,
  systemPrompt: string
): Promise<string> {
  const agent = createAgent(schema, systemPrompt);
  const response = await agent.generate(input);
  return response;
}

// example usage
(async () => {
  try {
    // book information
    console.log("\n=== Book Information Example ===");
    const bookResult = await generateStructuredResponse(
      "The Lord of the Rings was written by J.R.R. Tolkien and published in 1954.",
      bookSchemaDefinition,
      "Extract book information and format it according to the schema. Include only factual information that's explicitly stated."
    );
    console.log("Book Information:", JSON.parse(bookResult));

    // product review
    console.log("\n=== Product Review Example ===");
    const reviewResult = await generateStructuredResponse(
      `
      This is a review for the Acme Blender. 
      John Doe reviewed it on 2023-10-27 and gave it 4 out of 5 stars.
      He said: "This blender is great for smoothies and soups! It's powerful and easy to clean."
      Pros: powerful motor, easy cleaning, versatile use
      Cons: somewhat noisy, higher price point
    `,
      productReviewSchemaDefinition,
      "Extract product review information and format it according to the schema. Ensure all required fields are included.");
    console.log("Product Review:", JSON.parse(reviewResult));

    // survey response
    console.log("\n=== Survey Response Example ===");
    const surveyResult = await generateStructuredResponse(
      "Generate a survey response for a mobile banking app user satisfaction survey.",
      surveySchemaDefinition,
      "Generate a realistic survey response about user satisfaction with a mobile app. Include at least 2 question responses.");
    console.log("Survey Response:", JSON.parse(surveyResult));
  } catch (error) {
    console.error("Error occurred:", error);
  }
})();