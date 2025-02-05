import { z } from "zod";

export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
};

export interface ModelConfig {
  apiKey: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  version?: string;
  stream?: boolean; // adding stream option for deepseek provider
  [key: string]: any;
}

export interface ModelResponse {
  content: string;
  metadata?: any;
};

export interface Schema {
  name: string;
  description?: string;
  schema: z.ZodTypeAny;
  example?: unknown;
};

export interface StructuredOutputConfig {
  strict?: boolean;
  maxRetries?: number;
  debug?: boolean;
};

export interface ValidationError {
  path: string;
  message: string;
  code: string;
};

export interface ParsedOutput<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
};