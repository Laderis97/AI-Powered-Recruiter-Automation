/**
 * Outreach Message Generation Workflow
 * Uses AI to generate personalized recruitment messages
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

interface CandidateData {
  name: string;
  title: string;
  skills: string[];
  experience: string;
  location: string;
  profileUrl?: string;
}

interface JobData {
  jobTitle: string;
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'manager';
  requiredSkills: string[];
  yearsOfExperience: string;
  company: string;
  location?: string;
  summary?: string;
}

interface OutreachMessage {
  subject: string;
  message: string;
  tone: 'casual' | 'professional' | 'formal' | 'executive';
  characterCount: number;
  personalizationScore: number;
}

interface OutreachConfig {
  openaiApiKey: string;
  model?: string;
  temperature?: number;
  maxLength?: number;
}

export class OutreachGenerator {
  private openai: OpenAI;
  private promptTemplate: string;
  private config: OutreachConfig;

  constructor(config: OutreachConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
    
    // Load prompt template
    this.promptTemplate = this.loadPromptTemplate();
  }

  private loadPromptTemplate(): string {
    try {
      const promptPath = join(__dirname, '../prompts/outreach_template.txt');
      return readFileSync(promptPath, 'utf-8');
    } catch (error) {
      console.warn('⚠️ Could not load prompt template, using default');
      return this.getDefaultPrompt();
    }
  }

  private getDefaultPrompt(): string {
    return `You are a recruiter writing a friendly, professional outreach message for a potential candidate.

Use the following details:
- Candidate Name: {name}
- Job Title: {jobTitle}
- Skills Required: {skills}
- Seniority Level: {seniorityLevel}
- Company: {company}
- Years of Experience: {yearsOfExperience}
- Location: {location}

Write a short, personalized message under 500 characters inviting them to discuss the role. Match the tone to the role's seniority:

Generate only the message text without any labels or formatting.`;
  }

  async generateOutreach(
    candidateData: CandidateData,
    jobData: JobData
  ): Promise<OutreachMessage> {
    try {
      const prompt = this.buildPrompt(candidateData, jobData);

      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature || 0.7,
        max_tokens: 300
      });

      const messageContent = response.choices[0]?.message?.content?.trim();
      if (!messageContent) {
        throw new Error('No response from OpenAI');
      }

      // Generate subject line
      const subject = await this.generateSubject(candidateData, jobData);

      // Determine tone based on seniority
      const tone = this.determineTone(jobData.seniorityLevel);

      // Calculate personalization score
      const personalizationScore = this.calculatePersonalizationScore(
        messageContent,
        candidateData,
        jobData
      );

      const outreachMessage: OutreachMessage = {
        subject,
        message: messageContent,
        tone,
        characterCount: messageContent.length,
        personalizationScore
      };

      console.log(`✅ Generated outreach for ${candidateData.name} (${outreachMessage.characterCount} chars)`);
      
      return outreachMessage;

    } catch (error) {
      console.error('❌ Outreach generation failed:', error);
      return this.generateFallbackMessage(candidateData, jobData);
    }
  }

  private buildPrompt(candidateData: CandidateData, jobData: JobData): string {
    return this.promptTemplate
      .replace('{name}', candidateData.name)
      .replace('{jobTitle}', jobData.jobTitle)
      .replace('{skills}', jobData.requiredSkills.join(', '))
      .replace('{seniorityLevel}', jobData.seniorityLevel)
      .replace('{company}', jobData.company)
      .replace('{yearsOfExperience}', jobData.yearsOfExperience)
      .replace('{location}', jobData.location || candidateData.location);
  }

  private async generateSubject(
    candidateData: CandidateData,
    jobData: JobData
  ): Promise<string> {
    try {
      const subjectPrompt = `Write a compelling subject line for a LinkedIn message to ${candidateData.name} about a ${jobData.jobTitle} role at ${jobData.company}. Keep it under 60 characters and make it personal.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: subjectPrompt }],
        temperature: 0.8,
        max_tokens: 30
      });

      return response.choices[0]?.message?.content?.trim() || 
             `${jobData.jobTitle} opportunity at ${jobData.company}`;

    } catch (error) {
      return `${jobData.jobTitle} opportunity at ${jobData.company}`;
    }
  }

  private determineTone(seniorityLevel: string): OutreachMessage['tone'] {
    switch (seniorityLevel) {
      case 'junior':
        return 'casual';
      case 'mid':
        return 'professional';
      case 'senior':
        return 'formal';
      case 'manager':
        return 'executive';
      default:
        return 'professional';
    }
  }

  private calculatePersonalizationScore(
    message: string,
    candidateData: CandidateData,
    jobData: JobData
  ): number {
    let score = 0;
    const messageLower = message.toLowerCase();

    // Check for candidate name (20 points)
    if (messageLower.includes(candidateData.name.toLowerCase())) {
      score += 20;
    }

    // Check for specific skills (15 points each, max 30)
    const skillMentions = candidateData.skills.filter(skill =>
      messageLower.includes(skill.toLowerCase())
    ).length;
    score += Math.min(skillMentions * 15, 30);

    // Check for current title/role (15 points)
    if (messageLower.includes(candidateData.title.toLowerCase())) {
      score += 15;
    }

    // Check for location (10 points)
    if (messageLower.includes(candidateData.location.toLowerCase())) {
      score += 10;
    }

    // Check for company mention (10 points)
    if (messageLower.includes(jobData.company.toLowerCase())) {
      score += 10;
    }

    // Check for role-specific content (15 points)
    if (messageLower.includes(jobData.jobTitle.toLowerCase())) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  private generateFallbackMessage(
    candidateData: CandidateData,
    jobData: JobData
  ): OutreachMessage {
    console.log('⚠️ Using fallback outreach generation');

    const templates = {
      junior: `Hi ${candidateData.name}! 👋 Saw your background in ${candidateData.title} and thought you'd be great for our ${jobData.jobTitle} role at ${jobData.company}. Interested in learning more?`,
      
      mid: `Hi ${candidateData.name}, your experience in ${candidateData.skills[0] || 'technology'} caught my attention. We have an exciting ${jobData.jobTitle} position at ${jobData.company}. Would love to discuss!`,
      
      senior: `Dear ${candidateData.name}, your expertise in ${candidateData.skills.slice(0, 2).join(' and ')} is impressive. We're seeking a ${jobData.jobTitle} at ${jobData.company}. Open to a conversation?`,
      
      manager: `Dear ${candidateData.name}, given your leadership background, I wanted to discuss our ${jobData.jobTitle} opportunity at ${jobData.company}. Would you be interested in exploring this further?`
    };

    const message = templates[jobData.seniorityLevel] || templates.mid;
    const subject = `${jobData.jobTitle} opportunity at ${jobData.company}`;

    return {
      subject,
      message,
      tone: this.determineTone(jobData.seniorityLevel),
      characterCount: message.length,
      personalizationScore: 65 // Default moderate score for fallback
    };
  }

  async batchGenerateOutreach(
    candidates: CandidateData[],
    jobData: JobData
  ): Promise<{ candidate: CandidateData; outreach: OutreachMessage }[]> {
    console.log(`🔄 Batch generating outreach for ${candidates.length} candidates`);

    const results: { candidate: CandidateData; outreach: OutreachMessage }[] = [];

    // Process in batches to respect rate limits
    const batchSize = 5;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);

      const batchPromises = batch.map(async candidate => {
        const outreach = await this.generateOutreach(candidate, jobData);
        return { candidate, outreach };
      });

      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('❌ Batch outreach generation failed:', result.reason);
        }
      }

      // Rate limiting delay
      if (i + batchSize < candidates.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Generated outreach for ${results.length}/${candidates.length} candidates`);
    return results;
  }
}

// A/B Testing for message variants
export class OutreachABTester extends OutreachGenerator {
  async generateMessageVariants(
    candidateData: CandidateData,
    jobData: JobData,
    variantCount: number = 3
  ): Promise<OutreachMessage[]> {
    const variants: OutreachMessage[] = [];

    for (let i = 0; i < variantCount; i++) {
      // Vary temperature for different creative approaches
      const originalTemp = this.config.temperature || 0.7;
      this.config.temperature = 0.5 + (i * 0.2);

      const variant = await this.generateOutreach(candidateData, jobData);
      variants.push(variant);

      // Reset temperature
      this.config.temperature = originalTemp;
    }

    return variants;
  }
}

// Usage Example
export async function runOutreachGenerator(
  candidates: CandidateData[],
  jobData: JobData
): Promise<{ candidate: CandidateData; outreach: OutreachMessage }[]> {
  const config: OutreachConfig = {
    openaiApiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.7,
    maxLength: 500
  };

  const generator = new OutreachGenerator(config);

  try {
    const results = await generator.batchGenerateOutreach(candidates, jobData);
    
    console.log(`💬 Generated ${results.length} personalized outreach messages`);
    
    // Log quality metrics
    const avgPersonalization = results.reduce((sum, r) => sum + r.outreach.personalizationScore, 0) / results.length;
    const avgLength = results.reduce((sum, r) => sum + r.outreach.characterCount, 0) / results.length;
    
    console.log(`📊 Avg personalization: ${avgPersonalization.toFixed(1)}%, Avg length: ${avgLength.toFixed(0)} chars`);
    
    return results;
  } catch (error) {
    console.error('❌ Outreach generation workflow failed:', error);
    throw error;
  }
}