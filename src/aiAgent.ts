// src/aiAgent.ts

import { 
  AlignmentScoreSchema, 
  SkillsGapSchema, 
  CulturalFitSchema,
  type AlignmentScore,
  type SkillsGap,
  type CulturalFit,
  clamp
} from './schemas.js';
import { LlmClient, OpenAILlmClient, type Result } from './llmClient.js';
import { z } from 'zod';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title: string;
  location: string;
  experience: string;
  skills: string[];
  linkedin?: string;
  github?: string;
  createdAt: Date;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  parsedData?: {
    skills?: string[];
    seniority?: 'IC' | 'Manager' | 'Senior' | 'Lead';
    requirements?: string[];
  };
  createdAt: Date;
}

export class AIAgent {
  constructor(
    private llm: LlmClient = new OpenAILlmClient(),
    private log = console
  ) {
    this.log.log('🧠 AI Agent initialized for role alignment analysis');
  }

  /**
   * Calculate comprehensive role alignment between candidate and job
   */
  async calculateRoleAlignment(candidate: Candidate, job: JobPosting): Promise<Result<AlignmentScore>> {
    try {
      const prompt = this.buildRoleAlignmentPrompt(candidate, job);
      const result = await this.llm.completeJSON(prompt, AlignmentScoreSchema);
      
      if (result.ok) {
        return result;
      }
      
      this.log.error('AI role alignment failed:', result.error);
      return { ok: true, data: this.generateFallbackAlignment(candidate, job) };
    } catch (error) {
      this.log.error('Unexpected error in role alignment:', error);
      return { ok: true, data: this.generateFallbackAlignment(candidate, job) };
    }
  }

  /**
   * Analyze skills gap between candidate and job requirements
   */
  async analyzeSkillsGap(candidate: Candidate, job: JobPosting): Promise<Result<SkillsGap>> {
    try {
      const prompt = this.buildSkillsGapPrompt(candidate, job);
      const result = await this.llm.completeJSON(prompt, SkillsGapSchema);
      
      if (result.ok) {
        return result;
      }
      
      this.log.error('AI skills gap analysis failed:', result.error);
      return { ok: true, data: this.generateFallbackSkillsGap(candidate, job) };
    } catch (error) {
      this.log.error('Unexpected error in skills gap analysis:', error);
      return { ok: true, data: this.generateFallbackSkillsGap(candidate, job) };
    }
  }

  /**
   * Generate interview questions based on candidate-job alignment
   */
  async generateInterviewQuestions(candidate: Candidate, job: JobPosting): Promise<Result<string[]>> {
    try {
      const prompt = this.buildInterviewQuestionsPrompt(candidate, job);
      const result = await this.llm.completeJSON(prompt, z.array(z.string()));
      
      if (result.ok) {
        return { ok: true, data: result.data, raw: result.raw };
      }
      
      this.log.error('AI interview questions failed:', result.error);
      return { ok: true, data: this.generateFallbackInterviewQuestions(candidate, job) };
    } catch (error) {
      this.log.error('Unexpected error in interview questions:', error);
      return { ok: true, data: this.generateFallbackInterviewQuestions(candidate, job) };
    }
  }

  /**
   * Generate categorized interview questions based on candidate-job alignment
   */
  async generateCategorizedInterviewQuestions(candidate: Candidate, job: JobPosting): Promise<Result<{
    technical: string[];
    experience: string[];
    problemSolving: string[];
    leadership: string[];
    cultural: string[];
    all: string[];
  }>> {
    try {
      const result = await this.generateInterviewQuestions(candidate, job);
      
      if (result.ok) {
        const questions = result.data;
        
        // Categorize questions based on keywords and content
        const categorized = this.categorizeQuestions(questions);
        
        return { 
          ok: true, 
          data: {
            ...categorized,
            all: questions
          }
        };
      } else {
        return result;
      }
    } catch (error) {
      this.log.error('Unexpected error in categorized interview questions:', error);
      const fallbackQuestions = this.generateFallbackInterviewQuestions(candidate, job);
      const categorized = this.categorizeQuestions(fallbackQuestions);
      
      return { 
        ok: true, 
        data: {
          ...categorized,
          all: fallbackQuestions
        }
      };
    }
  }

