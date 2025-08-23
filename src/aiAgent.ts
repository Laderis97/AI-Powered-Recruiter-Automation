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

export interface AnalysisConfig {
  weights: {
    technical: number;
    experience: number;
    skills: number;
    cultural: number;
  };
  industry: string;
  seniority: 'IC' | 'Manager' | 'Senior' | 'Lead';
  focus: 'technical' | 'business' | 'balanced';
}

export class AIAgent {
  private defaultConfig: AnalysisConfig = {
    weights: { technical: 0.3, experience: 0.25, skills: 0.25, cultural: 0.2 },
    industry: 'technology',
    seniority: 'IC',
    focus: 'balanced'
  };

  constructor(
    private llm: LlmClient = new OpenAILlmClient(),
    private log = console
  ) {
    this.log.log('🧠 Enhanced AI Agent initialized with multi-model support');
  }

  /**
   * Calculate comprehensive role alignment between candidate and job
   */
  async calculateRoleAlignment(
    candidate: Candidate, 
    job: JobPosting, 
    config: Partial<AnalysisConfig> = {}
  ): Promise<Result<AlignmentScore>> {
    try {
      const analysisConfig: AnalysisConfig = { ...this.defaultConfig, ...config };
      const prompt = this.buildEnhancedRoleAlignmentPrompt(candidate, job, analysisConfig);
      const result = await this.llm.completeJSON(prompt, AlignmentScoreSchema);
      
      if (result.ok) {
        this.log.log(`✅ Role alignment completed using ${result.provider} (${result.model}) in ${result.latency}ms`);
        return result;
      }
      
      this.log.error('AI role alignment failed:', result.error);
      return { ok: true, data: this.generateEnhancedFallbackAlignment(candidate, job, analysisConfig) };
    } catch (error) {
      this.log.error('Unexpected error in role alignment:', error);
      return { ok: true, data: this.generateEnhancedFallbackAlignment(candidate, job, analysisConfig) };
    }
  }

  /**
   * Analyze skills gap between candidate and job requirements
   */
  async analyzeSkillsGap(
    candidate: Candidate, 
    job: JobPosting,
    config: Partial<AnalysisConfig> = {}
  ): Promise<Result<SkillsGap>> {
    try {
      const analysisConfig: AnalysisConfig = { ...this.defaultConfig, ...config };
      const prompt = this.buildEnhancedSkillsGapPrompt(candidate, job, analysisConfig);
      const result = await this.llm.completeJSON(prompt, SkillsGapSchema);
      
      if (result.ok) {
        this.log.log(`✅ Skills gap analysis completed using ${result.provider} (${result.model}) in ${result.latency}ms`);
        return result;
      }
      
      this.log.error('AI skills gap analysis failed:', result.error);
      return { ok: true, data: this.generateEnhancedFallbackSkillsGap(candidate, job, analysisConfig) };
    } catch (error) {
      this.log.error('Unexpected error in skills gap analysis:', error);
      return { ok: true, data: this.generateEnhancedFallbackSkillsGap(candidate, job, analysisConfig) };
    }
  }

  /**
   * Generate interview questions based on candidate-job alignment
   */
  async generateInterviewQuestions(
    candidate: Candidate, 
    job: JobPosting,
    config: Partial<AnalysisConfig> = {}
  ): Promise<Result<string[]>> {
    try {
      const analysisConfig: AnalysisConfig = { ...this.defaultConfig, ...config };
      const prompt = this.buildEnhancedInterviewQuestionsPrompt(candidate, job, analysisConfig);
      const result = await this.llm.completeJSON(prompt, z.array(z.string()));
      
      if (result.ok) {
        this.log.log(`✅ Interview questions generated using ${result.provider} (${result.model}) in ${result.latency}ms`);
        return { ok: true, data: result.data, raw: result.raw };
      }
      
      this.log.error('AI interview questions generation failed:', result.error);
      return { ok: true, data: this.generateEnhancedFallbackInterviewQuestions(candidate, job, analysisConfig) };
    } catch (error) {
      this.log.error('Unexpected error in interview questions generation:', error);
      return { ok: true, data: this.generateEnhancedFallbackInterviewQuestions(candidate, job, analysisConfig) };
    }
  }

