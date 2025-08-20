// src/aiAgent.ts

import { callOpenAI } from './openai.js';

export interface AlignmentScore {
  overallScore: number; // 0-100
  technicalScore: number; // 0-100
  experienceScore: number; // 0-100
  skillsScore: number; // 0-100
  culturalFitScore: number; // 0-100
  detailedBreakdown: string;
  recommendations: string[];
  interviewQuestions: string[];
  riskFactors: string[];
  trainingNeeds: string[];
}

export interface SkillsGap {
  missingSkills: string[];
  skillLevels: { [skill: string]: 'beginner' | 'intermediate' | 'advanced' };
  criticalGaps: string[];
  niceToHave: string[];
}

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
  parsedData?: any;
  createdAt: Date;
}

export class AIAgent {
  constructor() {
    console.log('🧠 AI Agent initialized for role alignment analysis');
  }

  /**
   * Calculate comprehensive role alignment between candidate and job
   */
  async calculateRoleAlignment(candidate: Candidate, job: JobPosting): Promise<AlignmentScore> {
    try {
      const prompt = `
        Analyze the alignment between a candidate and a job posting.
        
        CANDIDATE:
        - Name: ${candidate.name}
        - Current Title: ${candidate.title}
        - Experience: ${candidate.experience}
        - Skills: ${candidate.skills.join(', ')}
        - Location: ${candidate.location}
        
        JOB POSTING:
        - Title: ${job.title}
        - Description: ${job.description}
        
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
        }
      `;

      const response = await callOpenAI(prompt);
      
      try {
        const alignmentData = JSON.parse(response);
        return alignmentData as AlignmentScore;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return this.generateFallbackAlignment(candidate, job);
      }
    } catch (error) {
      console.error('AI role alignment failed:', error);
      return this.generateFallbackAlignment(candidate, job);
    }
  }

  /**
   * Analyze skills gap between candidate and job requirements
   */
  async analyzeSkillsGap(candidate: Candidate, job: JobPosting): Promise<SkillsGap> {
    try {
      const prompt = `
        Analyze the skills gap between a candidate and a job posting.
        
        CANDIDATE SKILLS: ${candidate.skills.join(', ')}
        JOB REQUIREMENTS: ${job.description}
        
        Identify:
        1. Missing critical skills
        2. Skill level assessments (beginner/intermediate/advanced)
        3. Critical gaps that must be addressed
        4. Nice-to-have skills
        
        Return as JSON:
        {
          "missingSkills": ["skill1", "skill2"],
          "skillLevels": {"skill": "level"},
          "criticalGaps": ["critical_skill1"],
          "niceToHave": ["nice_skill1"]
        }
      `;

      const response = await callOpenAI(prompt);
      
      try {
        const gapData = JSON.parse(response);
        return gapData as SkillsGap;
      } catch (parseError) {
        console.error('Failed to parse skills gap response:', parseError);
        return this.generateFallbackSkillsGap(candidate, job);
      }
    } catch (error) {
      console.error('AI skills gap analysis failed:', error);
      return this.generateFallbackSkillsGap(candidate, job);
    }
  }

  /**
   * Generate interview questions based on candidate-job alignment
   */
  async generateInterviewQuestions(candidate: Candidate, job: JobPosting): Promise<string[]> {
    try {
      const prompt = `
        Generate 5-7 relevant interview questions for a candidate applying to this job.
        
        CANDIDATE: ${candidate.name} - ${candidate.title} with skills: ${candidate.skills.join(', ')}
        JOB: ${job.title} - ${job.description}
        
        Focus on:
        - Technical skills assessment
        - Experience validation
        - Problem-solving scenarios
        - Cultural fit questions
        
        Return as a JSON array: ["question1", "question2", "question3"]
      `;

      const response = await callOpenAI(prompt);
      
      try {
        const questions = JSON.parse(response);
        return Array.isArray(questions) ? questions : [];
      } catch (parseError) {
        console.error('Failed to parse interview questions:', parseError);
        return this.generateFallbackInterviewQuestions(candidate, job);
      }
    } catch (error) {
      console.error('AI interview questions failed:', error);
      return this.generateFallbackInterviewQuestions(candidate, job);
    }
  }

  /**
   * Assess cultural fit and soft skills
   */
  async assessCulturalFit(candidate: Candidate, job: JobPosting): Promise<{
    fitScore: number;
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
        Assess the cultural fit and soft skills alignment between a candidate and job.
        
        CANDIDATE: ${candidate.name} - ${candidate.title}
        JOB: ${job.title} - ${job.description}
        
        Analyze:
        - Communication style fit
        - Team collaboration potential
        - Leadership qualities
        - Adaptability to company culture
        
        Return as JSON:
        {
          "fitScore": 85,
          "strengths": ["strength1", "strength2"],
          "concerns": ["concern1"],
          "recommendations": ["recommendation1"]
        }
      `;

      const response = await callOpenAI(prompt);
      
      try {
        const fitData = JSON.parse(response);
        return fitData;
      } catch (parseError) {
        console.error('Failed to parse cultural fit response:', parseError);
        return this.generateFallbackCulturalFit();
      }
    } catch (error) {
      console.error('AI cultural fit assessment failed:', error);
      return this.generateFallbackCulturalFit();
    }
  }

  // Fallback methods when AI fails
  private generateFallbackAlignment(candidate: Candidate, job: JobPosting): AlignmentScore {
    const skillsMatch = this.calculateBasicSkillsMatch(candidate.skills, job.description);
    
    return {
      overallScore: Math.round(skillsMatch * 0.7 + 60),
      technicalScore: Math.round(skillsMatch * 0.8 + 50),
      experienceScore: 70,
      skillsScore: Math.round(skillsMatch),
      culturalFitScore: 75,
      detailedBreakdown: `Basic analysis: ${candidate.skills.length} skills identified, ${Math.round(skillsMatch)}% match with job requirements.`,
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
    
    // Simple keyword matching
    const commonSkills = ['javascript', 'python', 'react', 'node.js', 'sql', 'aws'];
    const missingSkills = commonSkills.filter(skill => 
      jobText.includes(skill) && !candidateSkills.some(cs => cs.includes(skill))
    );

    return {
      missingSkills,
      skillLevels: {},
      criticalGaps: missingSkills.slice(0, 2),
      niceToHave: missingSkills.slice(2)
    };
  }

  private generateFallbackInterviewQuestions(candidate: Candidate, job: JobPosting): string[] {
    return [
      'What experience do you have with the technologies mentioned in this role?',
      'How do you stay updated with industry trends?',
      'Describe a time you had to learn a new technology quickly',
      'What motivates you in your work?',
      'How do you handle tight deadlines and pressure?'
    ];
  }

  private generateFallbackCulturalFit() {
    return {
      fitScore: 75,
      strengths: ['Professional background', 'Relevant experience'],
      concerns: ['Limited information available'],
      recommendations: ['Conduct behavioral interview', 'Check references']
    };
  }

  private calculateBasicSkillsMatch(candidateSkills: string[], jobDescription: string): number {
    const jobText = jobDescription.toLowerCase();
    const skillMatches = candidateSkills.filter(skill => 
      jobText.includes(skill.toLowerCase())
    ).length;
    
    return Math.round((skillMatches / Math.max(candidateSkills.length, 1)) * 100);
  }
}

// Export singleton instance
export const aiAgent = new AIAgent();