  /**
   * Assess cultural fit and soft skills
   */
  async assessCulturalFit(candidate: Candidate, job: JobPosting): Promise<Result<CulturalFit>> {
    try {
      const prompt = this.buildCulturalFitPrompt(candidate, job);
      const result = await this.llm.completeJSON(prompt, CulturalFitSchema);
      
      if (result.ok) {
        return result;
      }
      
      this.log.error('AI cultural fit assessment failed:', result.error);
      return { ok: true, data: this.generateFallbackCulturalFit() };
    } catch (error) {
      this.log.error('Unexpected error in cultural fit assessment:', error);
      return { ok: true, data: this.generateFallbackCulturalFit() };
    }
  }

  // Private prompt building methods
  private buildRoleAlignmentPrompt(candidate: Candidate, job: JobPosting): string {
    return `You are a strict JSON API. Output only valid JSON matching the provided schema. No prose.

Analyze the alignment between a candidate and a job posting.

CANDIDATE:
- Name: ${this.redactPII(candidate.name)}
- Current Title: ${candidate.title}
- Experience: ${candidate.experience}
- Skills: ${candidate.skills.join(', ')}
- Location: ${candidate.location}

JOB POSTING:
- Title: ${job.title}
- Description: ${this.truncateDescription(job.description)}

Please provide a comprehensive analysis including:
1. Overall alignment score (0-100)
2. Technical skills match (0-100)
3. Experience level match (0-100)
4. Skills alignment (0-100)
5. Cultural fit potential (0-100)
6. Detailed breakdown of strengths and gaps
7. Specific recommendations for improvement
8. Relevant interview questions
9. Potential risk factors
10. Training needs

If unsure, use empty arrays; never invent entities not mentioned.

Format the response as a JSON object with these exact keys:
{
  "overallScore": number,
  "technicalScore": number,
  "experienceScore": number,
  "skillsScore": number,
  "culturalFitScore": number,
  "detailedBreakdown": "string",
  "recommendations": ["string"],
  "interviewQuestions": ["string"],
  "riskFactors": ["string"],
  "trainingNeeds": ["string"]
}`;
  }

  private buildSkillsGapPrompt(candidate: Candidate, job: JobPosting): string {
    return `You are a strict JSON API. Output only valid JSON matching the provided schema. No prose.

Perform a comprehensive skills gap analysis between a candidate and a job posting.

CANDIDATE:
- Name: ${this.redactPII(candidate.name)}
- Current Title: ${candidate.title}
- Experience: ${candidate.experience}
- Skills: ${candidate.skills.join(', ')}
- Location: ${candidate.location}

JOB POSTING:
- Title: ${job.title}
- Description: ${this.truncateDescription(job.description)}

Please analyze the skills gap and provide:

1. MISSING CRITICAL SKILLS: Skills that are essential for the role but the candidate doesn't have
2. CRITICAL GAPS: Areas where the candidate's skills are insufficient for the role requirements
3. NICE TO HAVE: Skills that would be beneficial but aren't essential

For each category, provide specific, actionable insights. Consider:
- Technical skills mentioned in the job description
- Industry-specific knowledge requirements
- Tools and technologies mentioned
- Experience level requirements
- Soft skills and leadership requirements

If unsure, use empty arrays; never invent entities not mentioned.

Return as JSON with these exact keys:
{
  "missingSkills": ["specific_skill_1", "specific_skill_2", "specific_skill_3"],
  "skillLevels": {"skill_name": "beginner/intermediate/advanced"},
  "criticalGaps": ["critical_gap_1", "critical_gap_2"],
  "niceToHave": ["nice_to_have_skill_1", "nice_to_have_skill_2"]
}

Ensure each array contains at least 2-3 specific items. Be detailed and specific about the skills and gaps.`;
  }

