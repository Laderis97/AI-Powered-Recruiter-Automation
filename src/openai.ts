// src/openai.ts

import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

interface JobDescription {
  jobTitle: string;
  seniorityLevel: string;
  requiredSkills: string[];
  yearsOfExperience: string;
  preferredLocation: string;
  summary: string;
}

interface Candidate {
  name: string;
  title: string;
  skills: string[];
  location: string;
  experience: string;
  email?: string;
  linkedin?: string;
}

export async function callOpenAI(prompt: string, model: string = "gpt-4"): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const projectId = process.env.OPENAI_PROJECT_ID;

  if (!apiKey) throw new Error("❌ Missing OPENAI_API_KEY in .env");
  if (!projectId) throw new Error("❌ Missing OPENAI_PROJECT_ID in .env");

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model,
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

export async function parseJobDescription(description: string): Promise<JobDescription> {
  const promptTemplate = `
You are an AI recruiter assistant. Parse the following job description and extract structured data for use in automated sourcing.

Return as JSON with the following keys:
- jobTitle
- seniorityLevel
- requiredSkills (list)
- yearsOfExperience
- preferredLocation
- summary (brief summary of the role)

Job Description:
${description}

Return only valid JSON:
`;

  const result = await callOpenAI(promptTemplate);
  return JSON.parse(result);
}

export async function generateOutreach(candidate: Candidate, job: JobDescription): Promise<string> {
  const outreachTemplate = `
You are a recruiter writing a friendly, professional outreach message for a potential candidate.

Use the following details:
- Candidate Name: ${candidate.name}
- Job Title: ${job.jobTitle}
- Skills Required: ${job.requiredSkills.join(", ")}
- Seniority Level: ${job.seniorityLevel}
- Company: YourCompany Inc.

Write a short, personalized message under 500 characters inviting them to discuss the role. Match the tone to the role's seniority (casual for junior, formal for execs).

Make it personal, mention specific skills that match, and include a clear call to action.

Output:
`;

  const result = await callOpenAI(outreachTemplate);
  return result.trim();
}

export async function generateCandidateProfile(job: JobDescription): Promise<Partial<Candidate>> {
  const prompt = `
Based on this job description, generate a realistic candidate profile that would be a good fit:

Job: ${job.jobTitle}
Required Skills: ${job.requiredSkills.join(", ")}
Seniority: ${job.seniorityLevel}
Experience: ${job.yearsOfExperience}

Generate a JSON response with:
- name (realistic full name)
- title (current job title)
- skills (list of relevant skills)
- location (realistic location)
- experience (years of experience)
- email (professional email format)
- linkedin (LinkedIn profile URL format)

Return only valid JSON:
`;

  const result = await callOpenAI(prompt);
  return JSON.parse(result);
}

export async function analyzeCandidateFit(candidate: Candidate, job: JobDescription): Promise<{
  fitScore: number;
  reasoning: string;
  recommendations: string[];
}> {
  const prompt = `
Analyze the fit between this candidate and job:

Candidate:
- Name: ${candidate.name}
- Current Title: ${candidate.title}
- Skills: ${candidate.skills.join(", ")}
- Experience: ${candidate.experience}
- Location: ${candidate.location}

Job:
- Title: ${job.jobTitle}
- Required Skills: ${job.requiredSkills.join(", ")}
- Seniority: ${job.seniorityLevel}
- Experience Required: ${job.yearsOfExperience}

Return JSON with:
- fitScore (0-100)
- reasoning (explanation of the fit)
- recommendations (list of suggestions for outreach)

Return only valid JSON:
`;

  const result = await callOpenAI(prompt);
  return JSON.parse(result);
}

export async function generateFollowUpMessage(originalMessage: string, candidateResponse?: string): Promise<string> {
  const prompt = `
Generate a follow-up message based on this context:

Original outreach: ${originalMessage}
${candidateResponse ? `Candidate response: ${candidateResponse}` : 'No response yet'}

Write a professional follow-up that:
- Is not pushy or aggressive
- Offers additional value or information
- Has a clear next step
- Is under 300 characters

Output:
`;

  const result = await callOpenAI(prompt);
  return result.trim();
}

export async function generateJobSummary(jobDescription: string): Promise<string> {
  const prompt = `
Summarize this job description in a clear, concise way that highlights:
- Key responsibilities
- Required qualifications
- Company culture/benefits
- Growth opportunities

Job Description:
${jobDescription}

Write a compelling summary under 200 words:
`;

  const result = await callOpenAI(prompt);
  return result.trim();
}
