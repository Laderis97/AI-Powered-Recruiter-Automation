// src/aiAgent.ts

import {
  AlignmentScoreSchema,
  SkillsGapSchema,
  CulturalFitSchema,
  type AlignmentScore,
  type SkillsGap,
  type CulturalFit,
  clamp,
} from './schemas.js';
import { OpenAILlmClient, type Result } from './llmClient.js';
import {
  SemanticSearchService,
  type SemanticAnalysis,
} from './semanticSearch.js';
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
  skills?: string;
  requirements?: string;
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
    focus: 'balanced',
  };

  private semanticSearch: SemanticSearchService;

  constructor(
    private llm: OpenAILlmClient = new OpenAILlmClient(),
    private log = console
  ) {
    this.semanticSearch = new SemanticSearchService();

    // Ensure OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      this.log.warn(
        '⚠️ OpenAI API key not configured - AI analysis will use enhanced fallback methods'
      );
    }

    this.log.log(
      '🧠 Enhanced AI Agent initialized with OpenAI integration and semantic search'
    );
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
      const analysisConfig: AnalysisConfig = {
        ...this.defaultConfig,
        ...config,
      };

      // Parse job skills from string to array
      const jobSkills = this.parseJobSkills(job);

      // Use semantic search for better skill analysis
      const semanticAnalysis = this.semanticSearch.analyzeSkills(
        candidate.skills,
        jobSkills
      );

      const prompt = this.buildEnhancedRoleAlignmentPrompt(
        candidate,
        job,
        analysisConfig,
        semanticAnalysis
      );
      const result = await this.llm.completeJSON(prompt, AlignmentScoreSchema);

      if (result.ok) {
        this.log.log(
          `✅ Role alignment completed using ${result.provider} (${result.model}) in ${result.latency}ms`
        );
        return result;
      }

      this.log.error('AI role alignment failed:', result.error);
      return {
        ok: true,
        data: this.generateEnhancedFallbackAlignment(
          candidate,
          job,
          analysisConfig,
          semanticAnalysis
        ),
      };
    } catch (error) {
      this.log.error('Unexpected error in role alignment:', error);
      const jobSkills = this.parseJobSkills(job);
      const semanticAnalysis = this.semanticSearch.analyzeSkills(
        candidate.skills,
        jobSkills
      );
      const analysisConfig: AnalysisConfig = {
        ...this.defaultConfig,
        ...config,
      };
      return {
        ok: true,
        data: this.generateEnhancedFallbackAlignment(
          candidate,
          job,
          analysisConfig,
          semanticAnalysis
        ),
      };
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
      const analysisConfig: AnalysisConfig = {
        ...this.defaultConfig,
        ...config,
      };

      // Parse job skills from string to array
      const jobSkills = this.parseJobSkills(job);

      // Use semantic search for comprehensive skills analysis
      console.log('🔍 Calling semantic search with:', {
        candidateSkills: candidate.skills,
        jobSkills: jobSkills,
        jobTitle: job.title,
      });

      const semanticAnalysis = this.semanticSearch.analyzeSkills(
        candidate.skills,
        jobSkills
      );

      console.log('🔍 Semantic analysis result:', semanticAnalysis);

      const prompt = this.buildEnhancedSkillsGapPrompt(
        candidate,
        job,
        analysisConfig,
        semanticAnalysis
      );
      const result = await this.llm.completeJSON(prompt, SkillsGapSchema);

      if (result.ok) {
        this.log.log(
          `✅ Skills gap analysis completed using ${result.provider} (${result.model}) in ${result.latency}ms`
        );
        return result;
      }

      this.log.error('AI skills gap analysis failed:', result.error);
      const fallbackData = this.generateEnhancedFallbackSkillsGap(
        candidate,
        job,
        analysisConfig,
        semanticAnalysis
      );
      console.log(
        '🔍 Returning fallback data from analyzeSkillsGap:',
        fallbackData
      );
      return { ok: true, data: fallbackData };
    } catch (error) {
      this.log.error('Unexpected error in skills gap analysis:', error);
      const jobSkills = this.parseJobSkills(job);
      const semanticAnalysis = this.semanticSearch.analyzeSkills(
        candidate.skills,
        jobSkills
      );
      const analysisConfig: AnalysisConfig = {
        ...this.defaultConfig,
        ...config,
      };
      return {
        ok: true,
        data: this.generateEnhancedFallbackSkillsGap(
          candidate,
          job,
          analysisConfig,
          semanticAnalysis
        ),
      };
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
      const analysisConfig: AnalysisConfig = {
        ...this.defaultConfig,
        ...config,
      };
      const prompt = this.buildEnhancedInterviewQuestionsPrompt(
        candidate,
        job,
        analysisConfig
      );
      const result = await this.llm.completeJSON(prompt, z.array(z.string()));

      if (result.ok) {
        this.log.log(
          `✅ Interview questions generated using ${result.provider} (${result.model}) in ${result.latency}ms`
        );
        return { ok: true, data: result.data, raw: result.raw };
      }

      this.log.error('AI interview questions generation failed:', result.error);
      return {
        ok: true,
        data: this.generateEnhancedFallbackInterviewQuestions(
          candidate,
          job,
          analysisConfig
        ),
      };
    } catch (error) {
      this.log.error(
        'Unexpected error in interview questions generation:',
        error
      );
      const analysisConfig: AnalysisConfig = {
        ...this.defaultConfig,
        ...config,
      };
      return {
        ok: true,
        data: this.generateEnhancedFallbackInterviewQuestions(
          candidate,
          job,
          analysisConfig
        ),
      };
    }
  }

  /**
   * Generate categorized interview questions
   */
  async generateCategorizedInterviewQuestions(
    candidate: Candidate,
    job: JobPosting,
    config: Partial<AnalysisConfig> = {}
  ): Promise<
    Result<{
      technical: string[];
      experience: string[];
      problemSolving: string[];
      leadership: string[];
      cultural: string[];
      all: string[];
    }>
  > {
    try {
      const analysisConfig: AnalysisConfig = {
        ...this.defaultConfig,
        ...config,
      };
      const prompt = this.buildCategorizedQuestionsPrompt(
        candidate,
        job,
        analysisConfig
      );
      const schema = z.object({
        technical: z.array(z.string()),
        experience: z.array(z.string()),
        problemSolving: z.array(z.string()),
        leadership: z.array(z.string()),
        cultural: z.array(z.string()),
        all: z.array(z.string()),
      });

      const result = await this.llm.completeJSON(prompt, schema);

      if (result.ok) {
        this.log.log(
          `✅ Categorized interview questions generated using ${result.provider} (${result.model}) in ${result.latency}ms`
        );
        return result;
      }

      this.log.error(
        'AI categorized questions generation failed:',
        result.error
      );
      return {
        ok: true,
        data: this.generateEnhancedFallbackCategorizedQuestions(
          candidate,
          job,
          { ...this.defaultConfig, ...config }
        ),
      };
    } catch (error) {
      this.log.error(
        'Unexpected error in categorized questions generation:',
        error
      );
      return {
        ok: true,
        data: this.generateEnhancedFallbackCategorizedQuestions(
          candidate,
          job,
          { ...this.defaultConfig, ...config }
        ),
      };
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
      const analysisConfig: AnalysisConfig = {
        ...this.defaultConfig,
        ...config,
      };
      const prompt = this.buildEnhancedCulturalFitPrompt(
        candidate,
        job,
        analysisConfig
      );
      const result = await this.llm.completeJSON(prompt, CulturalFitSchema);

      if (result.ok) {
        this.log.log(
          `✅ Cultural fit assessment completed using ${result.provider} (${result.model}) in ${result.latency}ms`
        );
        return result;
      }

      this.log.error('AI cultural fit assessment failed:', result.error);
      return {
        ok: true,
        data: this.generateEnhancedFallbackCulturalFit(
          candidate,
          job,
          analysisConfig
        ),
      };
    } catch (error) {
      this.log.error('Unexpected error in cultural fit assessment:', error);
      return {
        ok: true,
        data: this.generateEnhancedFallbackCulturalFit(candidate, job, {
          ...this.defaultConfig,
          ...config,
        }),
      };
    }
  }

  // Enhanced prompt builders with semantic analysis
  private buildEnhancedRoleAlignmentPrompt(
    candidate: Candidate,
    job: JobPosting,
    config: AnalysisConfig,
    semanticAnalysis: SemanticAnalysis
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

SEMANTIC SKILLS ANALYSIS:
- Overall Similarity: ${semanticAnalysis.overallSimilarity}%
- Exact Matches: ${semanticAnalysis.skillMatches.filter(m => m.category === 'exact').length}
- Semantic Matches: ${semanticAnalysis.skillMatches.filter(m => m.category === 'semantic').length}
- Missing Skills: ${semanticAnalysis.missingSkills.join(', ')}
- Related Skills: ${semanticAnalysis.relatedSkills.join(', ')}

ANALYSIS REQUIREMENTS:
- Technical Score: Evaluate technical skills match (0-100)
- Experience Score: Assess experience level fit (0-100)  
- Skills Score: Use semantic analysis similarity: ${semanticAnalysis.overallSimilarity}%
- Cultural Score: Evaluate cultural and soft skills fit (0-100)
- Overall Score: Weighted average based on ${JSON.stringify(config.weights)}

Provide detailed breakdown, specific recommendations, targeted interview questions, risk factors, and training needs. Focus on ${config.focus} aspects.

Return valid JSON matching the AlignmentScore schema exactly.`;
  }

  private buildEnhancedSkillsGapPrompt(
    candidate: Candidate,
    job: JobPosting,
    config: AnalysisConfig,
    semanticAnalysis: SemanticAnalysis
  ): string {
    return `You are a technical recruiter specializing in ${config.industry} roles. Analyze the skills gap between this candidate and job requirements.

CANDIDATE SKILLS: ${candidate.skills.join(', ')}
JOB REQUIREMENTS: ${job.parsedData?.skills?.join(', ') || 'Extracted from description'}

SEMANTIC ANALYSIS RESULTS:
- Overall Similarity: ${semanticAnalysis.overallSimilarity}%
- Exact Matches: ${semanticAnalysis.skillMatches
      .filter(m => m.category === 'exact')
      .map(m => m.skill)
      .join(', ')}
- Semantic Matches: ${semanticAnalysis.skillMatches
      .filter(m => m.category === 'semantic')
      .map(m => `${m.skill} (${Math.round(m.confidence * 100)}% confidence)`)
      .join(', ')}
- Missing Skills: ${semanticAnalysis.missingSkills.join(', ')}
- Related Skills: ${semanticAnalysis.relatedSkills.join(', ')}

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
      Lead: `Focus on technical strategy, architecture decisions, and team development.`,
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

  /**
   * Normalize skill names for comparison
   */
  private normalizeSkill(skill: string): string {
    return skill
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
  }

  // Enhanced fallback generators with semantic analysis
  private generateEnhancedFallbackAlignment(
    candidate: Candidate,
    job: JobPosting,
    config: AnalysisConfig,
    semanticAnalysis: SemanticAnalysis
  ): AlignmentScore {
    const skillsScore = semanticAnalysis.overallSimilarity;
    const experienceScore = this.assessExperienceFit(
      candidate.experience,
      config.seniority
    );

    return {
      overallScore: clamp((skillsScore + experienceScore + 70 + 75) / 4),
      technicalScore: clamp(skillsScore),
      experienceScore: clamp(experienceScore),
      skillsScore: clamp(skillsScore),
      culturalFitScore: 75,
      detailedBreakdown: `Enhanced fallback analysis: Semantic skills similarity ${skillsScore}%, Experience level ${experienceScore}%`,
      recommendations: [
        'Conduct detailed technical interview',
        'Verify experience claims',
        'Assess cultural fit in person',
      ],
      interviewQuestions: [
        'Tell me about your most challenging technical project',
        'How do you approach learning new technologies?',
        'Describe a time you had to work with a difficult team member',
      ],
      riskFactors: [
        'Limited technical depth verification',
        'Experience level uncertainty',
      ],
      trainingNeeds: [
        'Role-specific technical skills',
        'Company processes and tools',
      ],
    };
  }

  private generateEnhancedFallbackSkillsGap(
    candidate: Candidate,
    job: JobPosting,
    config: AnalysisConfig,
    semanticAnalysis: SemanticAnalysis
  ): SkillsGap {
    const skillLevels: Record<
      string,
      'beginner' | 'intermediate' | 'advanced'
    > = {};

    // Generate skill levels for candidate skills
    if (candidate.skills && candidate.skills.length > 0) {
      candidate.skills.forEach(skill => {
        if (skill && typeof skill === 'string' && skill.trim().length > 0) {
          skillLevels[skill] = this.assessSkillLevel(
            skill,
            candidate.experience
          );
        }
      });
    }

    // Ensure skillLevels is not empty
    if (Object.keys(skillLevels).length === 0) {
      skillLevels['General Skills'] = 'intermediate';
    }

    // Generate meaningful missing skills based on job requirements
    const jobSkills = job.parsedData?.skills || [];
    const candidateSkillSet = new Set(
      candidate.skills.map(s => this.normalizeSkill(s))
    );

    // Find skills that the job requires but candidate doesn't have
    const missingSkills = jobSkills.filter(
      jobSkill => !candidateSkillSet.has(this.normalizeSkill(jobSkill))
    );

    // If semantic analysis has results, use them; otherwise generate fallback
    console.log(
      '🔍 Semantic analysis missing skills:',
      semanticAnalysis.missingSkills
    );
    console.log('🔍 Job-based missing skills:', missingSkills);

    // Filter out empty strings and ensure we have meaningful skills
    const validSemanticSkills = semanticAnalysis.missingSkills.filter(
      skill => skill && skill.trim().length > 0
    );
    console.log('🔍 Valid semantic skills:', validSemanticSkills);

    const finalMissingSkills =
      validSemanticSkills.length > 0 ? validSemanticSkills : missingSkills;

    console.log('🔍 Final missing skills selected:', finalMissingSkills);

    // Generate contextual analysis based on job title and candidate background
    console.log('🔍 Calling generateContextualSkillsGaps...');
    const contextualGaps = this.generateContextualSkillsGaps(
      job,
      candidate,
      config
    );
    console.log('🔍 Contextual gaps received:', contextualGaps);

    // Ensure we have meaningful results - prioritize contextual gaps when they contain data
    const criticalGaps =
      contextualGaps.critical.length > 0
        ? contextualGaps.critical
        : finalMissingSkills.length > 0
          ? finalMissingSkills.slice(0, Math.min(3, finalMissingSkills.length))
          : [];

    const niceToHave =
      contextualGaps.niceToHave.length > 0
        ? contextualGaps.niceToHave
        : finalMissingSkills.length > 0
          ? finalMissingSkills.slice(3, Math.min(6, finalMissingSkills.length))
          : [];

    console.log('🔍 Final gaps calculated:', {
      criticalGaps,
      niceToHave,
      finalMissingSkills,
    });

    const finalResult = {
      missingSkills:
        contextualGaps.missing.length > 0
          ? contextualGaps.missing
          : finalMissingSkills,
      skillLevels,
      criticalGaps:
        criticalGaps.length > 0 ? criticalGaps : contextualGaps.critical,
      niceToHave:
        niceToHave.length > 0 ? niceToHave : contextualGaps.niceToHave,
    };

    // Ensure all arrays contain valid strings and are not empty
    finalResult.missingSkills = finalResult.missingSkills.filter(
      skill => skill && typeof skill === 'string' && skill.trim().length > 0
    );
    finalResult.criticalGaps = finalResult.criticalGaps.filter(
      skill => skill && typeof skill === 'string' && skill.trim().length > 0
    );
    finalResult.niceToHave = finalResult.niceToHave.filter(
      skill => skill && typeof skill === 'string' && skill.trim().length > 0
    );

    console.log(
      '🔍 Final result being returned from generateEnhancedFallbackSkillsGap:',
      finalResult
    );
    return finalResult;
  }

  /**
   * Generate contextual skills gaps based on job title and candidate background
   */
  private generateContextualSkillsGaps(
    job: JobPosting,
    candidate: Candidate,
    config: AnalysisConfig
  ) {
    console.log('🔍 generateContextualSkillsGaps called with:', {
      jobTitle: job.title,
      candidateTitle: candidate.title,
      industry: config.industry,
    });

    const jobTitle = job.title.toLowerCase();
    const jobDescription = job.description.toLowerCase();
    const candidateTitle = candidate.title.toLowerCase();
    const industry = config.industry;

    // Comprehensive skills by role type - now including business/product roles
    const roleSkills = {
      frontend: [
        'JavaScript',
        'React',
        'CSS',
        'HTML',
        'TypeScript',
        'Vue',
        'Angular',
        'Responsive Design',
        'Web Accessibility',
        'Performance Optimization',
        'State Management',
      ],
      backend: [
        'Node.js',
        'Python',
        'Java',
        'C#',
        'Go',
        'Database Design',
        'API Design',
        'Microservices',
        'Authentication',
        'Security Best Practices',
        'Testing',
      ],
      fullstack: [
        'JavaScript',
        'React',
        'Node.js',
        'Database',
        'API Design',
        'DevOps',
        'System Architecture',
        'Performance Tuning',
        'Security',
        'CI/CD',
      ],
      data: [
        'Python',
        'SQL',
        'Machine Learning',
        'Data Analysis',
        'Statistics',
        'Pandas',
        'Data Visualization',
        'Big Data Technologies',
        'ETL Processes',
        'A/B Testing',
      ],
      devops: [
        'Docker',
        'Kubernetes',
        'AWS',
        'CI/CD',
        'Terraform',
        'Monitoring',
        'Infrastructure as Code',
        'Security',
        'Performance Tuning',
        'Disaster Recovery',
      ],
      mobile: [
        'React Native',
        'Flutter',
        'iOS Development',
        'Android Development',
        'Mobile UI/UX',
        'App Store Guidelines',
        'Performance Optimization',
        'Cross-platform Development',
      ],
      product: [
        'Product Strategy',
        'Market Research',
        'User Experience Design',
        'Data Analysis',
        'Stakeholder Management',
        'Product Roadmapping',
        'A/B Testing',
        'Customer Research',
        'Business Metrics',
        'Competitive Analysis',
      ],
      business: [
        'Business Strategy',
        'Market Analysis',
        'Financial Modeling',
        'Stakeholder Management',
        'Project Management',
        'Risk Assessment',
        'Compliance Knowledge',
        'Strategic Planning',
        'Business Development',
        'Performance Metrics',
      ],
      compliance: [
        'Regulatory Compliance',
        'Risk Management',
        'Audit Processes',
        'Policy Development',
        'Data Governance',
        'Security Frameworks',
        'Compliance Monitoring',
        'Regulatory Reporting',
        'Internal Controls',
        'Compliance Training',
      ],
      management: [
        'Team Leadership',
        'Strategic Planning',
        'Resource Management',
        'Performance Management',
        'Stakeholder Communication',
        'Change Management',
        'Process Improvement',
        'Budget Management',
        'Risk Management',
        'Strategic Decision Making',
      ],
    };

    // Enhanced role detection with business/product focus
    let roleType = 'general';
    let confidence = 0;

    console.log('🔍 Starting role detection for job:', jobTitle);

    // Check job title first with expanded business role detection
    if (
      jobTitle.includes('frontend') ||
      jobTitle.includes('ui') ||
      jobTitle.includes('react') ||
      jobTitle.includes('web') ||
      jobTitle.includes('client')
    ) {
      roleType = 'frontend';
      confidence = 0.8;
    } else if (
      jobTitle.includes('backend') ||
      jobTitle.includes('api') ||
      jobTitle.includes('server') ||
      jobTitle.includes('database') ||
      jobTitle.includes('microservice')
    ) {
      roleType = 'backend';
      confidence = 0.8;
    } else if (
      jobTitle.includes('fullstack') ||
      jobTitle.includes('full-stack') ||
      jobTitle.includes('full stack') ||
      jobTitle.includes('generalist')
    ) {
      roleType = 'fullstack';
      confidence = 0.8;
    } else if (
      jobTitle.includes('data') ||
      jobTitle.includes('ml') ||
      jobTitle.includes('ai') ||
      jobTitle.includes('analytics') ||
      jobTitle.includes('scientist')
    ) {
      roleType = 'data';
      confidence = 0.8;
    } else if (
      jobTitle.includes('devops') ||
      jobTitle.includes('infrastructure') ||
      jobTitle.includes('platform') ||
      jobTitle.includes('sre')
    ) {
      roleType = 'devops';
      confidence = 0.8;
    } else if (
      jobTitle.includes('mobile') ||
      jobTitle.includes('ios') ||
      jobTitle.includes('android') ||
      jobTitle.includes('app')
    ) {
      roleType = 'mobile';
      confidence = 0.8;
    } else if (
      jobTitle.includes('product') ||
      jobTitle.includes('pm') ||
      jobTitle.includes('manager') ||
      jobTitle.includes('strategy') ||
      jobTitle.includes('director')
    ) {
      roleType = 'product';
      confidence = 0.8;
    } else if (
      jobTitle.includes('compliance') ||
      jobTitle.includes('risk') ||
      jobTitle.includes('audit') ||
      jobTitle.includes('governance') ||
      jobTitle.includes('regulatory')
    ) {
      roleType = 'compliance';
      confidence = 0.8;
    } else if (
      jobTitle.includes('head') ||
      jobTitle.includes('lead') ||
      jobTitle.includes('senior') ||
      jobTitle.includes('principal') ||
      jobTitle.includes('executive')
    ) {
      roleType = 'management';
      confidence = 0.7;
    }

    // Enhanced job description analysis for business roles
    if (roleType === 'general' || confidence < 0.5) {
      if (
        jobDescription.includes('javascript') ||
        jobDescription.includes('react') ||
        jobDescription.includes('css') ||
        jobDescription.includes('html') ||
        jobDescription.includes('frontend') ||
        jobDescription.includes('ui')
      ) {
        roleType = 'frontend';
        confidence = 0.7;
      } else if (
        jobDescription.includes('python') ||
        jobDescription.includes('java') ||
        jobDescription.includes('node') ||
        jobDescription.includes('database') ||
        jobDescription.includes('api') ||
        jobDescription.includes('backend')
      ) {
        roleType = 'backend';
        confidence = 0.7;
      } else if (
        jobDescription.includes('sql') ||
        jobDescription.includes('machine learning') ||
        jobDescription.includes('data') ||
        jobDescription.includes('analytics') ||
        jobDescription.includes('statistics')
      ) {
        roleType = 'data';
        confidence = 0.7;
      } else if (
        jobDescription.includes('docker') ||
        jobDescription.includes('kubernetes') ||
        jobDescription.includes('aws') ||
        jobDescription.includes('ci/cd') ||
        jobDescription.includes('infrastructure')
      ) {
        roleType = 'devops';
        confidence = 0.7;
      } else if (
        jobDescription.includes('mobile') ||
        jobDescription.includes('ios') ||
        jobDescription.includes('android')
      ) {
        roleType = 'mobile';
        confidence = 0.7;
      } else if (
        jobDescription.includes('product') ||
        jobDescription.includes('strategy') ||
        jobDescription.includes('roadmap') ||
        jobDescription.includes('market') ||
        jobDescription.includes('customer') ||
        jobDescription.includes('stakeholder')
      ) {
        roleType = 'product';
        confidence = 0.7;
      } else if (
        jobDescription.includes('compliance') ||
        jobDescription.includes('risk') ||
        jobDescription.includes('audit') ||
        jobDescription.includes('governance') ||
        jobDescription.includes('regulatory') ||
        jobDescription.includes('sox') ||
        jobDescription.includes('gdpr') ||
        jobDescription.includes('faa') ||
        jobDescription.includes('dod')
      ) {
        roleType = 'compliance';
        confidence = 0.7;
      } else if (
        jobDescription.includes('lead') ||
        jobDescription.includes('team') ||
        jobDescription.includes('management') ||
        jobDescription.includes('strategy') ||
        jobDescription.includes('planning') ||
        jobDescription.includes('executive')
      ) {
        roleType = 'management';
        confidence = 0.7;
      }
    }

    // Use candidate's current role as additional context
    if (roleType === 'general' && candidateTitle) {
      // Clean the candidate title to remove emojis and contact info
      const cleanCandidateTitle = candidateTitle
        .replace(/[📍📧📞🔗]/g, '')
        .replace(/[|]/g, '')
        .trim();

      if (
        cleanCandidateTitle.includes('frontend') ||
        cleanCandidateTitle.includes('ui') ||
        cleanCandidateTitle.includes('web')
      ) {
        roleType = 'frontend';
        confidence = 0.6;
      } else if (
        cleanCandidateTitle.includes('backend') ||
        cleanCandidateTitle.includes('api') ||
        cleanCandidateTitle.includes('server')
      ) {
        roleType = 'backend';
        confidence = 0.6;
      } else if (
        cleanCandidateTitle.includes('data') ||
        cleanCandidateTitle.includes('ml') ||
        cleanCandidateTitle.includes('analytics')
      ) {
        roleType = 'data';
        confidence = 0.6;
      } else if (
        cleanCandidateTitle.includes('devops') ||
        cleanCandidateTitle.includes('infrastructure')
      ) {
        roleType = 'devops';
        confidence = 0.6;
      } else if (
        cleanCandidateTitle.includes('product') ||
        cleanCandidateTitle.includes('manager') ||
        cleanCandidateTitle.includes('strategy')
      ) {
        roleType = 'product';
        confidence = 0.6;
      } else if (
        cleanCandidateTitle.includes('compliance') ||
        cleanCandidateTitle.includes('risk') ||
        cleanCandidateTitle.includes('audit')
      ) {
        roleType = 'compliance';
        confidence = 0.6;
      }
    }

    // If still general, analyze candidate skills to infer role
    if (roleType === 'general' && candidate.skills.length > 0) {
      const skillSet = new Set(candidate.skills.map(s => s.toLowerCase()));

      if (
        skillSet.has('react') ||
        skillSet.has('vue') ||
        skillSet.has('javascript') ||
        skillSet.has('css') ||
        skillSet.has('html')
      ) {
        roleType = 'frontend';
        confidence = 0.5;
      } else if (
        skillSet.has('python') ||
        skillSet.has('java') ||
        skillSet.has('node') ||
        skillSet.has('go') ||
        skillSet.has('rust')
      ) {
        roleType = 'backend';
        confidence = 0.5;
      } else if (
        skillSet.has('docker') ||
        skillSet.has('kubernetes') ||
        skillSet.has('aws')
      ) {
        roleType = 'devops';
        confidence = 0.5;
      } else if (
        skillSet.has('machine learning') ||
        skillSet.has('data analysis') ||
        skillSet.has('sql')
      ) {
        roleType = 'data';
        confidence = 0.5;
      }
    }

    // Generate contextual missing skills based on detected role
    console.log('🔍 Role detection result:', {
      roleType,
      confidence,
      availableSkills: roleSkills[roleType as keyof typeof roleSkills] || [],
    });

    const availableRoleSkills =
      roleSkills[roleType as keyof typeof roleSkills] || [];
    const candidateSkillSet = new Set(
      candidate.skills.map(s => this.normalizeSkill(s))
    );

    // Generate missing skills based on role requirements
    const contextualMissingSkills =
      confidence > 0.3
        ? availableRoleSkills.filter(
            skill => !candidateSkillSet.has(this.normalizeSkill(skill))
          )
        : [];

    console.log('🔍 Contextual missing skills:', contextualMissingSkills);

    // Enhanced seniority-based skills with role-specific adjustments
    const senioritySkills = {
      IC: [
        'Technical depth',
        'Problem solving',
        'Code quality',
        'Testing practices',
        'Documentation',
        'Code review participation',
      ],
      Senior: [
        'Technical leadership',
        'Mentoring',
        'System design',
        'Architecture decisions',
        'Code review leadership',
        'Technical planning',
      ],
      Manager: [
        'Team leadership',
        'Project management',
        'Stakeholder management',
        'Resource planning',
        'Performance management',
        'Strategic thinking',
      ],
      Lead: [
        'Technical strategy',
        'Architecture decisions',
        'Team development',
        'Innovation',
        'Cross-team collaboration',
        'Technical vision',
      ],
    };

    const levelSkills = senioritySkills[config.seniority] || senioritySkills.IC;

    // Enhanced industry-specific skills with role context
    const industrySkills = {
      technology: [
        'Agile methodologies',
        'Version control',
        'Code review',
        'Testing',
      ],
      finance: [
        'Financial systems',
        'Compliance',
        'Risk management',
        'Regulatory knowledge',
      ],
      healthcare: [
        'HIPAA compliance',
        'Medical systems',
        'Patient data security',
        'Clinical workflows',
      ],
      ecommerce: [
        'Payment systems',
        'Inventory management',
        'Customer analytics',
        'Fulfillment systems',
      ],
    };

    const industrySpecificSkills =
      industrySkills[industry as keyof typeof industrySkills] ||
      industrySkills.technology;

    // Dynamic skill prioritization based on role and confidence
    let criticalSkills: string[] = [];
    let niceToHaveSkills: string[] = [];

    if (confidence > 0.6 && contextualMissingSkills.length > 0) {
      // High confidence in role detection - prioritize role-specific skills
      criticalSkills = contextualMissingSkills.slice(
        0,
        Math.min(3, contextualMissingSkills.length)
      );
      niceToHaveSkills = contextualMissingSkills.slice(
        3,
        Math.min(6, contextualMissingSkills.length)
      );
    } else if (confidence > 0.3) {
      // Medium confidence - mix of role-specific and general skills
      const roleSpecificCount = Math.min(2, contextualMissingSkills.length);
      criticalSkills = [
        ...contextualMissingSkills.slice(0, roleSpecificCount),
        ...levelSkills.slice(0, 3 - roleSpecificCount),
      ];
      niceToHaveSkills = [
        ...contextualMissingSkills.slice(
          roleSpecificCount,
          roleSpecificCount + 2
        ),
        ...levelSkills.slice(3 - roleSpecificCount, 4),
        ...industrySpecificSkills.slice(0, 2),
      ];
    } else {
      // Low confidence - focus on general skills and industry context
      criticalSkills = levelSkills.slice(0, 3);
      niceToHaveSkills = [
        ...levelSkills.slice(1, 3),
        ...industrySpecificSkills.slice(0, 3),
      ];
    }

    // Ensure we always have meaningful results
    if (criticalSkills.length === 0) {
      criticalSkills = [
        'Role-specific skills assessment needed',
        'Core competencies review',
        'Technical evaluation required',
      ];
    }
    if (niceToHaveSkills.length === 0) {
      niceToHaveSkills = [
        'Additional skills review recommended',
        'Professional development areas',
        'Industry-specific knowledge',
      ];
    }

    const result = {
      missing: [
        ...contextualMissingSkills.slice(0, 4),
        ...levelSkills.slice(0, 2),
        ...industrySpecificSkills.slice(0, 1),
      ],
      critical: criticalSkills,
      niceToHave: niceToHaveSkills,
    };

    console.log('🔍 generateContextualSkillsGaps returning:', result);
    return result;
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
      `How do you handle conflicting priorities?`,
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
      `Tell me about a system you designed or architected`,
    ];

    const experience = [
      `What's your most significant professional achievement?`,
      `How has your role evolved over the past few years?`,
      `Describe a project that didn't go as planned and how you handled it`,
    ];

    const all = [...technical, ...experience];

    return {
      technical,
      experience,
      problemSolving: [
        'How do you approach complex problems?',
        'Describe a time you had to think outside the box',
      ],
      leadership:
        config.seniority !== 'IC'
          ? [
              'How do you motivate your team?',
              'Describe a conflict you resolved',
            ]
          : ['How do you contribute to team success?'],
      cultural: [
        'What values are important to you in a workplace?',
        'How do you prefer to receive feedback?',
      ],
      all,
    };
  }

  private generateEnhancedFallbackCulturalFit(
    candidate: Candidate,
    job: JobPosting,
    config: AnalysisConfig
  ): CulturalFit {
    return {
      fitScore: 75,
      strengths: [
        'Professional background',
        'Technical skills alignment',
        'Experience level appropriate',
      ],
      concerns: [
        'Limited cultural context',
        'Communication style unknown',
        'Team dynamics unclear',
      ],
      recommendations: [
        'Conduct behavioral interview',
        'Assess communication skills',
        'Evaluate team collaboration preferences',
      ],
    };
  }

  // Utility methods for fallback calculations
  private calculateSkillsOverlap(
    candidateSkills: string[],
    jobSkills: string[]
  ): number {
    if (jobSkills.length === 0) return 70;

    const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase()));
    const jobSet = new Set(jobSkills.map(s => s.toLowerCase()));

    const intersection = new Set([...candidateSet].filter(x => jobSet.has(x)));
    return Math.round((intersection.size / jobSet.size) * 100);
  }

  private assessExperienceFit(experience: string, seniority: string): number {
    const years = this.extractYearsFromExperience(experience);

    switch (seniority) {
      case 'IC':
        return years >= 2 ? 85 : Math.max(50, years * 25);
      case 'Senior':
        return years >= 5 ? 85 : Math.max(60, years * 15);
      case 'Manager':
        return years >= 7 ? 85 : Math.max(65, years * 12);
      case 'Lead':
        return years >= 8 ? 85 : Math.max(70, years * 10);
      default:
        return 70;
    }
  }

  private extractYearsFromExperience(experience: string): number {
    const match = experience.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
  }

  private assessSkillLevel(
    skill: string,
    experience: string
  ): 'beginner' | 'intermediate' | 'advanced' {
    const years = this.extractYearsFromExperience(experience);

    if (years >= 5) return 'advanced';
    if (years >= 2) return 'intermediate';
    return 'beginner';
  }

  /**
   * Parse job skills from job data
   */
  private parseJobSkills(job: JobPosting): string[] {
    // First try to get skills from parsedData
    if (job.parsedData?.skills && job.parsedData.skills.length > 0) {
      return job.parsedData.skills;
    }

    // Try to extract from job skills string field
    if (job.skills && typeof job.skills === 'string') {
      return job.skills
        .split(',')
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill.length > 0);
    }

    // Fallback to extracting skills from job description
    const description = job.description.toLowerCase();
    const requirements = job.requirements ? job.requirements.toLowerCase() : '';
    const fullText = `${description} ${requirements}`;

    const skills: string[] = [];

    // Common skill keywords with variations
    const skillKeywords = [
      'javascript',
      'js',
      'react',
      'vue',
      'angular',
      'css',
      'html',
      'typescript',
      'ts',
      'node.js',
      'nodejs',
      'python',
      'java',
      'c#',
      'csharp',
      'go',
      'golang',
      'database',
      'sql',
      'nosql',
      'mongodb',
      'postgresql',
      'mysql',
      'redis',
      'api',
      'rest',
      'graphql',
      'microservices',
      'authentication',
      'auth',
      'security',
      'testing',
      'unit testing',
      'integration testing',
      'docker',
      'kubernetes',
      'k8s',
      'aws',
      'azure',
      'gcp',
      'cloud',
      'ci/cd',
      'cicd',
      'terraform',
      'monitoring',
      'infrastructure as code',
      'iac',
      'machine learning',
      'ml',
      'ai',
      'artificial intelligence',
      'data analysis',
      'statistics',
      'pandas',
      'numpy',
      'data visualization',
      'big data',
      'etl processes',
      'etl',
      'a/b testing',
      'ab testing',
      'product strategy',
      'market research',
      'user experience design',
      'ux',
      'ui',
      'stakeholder management',
      'product roadmap',
      'customer research',
      'business metrics',
      'competitive analysis',
      'business strategy',
      'market analysis',
      'financial modeling',
      'project management',
      'risk assessment',
      'compliance knowledge',
      'regulatory compliance',
      'risk management',
      'audit processes',
      'policy development',
      'data governance',
      'security frameworks',
      'compliance monitoring',
      'regulatory reporting',
      'internal controls',
      'compliance training',
      'team leadership',
      'strategic planning',
      'resource management',
      'performance management',
      'stakeholder communication',
      'change management',
      'process improvement',
      'budget management',
      'strategic decision making',
      'figma',
      'adobe',
      'prototyping',
      'design systems',
      'user research',
      'agile',
      'scrum',
      'kanban',
      'jira',
      'confluence',
    ];

    skillKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) {
        // Capitalize the skill name properly
        const skillName = keyword
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        skills.push(skillName);
      }
    });

    // Remove duplicates and sort
    return Array.from(new Set(skills)).sort();
  }
}

// Export singleton instance
export const aiAgent = new AIAgent();