  private buildInterviewQuestionsPrompt(candidate: Candidate, job: JobPosting): string {
    return `You are a strict JSON API. Output only valid JSON matching the provided schema. No prose.

Generate 7-10 highly relevant interview questions for a candidate applying to this specific job. The questions should be tailored to the candidate's background and the job requirements.

CANDIDATE BACKGROUND:
- Name: ${this.redactPII(candidate.name)}
- Current Title: ${candidate.title}
- Experience: ${candidate.experience}
- Skills: ${candidate.skills.join(', ')}
- Location: ${candidate.location}

JOB REQUIREMENTS:
- Title: ${job.title}
- Description: ${this.truncateDescription(job.description)}

Generate questions in these categories (2-3 questions per category):

1. TECHNICAL SKILLS ASSESSMENT: Questions to evaluate specific technical competencies mentioned in the job
2. EXPERIENCE VALIDATION: Questions to verify relevant experience and project work
3. PROBLEM-SOLVING SCENARIOS: Real-world scenarios the candidate might face in this role
4. LEADERSHIP & COLLABORATION: Questions about team dynamics, leadership, and communication
5. CULTURAL FIT & MOTIVATION: Questions about work style, values, and career goals

Make questions specific to the technologies, tools, and industry mentioned in the job description.
If the candidate has specific skills that align with the job, create questions that leverage their background.
If there are gaps between candidate skills and job requirements, create questions that assess learning ability and adaptability.

If unsure, use empty arrays; never invent entities not mentioned.

Return as a JSON array with exactly 7-10 questions: ["question1", "question2", "question3", "question4", "question5", "question6", "question7"]`;
  }

  private buildCulturalFitPrompt(candidate: Candidate, job: JobPosting): string {
    return `You are a strict JSON API. Output only valid JSON matching the provided schema. No prose.

Assess the cultural fit and soft skills alignment between a candidate and job.

CANDIDATE: ${this.redactPII(candidate.name)} - ${candidate.title}
JOB: ${job.title} - ${this.truncateDescription(job.description)}

Analyze:
- Communication style fit
- Team collaboration potential
- Leadership qualities
- Adaptability to company culture

If unsure, use empty arrays; never invent entities not mentioned.

Return as JSON:
{
  "fitScore": 85,
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1"],
  "recommendations": ["recommendation1"]
}`;
  }

  // Utility methods
  private redactPII(text: string): string {
    // Simple PII redaction - replace emails, phones, and links
    return text
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
      .replace(/https?:\/\/[^\s]+/g, '[LINK]');
  }

  private truncateDescription(description: string, maxLength: number = 2000): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  // Fallback methods when AI fails
  private generateFallbackAlignment(candidate: Candidate, job: JobPosting): AlignmentScore {
    const skillsMatch = this.calculateBasicSkillsMatch(candidate.skills, job.description);
    
    return {
      overallScore: clamp(skillsMatch * 0.7 + 60),
      technicalScore: clamp(skillsMatch * 0.8 + 50),
      experienceScore: 70,
      skillsScore: clamp(skillsMatch),
      culturalFitScore: 75,
      detailedBreakdown: `Basic analysis: ${candidate.skills.length} skills identified, ${clamp(skillsMatch)}% match with job requirements.`,
      recommendations: ['Consider additional technical training', 'Review experience requirements'],
      interviewQuestions: [
        'Tell me about your experience with the required technologies',
        'How do you approach learning new skills?',
        'Describe a challenging project you worked on'
      ],
      riskFactors: ['Limited experience in some areas', 'Skills may need development'],
      trainingNeeds: ['Advanced training in specific technologies', 'Industry-specific knowledge']
    };
  }

