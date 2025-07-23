// src/openai.ts

import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const projectId = process.env.OPENAI_PROJECT_ID;

  if (!apiKey) throw new Error("❌ Missing OPENAI_API_KEY");
  if (!projectId) throw new Error("❌ Missing OPENAI_PROJECT_ID");

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Project": projectId,
      },
    }
  );

  return response.data.choices[0].message.content;
}