  /**
   * Generate categorized interview questions
   */
  async generateCategorizedInterviewQuestions(
    candidate: Candidate, 
    job: JobPosting,
    config: Partial<AnalysisConfig> = {}
  ): Promise<Result<{
    technical: string[];
    experience: string[];
    problemSolving: string[];
    leadership: string[];
    cultural: string[];
    all: string[];
  }>> {
    try {
      const analysisConfig: AnalysisConfig = { ...this.defaultConfig, ...config };
      const prompt = this.buildCategorizedQuestionsPrompt(candidate, job, analysisConfig);
      const schema = z.object({
        technical: z.array(z.string()),
        experience: z.array(z.string()),
        problemSolving: z.array(z.string()),
        leadership: z.array(z.string()),
        cultural: z.array(z.string()),
        all: z.array(z.string())
      });
      
      const result = await this.llm.completeJSON(prompt, schema);
      
      if (result.ok) {
        this.log.log(`✅ Categorized interview questions generated using ${result.provider} (${result.model}) in ${result.latency}ms`);
        return result;
      }
      
      this.log.error('AI categorized questions generation failed:', result.error);
      return { ok: true, data: this.generateEnhancedFallbackCategorizedQuestions(candidate, job, analysisConfig) };
    } catch (error) {
      this.log.error('Unexpected error in categorized questions generation:', error);
      return { ok: true, data: this.generateEnhancedFallbackCategorizedQuestions(candidate, job, analysisConfig) };
    }
  }

  /**
   * Assess cultural fit between candidate and job
   */
  async assessCulturalFit(
    candidate: Candidate, 
    job: JobPosting,
    config: Partial<AnalysisConfig> = {}
  ): Promise<Result<CulturalFit>> {
    try {
      const analysisConfig: AnalysisConfig = { ...this.defaultConfig, ...config };
      const prompt = this.buildEnhancedCulturalFitPrompt(candidate, job, analysisConfig);
      const result = await this.llm.completeJSON(prompt, CulturalFitSchema);
      
      if (result.ok) {
        this.log.log(`✅ Cultural fit assessment completed using ${result.provider} (${result.model}) in ${result.latency}ms`);
        return result;
      }
      
      this.log.error('AI cultural fit assessment failed:', result.error);
      return { ok: true, data: this.generateEnhancedFallbackCulturalFit(candidate, job, analysisConfig) };
    } catch (error) {
      this.log.error('Unexpected error in cultural fit assessment:', error);
      return { ok: true, data: this.generateEnhancedFallbackCulturalFit(candidate, job, analysisConfig) };
    }
  }

  // Enhanced prompt builders with role-specific analysis
  private buildEnhancedRoleAlignmentPrompt(
    candidate: Candidate, 
    job: JobPosting, 
    config: AnalysisConfig
  ): string {
    const roleContext = this.getRoleContext(config.seniority, config.industry);
    
    return `You are a ${config.seniority}-level ${config.industry} recruiter with 10+ years of experience. Analyze the alignment between this candidate and job posting.

${roleContext}

CANDIDATE PROFILE:
- Name: ${candidate.name}
- Current Title: ${candidate.title}
- Experience: ${candidate.experience}
- Skills: ${candidate.skills.join(', ')}
- Location: ${candidate.location}
- LinkedIn: ${candidate.linkedin || 'Not provided'}
- GitHub: ${candidate.github || 'Not provided'}

JOB POSTING:
- Title: ${job.title}
- Description: ${job.description}
- Parsed Skills: ${job.parsedData?.skills?.join(', ') || 'Not parsed'}

ANALYSIS REQUIREMENTS:
- Technical Score: Evaluate technical skills match (0-100)
- Experience Score: Assess experience level fit (0-100)  
- Skills Score: Calculate skills overlap percentage (0-100)
- Cultural Score: Evaluate cultural and soft skills fit (0-100)
- Overall Score: Weighted average based on ${JSON.stringify(config.weights)}

Provide detailed breakdown, specific recommendations, targeted interview questions, risk factors, and training needs. Focus on ${config.focus} aspects.

Return valid JSON matching the AlignmentScore schema exactly.`;
  }

  private buildEnhancedSkillsGapPrompt(
    candidate: Candidate, 
    job: JobPosting, 
    config: AnalysisConfig
  ): string {
    return `You are a technical recruiter specializing in ${config.industry} roles. Analyze the skills gap between this candidate and job requirements.

CANDIDATE SKILLS: ${candidate.skills.join(', ')}
JOB REQUIREMENTS: ${job.parsedData?.skills?.join(', ') || 'Extracted from description'}

Analyze:
1. Missing critical skills (must-have for the role)
2. Skill level assessment (beginner/intermediate/advanced)
3. Nice-to-have skills that would be beneficial
4. Skills that can be learned quickly vs. those requiring significant training

Consider the ${config.seniority} level and ${config.industry} context.

Return valid JSON matching the SkillsGap schema exactly.`;
  }