  private generateFallbackSkillsGap(candidate: Candidate, job: JobPosting): SkillsGap {
    const candidateSkills = candidate.skills.map(s => s.toLowerCase());
    const jobText = job.description.toLowerCase();
    
    // Enhanced keyword matching with skill aliases
    const skillAliases = new Map([
      ['javascript', ['js', 'es6', 'es2015']],
      ['python', ['py']],
      ['react', ['reactjs', 'react.js']],
      ['node.js', ['nodejs', 'node']],
      ['typescript', ['ts']],
      ['docker', ['containerization']],
      ['kubernetes', ['k8s', 'kube']],
      ['aws', ['amazon web services', 'amazon']],
      ['azure', ['microsoft azure']],
      ['gcp', ['google cloud', 'google cloud platform']],
      ['machine learning', ['ml', 'ai', 'artificial intelligence']],
      ['data science', ['analytics', 'data analytics']],
      ['agile', ['scrum', 'kanban']]
    ]);
    
    // Find missing skills with alias matching
    const missingSkills: string[] = [];
    for (const [skill, aliases] of skillAliases) {
      const allVariants = [skill, ...aliases];
      const isInJob = allVariants.some(variant => jobText.includes(variant));
      const hasSkill = allVariants.some(variant => 
        candidateSkills.some(cs => cs.includes(variant))
      );
      
      if (isInJob && !hasSkill) {
        missingSkills.push(skill);
      }
    }
    
    // Identify critical gaps based on job title and description
    const criticalGaps: string[] = [];
    if (job.title.toLowerCase().includes('senior') && !candidate.experience?.toLowerCase().includes('senior')) {
      criticalGaps.push('Senior-level experience required');
    }
    if (job.title.toLowerCase().includes('manager') && !candidate.title?.toLowerCase().includes('manager')) {
      criticalGaps.push('Management experience needed');
    }
    if (jobText.includes('leadership') && !candidate.title?.toLowerCase().includes('lead')) {
      criticalGaps.push('Leadership experience required');
    }
    
    // Add missing technical skills as critical gaps
    criticalGaps.push(...missingSkills.slice(0, 3));
    
    // Nice to have skills
    const niceToHave = missingSkills.slice(3, 6);
    
    // Skill levels assessment - simplified
    const skillLevels: { [skill: string]: "beginner" | "intermediate" | "advanced" } = {};
    candidateSkills.forEach(skill => {
      skillLevels[skill] = 'intermediate'; // Default to intermediate
    });

    return {
      missingSkills: missingSkills.slice(0, 5),
      skillLevels,
      criticalGaps: criticalGaps.length > 0 ? criticalGaps : ['Technical skills gap', 'Experience level mismatch'],
      niceToHave: niceToHave.length > 0 ? niceToHave : ['Additional certifications', 'Industry-specific knowledge']
    };
  }

  private generateFallbackInterviewQuestions(candidate: Candidate, job: JobPosting): string[] {
    const jobText = job.description.toLowerCase();
    const candidateSkills = candidate.skills.map(s => s.toLowerCase());
    
    // Technical skills assessment
    const technicalQuestions = [
      'What experience do you have with the technologies mentioned in this role?',
      'How do you stay updated with industry trends and new technologies?',
      'Describe a time you had to learn a new technology quickly for a project'
    ];
    
    // Experience validation
    const experienceQuestions = [
      'Tell me about a challenging project you worked on that relates to this role',
      'What metrics or KPIs did you use to measure success in your previous roles?',
      'Describe a situation where you had to work with cross-functional teams'
    ];
    
    // Problem-solving scenarios
    const problemSolvingQuestions = [
      'How do you approach debugging complex technical issues?',
      'Walk me through your process for prioritizing multiple competing deadlines',
      'Describe a time when you had to make a difficult technical decision with limited information'
    ];
    
    // Leadership & collaboration
    const leadershipQuestions = [
      'How do you handle disagreements with team members or stakeholders?',
      'Tell me about a time you had to lead a team through a challenging situation',
      'How do you ensure effective communication in remote or distributed teams?'
    ];
    
    // Cultural fit & motivation
    const culturalQuestions = [
      'What motivates you in your work and what are your career goals?',
      'How do you handle tight deadlines and pressure?',
      'What type of work environment and company culture do you thrive in?'
    ];
    
    // Combine all questions
    return [
      ...technicalQuestions,
      ...experienceQuestions,
      ...problemSolvingQuestions,
      ...leadershipQuestions,
      ...culturalQuestions
    ];
  }

