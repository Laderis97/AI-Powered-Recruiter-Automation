// src/llmClient.ts

import axios from 'axios';
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

export interface Result<T> {
  ok: boolean;
  data?: T;
  error?: string;
  raw?: string;
  provider?: string;
  model?: string;
  latency?: number;
}

export interface LlmClient {
  completeJSON<T>(prompt: string, schema: z.ZodSchema<T>): Promise<Result<T>>;
  completeText(prompt: string): Promise<Result<string>>;
}

export class OpenAILlmClient implements LlmClient {
  private apiKey: string;
  private projectId?: string;
  private baseUrl: string;
  private models: string[];

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.projectId = process.env.OPENAI_PROJECT_ID;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.models = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    
    if (!this.apiKey) {
      throw new Error('❌ Missing OPENAI_API_KEY in environment');
    }
  }

  async completeJSON<T>(prompt: string, schema: z.ZodSchema<T>): Promise<Result<T>> {
    const startTime = Date.now();
    
    for (const model of this.models) {
      try {
        const response = await axios.post(
          this.baseUrl,
          {
            model,
            messages: [
              {
                role: "system",
                content: "You are an expert AI recruiter with 10+ years of experience in technical recruitment. You specialize in analyzing candidate-job matches, identifying skills gaps, and generating targeted interview questions. Always respond with valid JSON that matches the requested schema exactly. Provide detailed, actionable insights that help recruiters make informed decisions."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.3, // Lower temperature for more consistent JSON
            max_tokens: 2000,
            response_format: { type: "json_object" }
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.apiKey}`,
              ...(this.projectId && { "OpenAI-Project": this.projectId })
            },
            timeout: 30000
          }
        );

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
          continue; // Try next model
        }

        try {
          const parsed = JSON.parse(content);
          const validated = schema.parse(parsed);
          
          return {
            ok: true,
            data: validated,
            raw: content,
            provider: 'OpenAI',
            model,
            latency: Date.now() - startTime
          };
        } catch (parseError) {
          console.warn(`Model ${model} returned invalid JSON, trying next model...`);
          continue;
        }
      } catch (error) {
        console.warn(`Model ${model} failed, trying next model...`);
        continue;
      }
    }

    return {
      ok: false,
      error: 'All OpenAI models failed to provide valid JSON response',
      provider: 'OpenAI',
      latency: Date.now() - startTime
    };
  }

  async completeText(prompt: string): Promise<Result<string>> {
    const startTime = Date.now();
    
    for (const model of this.models) {
      try {
        const response = await axios.post(
          this.baseUrl,
          {
            model,
            messages: [
              {
                role: "system",
                content: "You are an expert AI recruiter with 10+ years of experience in technical recruitment. Provide clear, professional, and actionable responses that help recruiters evaluate candidates effectively."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1500
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.apiKey}`,
              ...(this.projectId && { "OpenAI-Project": this.projectId })
            },
            timeout: 30000
          }
        );

        const content = response.data.choices[0]?.message?.content;
        if (content) {
          return {
            ok: true,
            data: content,
            provider: 'OpenAI',
            model,
            latency: Date.now() - startTime
          };
        }
      } catch (error) {
        console.warn(`Model ${model} failed, trying next model...`);
        continue;
      }
    }

    return {
      ok: false,
      error: 'All OpenAI models failed to provide response',
      provider: 'OpenAI',
      latency: Date.now() - startTime
    };
  }
}


