// src/cursor_mvp_ai_recruiter.ts

import axios from 'axios';
import fs from 'fs/promises';
import * as dotenv from 'dotenv';

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
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const projectId = process.env.OPENAI_PROJECT_ID;

  if (!apiKey) throw new Error('❌ Missing OPENAI_API_KEY in .env');
  if (!projectId) throw new Error('❌ Missing OPENAI_PROJECT_ID in .env');

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'OpenAI-Project': projectId,
      },
    }
  );

  return response.data.choices[0].message.content;
}

async function loadJobDescription(): Promise<string> {
  return await fs.readFile('./input/job_description.txt', 'utf-8');
}

async function parseJobDescription(
  description: string
): Promise<JobDescription> {
  const promptTemplate = await fs.readFile('./prompts/job_parser.txt', 'utf-8');
  const fullPrompt = promptTemplate.replace('{job_description}', description);
  const result = await callOpenAI(fullPrompt);
  return JSON.parse(result);
}

async function generateOutreach(
  candidate: Candidate,
  job: JobDescription
): Promise<string> {
  const outreachTemplate = await fs.readFile(
    './prompts/outreach_template.txt',
    'utf-8'
  );
  const filledPrompt = outreachTemplate
    .replace('{name}', candidate.name)
    .replace('{jobTitle}', job.jobTitle)
    .replace('{skills}', job.requiredSkills.join(', '))
    .replace('{seniorityLevel}', job.seniorityLevel)
    .replace('{company}', 'YourCompany Inc.');

  const result = await callOpenAI(filledPrompt);
  return result.trim();
}

(async () => {
  try {
    const jobText = await loadJobDescription();
    const job = await parseJobDescription(jobText);

    const sampleCandidate: Candidate = {
      name: 'Alex Chen',
      title: 'Senior Backend Engineer',
      skills: ['Node.js', 'AWS', 'MongoDB'],
      location: 'Seattle',
      experience: '7 years',
    };

    const message = await generateOutreach(sampleCandidate, job);
    console.log('\n💬 Outreach Message:\n', message);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('🚨 Error:', error.message);
    } else {
      console.error('🚨 Unknown error:', error);
    }
  }
})();
