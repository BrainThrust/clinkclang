import { z } from "zod";

export interface StructuredOutputConfig {
  strict?: boolean;
  maxRetries?: number;
  debug?: boolean;
}

export type SchemaType = z.ZodTypeAny;

export interface ValidationError {
  message: string;
}

export interface ParsedOutput<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}