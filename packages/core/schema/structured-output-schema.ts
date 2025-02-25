import { z } from "zod";

export interface StructuredOutputConfig {
  strict?: boolean;
  maxRetries?: number;
  debug?: boolean;
};

export type SchemaType = z.ZodTypeAny;

export interface ValidationError {
  message: string;
};

export interface ParsedOutputSuccess<T> {
  success: true;
  data: T;
};

export interface ParsedOutputFailure {
  success: false;
  errors: ValidationError[];
};

export type ParsedOutput<T> = ParsedOutputSuccess<T> | ParsedOutputFailure;

