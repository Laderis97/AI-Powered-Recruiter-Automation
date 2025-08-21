import { z } from "zod";
import { callOpenAI } from './openai.js';

// Result type for better error handling
export type Ok<T> = { ok: true; data: T; raw?: string };
export type Err = { ok: false; error: string; raw?: string };
export type Result<T> = Ok<T> | Err;

// LLM Client interface for dependency injection
export interface LlmClient {
  completeJSON: <T>(prompt: string, schema: z.ZodType<T>) => Promise<Result<T>>;
}

// Safe completion function with JSON parsing and validation
export async function safeComplete<T>(
  prompt: string, 
  schema: z.ZodType<T>
): Promise<Result<T>> {
  try {
    const raw = await callOpenAI(prompt);
    
    // Try fast path - direct JSON parsing
    try {
      const parsed = JSON.parse(raw);
      const validated = schema.parse(parsed);
      return { ok: true, data: validated, raw };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
    }
    
    // Salvage JSON chunk - look for JSON object at the end
    const match = raw.match(/\{[\s\S]*\}$/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        const validated = schema.parse(parsed);
        return { ok: true, data: validated, raw };
      } catch (salvageError) {
        console.error('JSON salvage error:', salvageError);
      }
    }
    
    return { ok: false, error: "Invalid JSON from model", raw };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "LLM call failed" };
  }
}

// OpenAI LLM Client implementation
export class OpenAILlmClient implements LlmClient {
  async completeJSON<T>(prompt: string, schema: z.ZodType<T>): Promise<Result<T>> {
    return safeComplete(prompt, schema);
  }
}
