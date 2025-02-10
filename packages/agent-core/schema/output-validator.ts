import { z } from "zod";
import {
  StructuredOutputConfig,
  SchemaType,
  ValidationError,
  ParsedOutput,
} from "@/agent-core/schema/structured-output-schema";

export class StructuredOutputProcessor {
  config: Required<StructuredOutputConfig>;

  constructor(config: StructuredOutputConfig = {}) {
    this.config = {
      strict: config.strict ?? true,
      maxRetries: config.maxRetries ?? 2,
      debug: config.debug ?? false,
    };
  }

  async parse<T extends z.ZodType>(
    schema: T,
    modelResponse: string,
    attempt = 0,
  ): Promise<ParsedOutput<z.infer<T>>> {
    try {
      const parsed = this.extractJSON(modelResponse);

      if (!parsed) {
        throw new Error("Failed to extract valid JSON from response");
      }

      const validation = schema.safeParse(parsed);

      if (!validation.success) {
        if (attempt < this.config.maxRetries) {
          return {
            success: false,
            errors: [{ message: validation.error.message }],
          };
        }

        if (this.config.strict) {
          throw new Error(
            `Validation failed after ${this.config.maxRetries} attempts`,
          );
        }
      }

      return {
        success: true,
        data: validation.success ? validation.data : (parsed as z.infer<T>),
      };
    } catch (error) {
      // DEBUG LOGS
      return {
        success: false,
        errors: [
          {
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      };
    }
  }

  extractJSON(text: string): any | null {
    try {
      return JSON.parse(text);
    } catch (error) {      
      const jsonPattern = /{[\s\S]*?}(?![\s\S]*?})/;
      const match = text.match(jsonPattern);

      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (error) {
          console.error("Failed to parse extracted JSON:", error);
          return null;
        }
      }
      console.error("No JSON found in the response.");
      return null;
    }
  }

  // generating the prompt that instructs the llm to generate a structured output
  generatePrompt<A extends z.ZodType>(schema: A): string {
    const schemaDescription = this.describeSchema(schema);
    // wrote a comprehensive prompt because the nested example was running into errors and I think being more explicit is better
    return [
      "You are a precise JSON generation assistant. Your task is to produce a single, valid JSON object that strictly conforms to the provided schema description.",
      "\nSchema Description:",
      schemaDescription,
      "\nMandatory Instructions:",
      "- Output MUST be a single, well-formed JSON object, parsable with `JSON.parse()`.",
      "- Do NOT include any text outside of the JSON object delimiters `{}`.",
      "- The JSON object MUST adhere to the schema description, including all specified data types, constraints, and structural requirements.",
      "- Pay close attention to:",
      "  - Data types: Use correct JSON data types (string, number, boolean, array, object).",
      "  - Required fields: Include all fields marked as required in the schema.",
      "  - Constraints: Respect all specified constraints, such as minimum/maximum values, string formats (e.g., email), array lengths, and enums.",
      "  - Nesting: Ensure nested objects and arrays are correctly structured.",
      "\nJSON Output:", // this signals the start of the JSON output.
    ].join("\n");
  }

  // i read that passing a JSON directly to the llm is not the best approach and a better way is to describe it in natural language and hence keeping this function here
  describeSchema(schema: SchemaType, indent = 0): string {
    const spaces = " ".repeat(indent);
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      const properties = Object.entries(shape)
        .map(([key, value]) => {
          const fieldSchema = this.describeSchema(
            value as SchemaType,
            indent + 2,
          );
          return `${spaces}  "${key}": ${fieldSchema}`;
        })
        .join(",\n");

      return `{\n${properties}\n${spaces}}`;
    }

    if (schema instanceof z.ZodArray) {
      return `array of ${this.describeSchema(schema.element)}` + 
        (schema._def.minLength ? ` (min ${schema._def.minLength.value} items)` : "") +
        (schema.description ? `\n${schema.description}` : "");
    }
    
    if (schema instanceof z.ZodOptional) {
      return `${this.describeSchema(schema._def.innerType)} (optional)` +
        (schema.description ? `\n${schema.description}` : "");
    }
  
    if (schema instanceof z.ZodEnum) {
      const values: [string, ...string[]] = schema.options;
      return `enum(${values.map((v: string) => `"${v}"`).join(", ")})`;
    }

    const typeMap: Record<string, string> = {
      ZodString: "string",
      ZodNumber: "number",
      ZodBoolean: "boolean",
    };

    return typeMap[schema._def.typeName] || "any";
  }
};