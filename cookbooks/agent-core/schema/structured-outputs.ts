import { z } from "zod";

export interface StructuredOutputConfig {
  strict?: boolean; // the idea is that invalid inputs will raise an error
  maxRetries?: number; // number of times to retry if the input is invalid
  debug?: boolean; // troubleshoot capabilities
}

export type SchemaType = z.ZodTypeAny; // this is the input schema type. setting it to ZodTypeAny so that it can accept any valid Zod schema

export interface ValidationError {
  message: string;
}

export interface ParsedOutput<A> {
  success: boolean;
  data?: A;
  errors?: ValidationError[];
}

  