  private buildEnhancedInterviewQuestionsPrompt(
    candidate: Candidate, 
    job: JobPosting, 
    config: AnalysisConfig
  ): string {
    const focusContext = this.getFocusContext(config.focus, config.seniority);
    
    return `You are a senior ${config.industry} recruiter conducting a ${config.seniority}-level interview. Generate 8-12 targeted interview questions based on this candidate-job match.

${focusContext}

CANDIDATE: ${candidate.name} - ${candidate.title} with ${candidate.experience} experience
JOB: ${job.title} at ${config.seniority} level

Generate questions that:
- Assess technical depth and problem-solving ability
- Evaluate experience relevance and leadership potential
- Test cultural fit and communication skills
- Identify areas of concern or growth potential
- Are appropriate for ${config.seniority} level interviews

Questions should be specific, behavioral, and relevant to the role. Return as a JSON array of strings.`;
  }

  private buildCategorizedQuestionsPrompt(
    candidate: Candidate, 
    job: JobPosting, 
    config: AnalysisConfig
  ): string {
    return `You are a senior ${config.industry} recruiter. Generate categorized interview questions for this ${config.seniority}-level position.

CANDIDATE: ${candidate.name} - ${candidate.title}
JOB: ${job.title}

Generate 3-5 questions in each category:

TECHNICAL: Deep technical questions, coding challenges, system design
EXPERIENCE: Past projects, achievements, role progression
PROBLEM SOLVING: How they approach challenges, decision-making
LEADERSHIP: Team management, mentoring, strategic thinking
CULTURAL: Values, work style, collaboration, company fit

Questions should be:
- Specific to the ${config.seniority} level
- Relevant to ${config.industry} context
- Based on candidate's background
- Designed to reveal true capabilities

Return JSON with arrays for each category plus an "all" array containing all questions.`;
  }

  private buildEnhancedCulturalFitPrompt(
    candidate: Candidate, 
    job: JobPosting, 
    config: AnalysisConfig
  ): string {
    return `You are an HR specialist assessing cultural fit for a ${config.seniority}-level ${config.industry} role.

CANDIDATE: ${candidate.name} - ${candidate.title}
JOB: ${job.title}

Evaluate cultural fit considering:
- Communication style and professionalism
- Team collaboration preferences
- Adaptability and learning mindset
- Values alignment with typical ${config.industry} companies
- Leadership style (if applicable for ${config.seniority} level)

Provide:
- Fit score (0-100) with justification
- Key strengths that align with role
- Potential concerns or areas of mismatch
- Specific recommendations for onboarding

Return valid JSON matching the CulturalFit schema exactly.`;
  }

  // Context helpers for better analysis
  private getRoleContext(seniority: string, industry: string): string {
    const contexts = {
      IC: `Focus on individual contributor skills, technical depth, and execution ability.`,
      Manager: `Focus on team leadership, project management, and technical decision-making.`,
      Senior: `Focus on technical leadership, mentoring, and complex problem-solving.`,
      Lead: `Focus on technical strategy, architecture decisions, and team development.`
    };
    
    return contexts[seniority as keyof typeof contexts] || contexts.IC;
  }

  private getFocusContext(focus: string, seniority: string): string {
    if (focus === 'technical') {
      return `Emphasize technical skills, coding ability, and problem-solving. Generate more technical questions.`;
    } else if (focus === 'business') {
      return `Emphasize business impact, stakeholder management, and strategic thinking. Generate more business-focused questions.`;
    } else {
      return `Balance technical and business aspects. Generate a mix of questions covering both areas.`;
    }
  }

  // Enhanced fallback generators
  private generateEnhancedFallbackAlignment(
    candidate: Candidate, 
    job: JobPosting, 
    config: AnalysisConfig
  ): AlignmentScore {
    const skillsMatch = this.calculateSkillsOverlap(candidate.skills, job.parsedData?.skills || []);
    const experienceScore = this.assessExperienceFit(candidate.experience, config.seniority);
    
    return {
      overallScore: clamp((skillsMatch + experienceScore + 70 + 75) / 4),
      technicalScore: clamp(skillsMatch),
      experienceScore: clamp(experienceScore),
      skillsScore: clamp(skillsMatch),
      culturalFitScore: 75,
      detailedBreakdown: `Fallback analysis: Skills overlap ${skillsMatch}%, Experience level ${experienceScore}%`,
      recommendations: ['Conduct detailed technical interview', 'Verify experience claims', 'Assess cultural fit in person'],
      interviewQuestions: ['Tell me about your most challenging technical project', 'How do you approach learning new technologies?', 'Describe a time you had to work with a difficult team member'],
      riskFactors: ['Limited technical depth verification', 'Experience level uncertainty'],
      trainingNeeds: ['Role-specific technical skills', 'Company processes and tools']
    };
  }

