/**
 * Job Description Parsing Workflow
 * Uses AI to extract structured data from job descriptions
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

interface ParsedJobData {
  jobTitle: string;
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'manager';
  requiredSkills: string[];
  yearsOfExperience: string;
  preferredLocation: string;
  summary: string;
}

interface JobParsingConfig {
  openaiApiKey: string;
  model?: string;
  temperature?: number;
}

export class JobDescriptionParser {
  private openai: OpenAI;
  private promptTemplate: string;
  private config: JobParsingConfig;

  constructor(config: JobParsingConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
    
    // Load prompt template
    this.promptTemplate = this.loadPromptTemplate();
  }

  private loadPromptTemplate(): string {
    try {
      const promptPath = join(__dirname, '../prompts/job_parser.txt');
      return readFileSync(promptPath, 'utf-8');
    } catch (error) {
      console.warn('⚠️ Could not load prompt template, using default');
      return this.getDefaultPrompt();
    }
  }

  private getDefaultPrompt(): string {
    return `You are an AI recruiter assistant. Parse the following job description and extract structured data for use in automated sourcing.

Return as JSON with the following keys:
- jobTitle
- seniorityLevel (junior, mid, senior, manager)
- requiredSkills (list of technical skills)
- yearsOfExperience (e.g., "3-5 years", "5+ years", "Not specified")
- preferredLocation (including remote/hybrid options)
- summary (brief summary of the role in 1-2 sentences)

Job Description:
{job_description}

Return only valid JSON without any markdown formatting.`;
  }

  async parseJobDescription(jobDescription: string): Promise<ParsedJobData> {
    try {
      const prompt = this.promptTemplate.replace('{job_description}', jobDescription);

      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature || 0.1,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const parsedData = JSON.parse(content) as ParsedJobData;
      
      // Validate required fields
      this.validateParsedData(parsedData);
      
      console.log(`✅ Successfully parsed job: ${parsedData.jobTitle}`);
      return parsedData;

    } catch (error) {
      console.error('❌ Job parsing failed:', error);
      
      // Return fallback data if parsing fails
      return this.generateFallbackData(jobDescription);
    }
  }

  private validateParsedData(data: ParsedJobData): void {
    const requiredFields = ['jobTitle', 'seniorityLevel', 'requiredSkills', 'summary'];
    
    for (const field of requiredFields) {
      if (!data[field as keyof ParsedJobData]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(data.requiredSkills)) {
      throw new Error('requiredSkills must be an array');
    }

    const validSeniorityLevels = ['junior', 'mid', 'senior', 'manager'];
    if (!validSeniorityLevels.includes(data.seniorityLevel)) {
      throw new Error(`Invalid seniority level: ${data.seniorityLevel}`);
    }
  }

  private generateFallbackData(jobDescription: string): ParsedJobData {
    console.log('⚠️ Using fallback job parsing');
    
    return {
      jobTitle: this.extractTitleFallback(jobDescription),
      seniorityLevel: this.extractSeniorityFallback(jobDescription),
      requiredSkills: this.extractSkillsFallback(jobDescription),
      yearsOfExperience: this.extractExperienceFallback(jobDescription),
      preferredLocation: this.extractLocationFallback(jobDescription),
      summary: this.generateSummaryFallback(jobDescription)
    };
  }

  private extractTitleFallback(description: string): string {
    const lines = description.split('\n');
    for (const line of lines.slice(0, 5)) {
      if (line.trim() && line.length < 100) {
        return line.trim();
      }
    }
    return 'Software Engineer';
  }

  private extractSeniorityFallback(description: string): 'junior' | 'mid' | 'senior' | 'manager' {
    const text = description.toLowerCase();
    
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) {
      return 'senior';
    }
    if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) {
      return 'junior';
    }
    if (text.includes('manager') || text.includes('director')) {
      return 'manager';
    }
    
    return 'mid';
  }

  private extractSkillsFallback(description: string): string[] {
    const skills = new Set<string>();
    const text = description.toLowerCase();
    
    const commonSkills = [
      'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
      'node.js', 'django', 'flask', 'spring', 'aws', 'azure', 'docker',
      'kubernetes', 'git', 'sql', 'mongodb', 'postgresql'
    ];
    
    for (const skill of commonSkills) {
      if (text.includes(skill)) {
        skills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    }
    
    return Array.from(skills);
  }

  private extractExperienceFallback(description: string): string {
    const experiencePattern = /(\d+)[\+\-\s]*(?:to|-)?\s*(\d+)?\s*years?\s*(?:of\s*)?experience/i;
    const match = description.match(experiencePattern);
    
    if (match) {
      return match[0];
    }
    
    return 'Not specified';
  }

  private extractLocationFallback(description: string): string {
    const locationPattern = /location:?\s*([^\n\r]+)/i;
    const match = description.match(locationPattern);
    
    if (match) {
      return match[1].trim();
    }
    
    if (description.toLowerCase().includes('remote')) {
      return 'Remote';
    }
    
    return 'Not specified';
  }

  private generateSummaryFallback(description: string): string {
    const sentences = description.split(/[.!?]+/);
    const meaningfulSentences = sentences
      .filter(s => s.trim().length > 20)
      .slice(0, 2);
    
    return meaningfulSentences.join('. ').trim() + '.';
  }

  async batchParseJobs(jobDescriptions: string[]): Promise<ParsedJobData[]> {
    console.log(`🔄 Batch parsing ${jobDescriptions.length} job descriptions`);
    
    const results: ParsedJobData[] = [];
    
    // Process jobs in parallel with rate limiting
    const batchSize = 5;
    for (let i = 0; i < jobDescriptions.length; i += batchSize) {
      const batch = jobDescriptions.slice(i, i + batchSize);
      
      const batchPromises = batch.map(description => 
        this.parseJobDescription(description)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('❌ Batch job parsing failed:', result.reason);
        }
      }
      
      // Rate limiting delay
      if (i + batchSize < jobDescriptions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`✅ Successfully parsed ${results.length}/${jobDescriptions.length} jobs`);
    return results;
  }
}

// Usage Example
export async function runJobParser(jobDescriptions: string[]): Promise<ParsedJobData[]> {
  const config: JobParsingConfig = {
    openaiApiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.1
  };

  const parser = new JobDescriptionParser(config);
  
  try {
    if (jobDescriptions.length === 1) {
      const result = await parser.parseJobDescription(jobDescriptions[0]);
      return [result];
    } else {
      return await parser.batchParseJobs(jobDescriptions);
    }
  } catch (error) {
    console.error('❌ Job parsing workflow failed:', error);
    throw error;
  }
}