  private generateFallbackCulturalFit(): CulturalFit {
    return {
      fitScore: 75,
      strengths: ['Professional background', 'Relevant experience'],
      concerns: ['Limited information available'],
      recommendations: ['Conduct behavioral interview', 'Check references']
    };
  }

  private calculateBasicSkillsMatch(candidateSkills: string[], jobDescription: string): number {
    if (!candidateSkills.length || !jobDescription) return 0;
    
    const jobText = jobDescription.toLowerCase();
    const skillMatches = candidateSkills.filter(skill => 
      jobText.includes(skill.toLowerCase())
    ).length;
    
    return clamp((skillMatches / candidateSkills.length) * 100);
  }

  // Private method to categorize questions
  private categorizeQuestions(questions: string[]): {
    technical: string[];
    experience: string[];
    problemSolving: string[];
    leadership: string[];
    cultural: string[];
  } {
    const technical: string[] = [];
    const experience: string[] = [];
    const problemSolving: string[] = [];
    const leadership: string[] = [];
    const cultural: string[] = [];

    questions.forEach(question => {
      const lowerQuestion = question.toLowerCase();
      
      // Technical skills assessment
      if (lowerQuestion.includes('technology') || lowerQuestion.includes('technical') || 
          lowerQuestion.includes('debug') || lowerQuestion.includes('code') ||
          lowerQuestion.includes('tool') || lowerQuestion.includes('framework') ||
          lowerQuestion.includes('language') || lowerQuestion.includes('platform')) {
        technical.push(question);
      }
      // Experience validation
      else if (lowerQuestion.includes('project') || lowerQuestion.includes('experience') ||
               lowerQuestion.includes('worked on') || lowerQuestion.includes('previous role') ||
               lowerQuestion.includes('kpi') || lowerQuestion.includes('metric') ||
               lowerQuestion.includes('cross-functional')) {
        experience.push(question);
      }
      // Problem-solving scenarios
      else if (lowerQuestion.includes('problem') || lowerQuestion.includes('challenge') ||
               lowerQuestion.includes('difficult') || lowerQuestion.includes('decision') ||
               lowerQuestion.includes('approach') || lowerQuestion.includes('process') ||
               lowerQuestion.includes('scenario')) {
        problemSolving.push(question);
      }
      // Leadership & collaboration
      else if (lowerQuestion.includes('team') || lowerQuestion.includes('lead') ||
               lowerQuestion.includes('collaboration') || lowerQuestion.includes('stakeholder') ||
               lowerQuestion.includes('communication') || lowerQuestion.includes('disagreement') ||
               lowerQuestion.includes('remote')) {
        leadership.push(question);
      }
      // Cultural fit & motivation
      else if (lowerQuestion.includes('motivate') || lowerQuestion.includes('culture') ||
               lowerQuestion.includes('environment') || lowerQuestion.includes('goal') ||
               lowerQuestion.includes('pressure') || lowerQuestion.includes('deadline') ||
               lowerQuestion.includes('value')) {
        cultural.push(question);
      }
      // Default categorization for unmatched questions
      else {
        // Distribute evenly across categories
        const categories = [technical, experience, problemSolving, leadership, cultural];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        randomCategory.push(question);
      }
    });

    return { technical, experience, problemSolving, leadership, cultural };
  }
}

// Export singleton instance
export const aiAgent = new AIAgent();