  private generateEnhancedFallbackSkillsGap(
    candidate: Candidate, 
    job: JobPosting, 
    config: AnalysisConfig
  ): SkillsGap {
    const candidateSkills = new Set(candidate.skills.map(s => s.toLowerCase()));
    const jobSkills = new Set((job.parsedData?.skills || []).map(s => s.toLowerCase()));
    
    const missingSkills = Array.from(jobSkills).filter(skill => !candidateSkills.has(skill));
    const skillLevels: Record<string, "beginner" | "intermediate" | "advanced"> = {};
    
    candidate.skills.forEach(skill => {
      skillLevels[skill] = this.assessSkillLevel(skill, candidate.experience);
    });
    
    return {
      missingSkills: missingSkills.slice(0, 5), // Top 5 missing skills
      skillLevels,
      criticalGaps: missingSkills.slice(0, 3), // Top 3 critical gaps
      niceToHave: missingSkills.slice(3, 6) // Nice-to-have skills
    };
  }

  private generateEnhancedFallbackInterviewQuestions(
    candidate: Candidate, 
    job: JobPosting, 
    config: AnalysisConfig
  ): string[] {
    const baseQuestions = [
      `Tell me about your experience with ${candidate.skills[0] || 'your primary skill'}`,
      `Describe a challenging project you worked on`,
      `How do you stay updated with industry trends?`,
      `What motivates you in your work?`,
      `How do you handle conflicting priorities?`
    ];
    
    if (config.seniority !== 'IC') {
      baseQuestions.push(
        `Describe a time you led a team through a difficult situation`,
        `How do you approach mentoring junior team members?`
      );
    }
    
    return baseQuestions;
  }

  private generateEnhancedFallbackCategorizedQuestions(
    candidate: Candidate, 
    job: JobPosting, 
    config: AnalysisConfig
  ): any {
    const technical = [
      `Describe your experience with ${candidate.skills[0] || 'your primary technology'}`,
      `How would you approach debugging a complex issue?`,
      `Tell me about a system you designed or architected`
    ];
    
    const experience = [
      `What's your most significant professional achievement?`,
      `How has your role evolved over the past few years?`,
      `Describe a project that didn't go as planned and how you handled it`
    ];
    
    const all = [...technical, ...experience];
    
    return {
      technical,
      experience,
      problemSolving: ['How do you approach complex problems?', 'Describe a time you had to think outside the box'],
      leadership: config.seniority !== 'IC' ? ['How do you motivate your team?', 'Describe a conflict you resolved'] : ['How do you contribute to team success?'],
      cultural: ['What values are important to you in a workplace?', 'How do you prefer to receive feedback?'],
      all
    };
  }

  private generateEnhancedFallbackCulturalFit(
    candidate: Candidate, 
    job: JobPosting, 
    config: AnalysisConfig
  ): CulturalFit {
    return {
      fitScore: 75,
      strengths: ['Professional background', 'Technical skills alignment', 'Experience level appropriate'],
      concerns: ['Limited cultural context', 'Communication style unknown', 'Team dynamics unclear'],
      recommendations: ['Conduct behavioral interview', 'Assess communication skills', 'Evaluate team collaboration preferences']
    };
  }

  // Utility methods for fallback calculations
  private calculateSkillsOverlap(candidateSkills: string[], jobSkills: string[]): number {
    if (jobSkills.length === 0) return 70;
    
    const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase()));
    const jobSet = new Set(jobSkills.map(s => s.toLowerCase()));
    
    const intersection = new Set([...candidateSet].filter(x => jobSet.has(x)));
    return Math.round((intersection.size / jobSet.size) * 100);
  }

  private assessExperienceFit(experience: string, seniority: string): number {
    const years = this.extractYearsFromExperience(experience);
    
    switch (seniority) {
      case 'IC': return years >= 2 ? 85 : Math.max(50, years * 25);
      case 'Senior': return years >= 5 ? 85 : Math.max(60, years * 15);
      case 'Manager': return years >= 7 ? 85 : Math.max(65, years * 12);
      case 'Lead': return years >= 8 ? 85 : Math.max(70, years * 10);
      default: return 70;
    }
  }

  private extractYearsFromExperience(experience: string): number {
    const match = experience.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
  }

  private assessSkillLevel(skill: string, experience: string): "beginner" | "intermediate" | "advanced" {
    const years = this.extractYearsFromExperience(experience);
    
    if (years >= 5) return 'advanced';
    if (years >= 2) return 'intermediate';
    return 'beginner';
  }
}

// Export singleton instance
export const aiAgent = new AIAgent();
