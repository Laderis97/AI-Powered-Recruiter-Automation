// src/advancedAssessment.ts

export interface BehavioralAssessment {
  communicationStyle:
    | 'assertive'
    | 'passive'
    | 'aggressive'
    | 'passive-aggressive';
  teamworkPreference: 'collaborator' | 'independent' | 'leader' | 'supporter';
  conflictResolution:
    | 'avoidant'
    | 'accommodating'
    | 'compromising'
    | 'collaborating'
    | 'competing';
  stressResponse: 'calm' | 'anxious' | 'focused' | 'overwhelmed';
  adaptabilityScore: number; // 0-100
  emotionalIntelligence: number; // 0-100
  recommendations: string[];
}

export interface TechnicalAssessment {
  codingAbility: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  problemSolving: 'basic' | 'analytical' | 'creative' | 'strategic';
  systemDesign: 'none' | 'basic' | 'intermediate' | 'advanced';
  debuggingSkills: 'basic' | 'methodical' | 'efficient' | 'expert';
  codeQuality: 'poor' | 'adequate' | 'good' | 'excellent';
  overallScore: number; // 0-100
  strengths: string[];
  areasForImprovement: string[];
}

export interface SoftSkillsAssessment {
  communication: {
    verbal: number; // 0-100
    written: number; // 0-100
    presentation: number; // 0-100
    listening: number; // 0-100
  };
  leadership: {
    vision: number; // 0-100
    motivation: number; // 0-100
    delegation: number; // 0-100
    conflictManagement: number; // 0-100
  };
  collaboration: {
    teamwork: number; // 0-100
    crossFunctional: number; // 0-100
    stakeholderManagement: number; // 0-100
  };
  overallScore: number; // 0-100
  recommendations: string[];
}

export interface LeadershipPotential {
  potential: 'low' | 'medium' | 'high' | 'exceptional';
  readiness: 'not_ready' | 'developing' | 'ready' | 'overdue';
  keyStrengths: string[];
  developmentAreas: string[];
  timeline: '6_months' | '1_year' | '2_years' | '3_years';
  confidence: number; // 0-100
  recommendations: string[];
}

export interface ComprehensiveAssessment {
  behavioral: BehavioralAssessment;
  technical: TechnicalAssessment;
  softSkills: SoftSkillsAssessment;
  leadership: LeadershipPotential;
  overallScore: number; // 0-100
  riskFactors: string[];
  strengths: string[];
  developmentPlan: string[];
  nextSteps: string[];
}

export class AdvancedAssessmentEngine {
  private assessmentTemplates: Map<string, any> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Perform comprehensive behavioral assessment
   */
  assessBehavioralProfile(
    candidate: any,
    job: any,
    interviewResponses?: any[]
  ): BehavioralAssessment {
    // Analyze candidate background and responses
    const communicationStyle = this.assessCommunicationStyle(
      candidate,
      interviewResponses
    );
    const teamworkPreference = this.assessTeamworkPreference(
      candidate,
      interviewResponses
    );
    const conflictResolution = this.assessConflictResolution(
      candidate,
      interviewResponses
    );
    const stressResponse = this.assessStressResponse(
      candidate,
      interviewResponses
    );
    const adaptabilityScore = this.calculateAdaptabilityScore(candidate, job);
    const emotionalIntelligence = this.calculateEmotionalIntelligence(
      candidate,
      interviewResponses
    );

    const recommendations = this.generateBehavioralRecommendations(
      communicationStyle,
      teamworkPreference,
      conflictResolution,
      stressResponse,
      adaptabilityScore,
      emotionalIntelligence
    );

    return {
      communicationStyle,
      teamworkPreference,
      conflictResolution,
      stressResponse,
      adaptabilityScore,
      emotionalIntelligence,
      recommendations,
    };
  }

  /**
   * Assess technical capabilities
   */
  assessTechnicalCapabilities(
    candidate: any,
    job: any,
    technicalQuestions?: any[]
  ): TechnicalAssessment {
    const codingAbility = this.assessCodingAbility(
      candidate,
      technicalQuestions
    );
    const problemSolving = this.assessProblemSolving(
      candidate,
      technicalQuestions
    );
    const systemDesign = this.assessSystemDesign(candidate, technicalQuestions);
    const debuggingSkills = this.assessDebuggingSkills(
      candidate,
      technicalQuestions
    );
    const codeQuality = this.assessCodeQuality(candidate, technicalQuestions);

    const overallScore = this.calculateTechnicalScore(
      codingAbility,
      problemSolving,
      systemDesign,
      debuggingSkills,
      codeQuality
    );

    const strengths = this.identifyTechnicalStrengths(
      codingAbility,
      problemSolving,
      systemDesign,
      debuggingSkills,
      codeQuality
    );

    const areasForImprovement = this.identifyTechnicalWeaknesses(
      codingAbility,
      problemSolving,
      systemDesign,
      debuggingSkills,
      codeQuality
    );

    return {
      codingAbility,
      problemSolving,
      systemDesign,
      debuggingSkills,
      codeQuality,
      overallScore,
      strengths,
      areasForImprovement,
    };
  }

  /**
   * Evaluate soft skills
   */
  evaluateSoftSkills(
    candidate: any,
    job: any,
    behavioralQuestions?: any[]
  ): SoftSkillsAssessment {
    const communication = {
      verbal: this.assessVerbalCommunication(candidate, behavioralQuestions),
      written: this.assessWrittenCommunication(candidate, behavioralQuestions),
      presentation: this.assessPresentationSkills(
        candidate,
        behavioralQuestions
      ),
      listening: this.assessListeningSkills(candidate, behavioralQuestions),
    };

    const leadership = {
      vision: this.assessVision(candidate, behavioralQuestions),
      motivation: this.assessMotivation(candidate, behavioralQuestions),
      delegation: this.assessDelegation(candidate, behavioralQuestions),
      conflictManagement: this.assessConflictManagement(
        candidate,
        behavioralQuestions
      ),
    };

    const collaboration = {
      teamwork: this.assessTeamwork(candidate, behavioralQuestions),
      crossFunctional: this.assessCrossFunctional(
        candidate,
        behavioralQuestions
      ),
      stakeholderManagement: this.assessStakeholderManagement(
        candidate,
        behavioralQuestions
      ),
    };

    const overallScore = this.calculateSoftSkillsScore(
      communication,
      leadership,
      collaboration
    );
    const recommendations = this.generateSoftSkillsRecommendations(
      communication,
      leadership,
      collaboration
    );

    return {
      communication,
      leadership,
      collaboration,
      overallScore,
      recommendations,
    };
  }

  /**
   * Assess leadership potential
   */
  assessLeadershipPotential(
    candidate: any,
    job: any,
    assessmentData: {
      behavioral: BehavioralAssessment;
      technical: TechnicalAssessment;
      softSkills: SoftSkillsAssessment;
    }
  ): LeadershipPotential {
    const potential = this.evaluateLeadershipPotential(
      assessmentData.behavioral,
      assessmentData.technical,
      assessmentData.softSkills
    );

    const readiness = this.assessLeadershipReadiness(
      assessmentData.behavioral,
      assessmentData.technical,
      assessmentData.softSkills
    );

    const keyStrengths = this.identifyLeadershipStrengths(
      assessmentData.behavioral,
      assessmentData.technical,
      assessmentData.softSkills
    );

    const developmentAreas = this.identifyLeadershipDevelopmentAreas(
      assessmentData.behavioral,
      assessmentData.technical,
      assessmentData.softSkills
    );

    const timeline = this.predictLeadershipTimeline(
      assessmentData.behavioral,
      assessmentData.technical,
      assessmentData.softSkills
    );

    const confidence = this.calculateLeadershipConfidence(
      assessmentData.behavioral,
      assessmentData.technical,
      assessmentData.softSkills
    );

    const recommendations = this.generateLeadershipRecommendations(
      potential,
      readiness,
      keyStrengths,
      developmentAreas,
      timeline
    );

    return {
      potential,
      readiness,
      keyStrengths,
      developmentAreas,
      timeline,
      confidence,
      recommendations,
    };
  }

  /**
   * Perform comprehensive assessment
   */
  performComprehensiveAssessment(
    candidate: any,
    job: any,
    assessmentData?: {
      interviewResponses?: any[];
      technicalQuestions?: any[];
      behavioralQuestions?: any[];
    }
  ): ComprehensiveAssessment {
    const behavioral = this.assessBehavioralProfile(
      candidate,
      job,
      assessmentData?.interviewResponses
    );

    const technical = this.assessTechnicalCapabilities(
      candidate,
      job,
      assessmentData?.technicalQuestions
    );

    const softSkills = this.evaluateSoftSkills(
      candidate,
      job,
      assessmentData?.behavioralQuestions
    );

    const leadership = this.assessLeadershipPotential(candidate, job, {
      behavioral,
      technical,
      softSkills,
    });

    const overallScore = this.calculateOverallAssessmentScore(
      behavioral,
      technical,
      softSkills,
      leadership
    );

    const riskFactors = this.identifyRiskFactors(
      behavioral,
      technical,
      softSkills,
      leadership
    );

    const strengths = this.identifyOverallStrengths(
      behavioral,
      technical,
      softSkills,
      leadership
    );

    const developmentPlan = this.createDevelopmentPlan(
      behavioral,
      technical,
      softSkills,
      leadership
    );

    const nextSteps = this.recommendNextSteps(
      overallScore,
      riskFactors,
      strengths,
      developmentPlan
    );

    return {
      behavioral,
      technical,
      softSkills,
      leadership,
      overallScore,
      riskFactors,
      strengths,
      developmentPlan,
      nextSteps,
    };
  }

  // Private helper methods for behavioral assessment
  private assessCommunicationStyle(
    candidate: any,
    responses?: any[]
  ): 'assertive' | 'passive' | 'aggressive' | 'passive-aggressive' {
    // Analyze candidate's communication patterns
    if (responses && responses.length > 0) {
      // Analyze interview responses for communication style indicators
      const assertiveIndicators = responses.filter(
        r =>
          r.includes('confident') || r.includes('direct') || r.includes('clear')
      ).length;

      if (assertiveIndicators > 2) return 'assertive';
      if (assertiveIndicators === 0) return 'passive';
      return 'passive-aggressive';
    }

    // Fallback based on candidate background
    return 'assertive';
  }

  private assessTeamworkPreference(
    candidate: any,
    responses?: any[]
  ): 'collaborator' | 'independent' | 'leader' | 'supporter' {
    if (responses && responses.length > 0) {
      const leadershipIndicators = responses.filter(
        r =>
          r.includes('led') ||
          r.includes('managed') ||
          r.includes('coordinated')
      ).length;

      if (leadershipIndicators > 2) return 'leader';
      if (leadershipIndicators > 0) return 'collaborator';
      return 'supporter';
    }

    return 'collaborator';
  }

  private assessConflictResolution(
    candidate: any,
    responses?: any[]
  ):
    | 'avoidant'
    | 'accommodating'
    | 'compromising'
    | 'collaborating'
    | 'competing' {
    if (responses && responses.length > 0) {
      const collaborativeIndicators = responses.filter(
        r =>
          r.includes('discussed') ||
          r.includes('understood') ||
          r.includes('agreed')
      ).length;

      if (collaborativeIndicators > 2) return 'collaborating';
      if (collaborativeIndicators > 1) return 'compromising';
      return 'accommodating';
    }

    return 'compromising';
  }

  private assessStressResponse(
    candidate: any,
    responses?: any[]
  ): 'calm' | 'anxious' | 'focused' | 'overwhelmed' {
    if (responses && responses.length > 0) {
      const stressIndicators = responses.filter(
        r =>
          r.includes('pressure') ||
          r.includes('deadline') ||
          r.includes('challenge')
      ).length;

      if (stressIndicators === 0) return 'calm';
      if (stressIndicators > 2) return 'anxious';
      return 'focused';
    }

    return 'focused';
  }

  private calculateAdaptabilityScore(candidate: any, job: any): number {
    let score = 70; // Base score

    // Adjust based on experience diversity
    if (candidate.skills && candidate.skills.length > 5) score += 10;
    if (candidate.location && candidate.location !== 'Remote') score += 5;

    // Adjust based on job requirements
    if (job.parsedData?.skills && job.parsedData.skills.length > 3) score += 10;

    return Math.min(100, score);
  }

  private calculateEmotionalIntelligence(
    candidate: any,
    responses?: any[]
  ): number {
    let score = 75; // Base score

    if (responses && responses.length > 0) {
      const empathyIndicators = responses.filter(
        r =>
          r.includes('understand') ||
          r.includes('feel') ||
          r.includes('perspective')
      ).length;

      score += empathyIndicators * 5;
    }

    return Math.min(100, score);
  }

  // Private helper methods for technical assessment
  private assessCodingAbility(
    candidate: any,
    questions?: any[]
  ): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (questions && questions.length > 0) {
      const correctAnswers = questions.filter(q => q.correct).length;
      const totalQuestions = questions.length;

      if (correctAnswers / totalQuestions >= 0.9) return 'expert';
      if (correctAnswers / totalQuestions >= 0.7) return 'advanced';
      if (correctAnswers / totalQuestions >= 0.5) return 'intermediate';
      return 'beginner';
    }

    // Fallback based on experience
    const years = this.extractYearsFromExperience(candidate.experience);
    if (years >= 8) return 'expert';
    if (years >= 5) return 'advanced';
    if (years >= 2) return 'intermediate';
    return 'beginner';
  }

  private assessProblemSolving(
    candidate: any,
    questions?: any[]
  ): 'basic' | 'analytical' | 'creative' | 'strategic' {
    if (questions && questions.length > 0) {
      const creativeAnswers = questions.filter(q => q.creative).length;
      const strategicAnswers = questions.filter(q => q.strategic).length;

      if (strategicAnswers > 2) return 'strategic';
      if (creativeAnswers > 2) return 'creative';
      if (creativeAnswers > 0) return 'analytical';
      return 'basic';
    }

    return 'analytical';
  }

  private assessSystemDesign(
    candidate: any,
    questions?: any[]
  ): 'none' | 'basic' | 'intermediate' | 'advanced' {
    if (questions && questions.length > 0) {
      const designQuestions = questions.filter(q => q.type === 'system_design');
      if (designQuestions.length === 0) return 'none';

      const correctDesigns = designQuestions.filter(q => q.correct).length;
      const totalDesigns = designQuestions.length;

      if (correctDesigns / totalDesigns >= 0.8) return 'advanced';
      if (correctDesigns / totalDesigns >= 0.6) return 'intermediate';
      return 'basic';
    }

    // Fallback based on experience
    const years = this.extractYearsFromExperience(candidate.experience);
    if (years >= 6) return 'intermediate';
    if (years >= 3) return 'basic';
    return 'none';
  }

  private assessDebuggingSkills(
    candidate: any,
    questions?: any[]
  ): 'basic' | 'methodical' | 'efficient' | 'expert' {
    if (questions && questions.length > 0) {
      const debuggingQuestions = questions.filter(q => q.type === 'debugging');
      if (debuggingQuestions.length === 0) return 'basic';

      const correctDebugging = debuggingQuestions.filter(q => q.correct).length;
      const totalDebugging = debuggingQuestions.length;

      if (correctDebugging / totalDebugging >= 0.9) return 'expert';
      if (correctDebugging / totalDebugging >= 0.7) return 'efficient';
      if (correctDebugging / totalDebugging >= 0.5) return 'methodical';
      return 'basic';
    }

    return 'methodical';
  }

  private assessCodeQuality(
    candidate: any,
    questions?: any[]
  ): 'poor' | 'adequate' | 'good' | 'excellent' {
    if (questions && questions.length > 0) {
      const qualityQuestions = questions.filter(q => q.type === 'code_quality');
      if (qualityQuestions.length === 0) return 'adequate';

      const highQuality = qualityQuestions.filter(
        q => q.quality === 'high'
      ).length;
      const totalQuality = qualityQuestions.length;

      if (highQuality / totalQuality >= 0.8) return 'excellent';
      if (highQuality / totalQuality >= 0.6) return 'good';
      if (highQuality / totalQuality >= 0.4) return 'adequate';
      return 'poor';
    }

    return 'adequate';
  }

  // Private helper methods for soft skills assessment
  private assessVerbalCommunication(candidate: any, questions?: any[]): number {
    let score = 75;

    if (questions && questions.length > 0) {
      const communicationQuestions = questions.filter(
        q => q.type === 'communication'
      );
      const clarityScore = communicationQuestions.filter(
        q => q.clarity === 'high'
      ).length;
      const totalComm = communicationQuestions.length;

      if (totalComm > 0) {
        score = (clarityScore / totalComm) * 100;
      }
    }

    return Math.round(score);
  }

  private assessWrittenCommunication(
    candidate: any,
    questions?: any[]
  ): number {
    let score = 75;

    if (questions && questions.length > 0) {
      const writtenQuestions = questions.filter(q => q.type === 'written');
      const clarityScore = writtenQuestions.filter(
        q => q.clarity === 'high'
      ).length;
      const totalWritten = writtenQuestions.length;

      if (totalWritten > 0) {
        score = (clarityScore / totalWritten) * 100;
      }
    }

    return Math.round(score);
  }

  private assessPresentationSkills(candidate: any, questions?: any[]): number {
    let score = 70;

    if (questions && questions.length > 0) {
      const presentationQuestions = questions.filter(
        q => q.type === 'presentation'
      );
      const confidenceScore = presentationQuestions.filter(
        q => q.confidence === 'high'
      ).length;
      const totalPresentations = presentationQuestions.length;

      if (totalPresentations > 0) {
        score = (confidenceScore / totalPresentations) * 100;
      }
    }

    return Math.round(score);
  }

  private assessListeningSkills(candidate: any, questions?: any[]): number {
    let score = 75;

    if (questions && questions.length > 0) {
      const listeningQuestions = questions.filter(q => q.type === 'listening');
      const comprehensionScore = listeningQuestions.filter(
        q => q.comprehension === 'high'
      ).length;
      const totalListening = listeningQuestions.length;

      if (totalListening > 0) {
        score = (comprehensionScore / totalListening) * 100;
      }
    }

    return Math.round(score);
  }

  // Leadership assessment methods
  private assessVision(candidate: any, questions?: any[]): number {
    let score = 70;

    if (questions && questions.length > 0) {
      const visionQuestions = questions.filter(q => q.type === 'vision');
      const visionScore = visionQuestions.filter(
        q => q.vision === 'clear'
      ).length;
      const totalVision = visionQuestions.length;

      if (totalVision > 0) {
        score = (visionScore / totalVision) * 100;
      }
    }

    return Math.round(score);
  }

  private assessMotivation(candidate: any, questions?: any[]): number {
    let score = 75;

    if (questions && questions.length > 0) {
      const motivationQuestions = questions.filter(
        q => q.type === 'motivation'
      );
      const motivationScore = motivationQuestions.filter(
        q => q.motivation === 'high'
      ).length;
      const totalMotivation = motivationQuestions.length;

      if (totalMotivation > 0) {
        score = (motivationScore / totalMotivation) * 100;
      }
    }

    return Math.round(score);
  }

  private assessDelegation(candidate: any, questions?: any[]): number {
    let score = 70;

    if (questions && questions.length > 0) {
      const delegationQuestions = questions.filter(
        q => q.type === 'delegation'
      );
      const delegationScore = delegationQuestions.filter(
        q => q.effective === 'yes'
      ).length;
      const totalDelegation = delegationQuestions.length;

      if (totalDelegation > 0) {
        score = (delegationScore / totalDelegation) * 100;
      }
    }

    return Math.round(score);
  }

  private assessConflictManagement(candidate: any, questions?: any[]): number {
    let score = 70;

    if (questions && questions.length > 0) {
      const conflictQuestions = questions.filter(q => q.type === 'conflict');
      const conflictScore = conflictQuestions.filter(
        q => q.resolution === 'effective'
      ).length;
      const totalConflict = conflictQuestions.length;

      if (totalConflict > 0) {
        score = (conflictScore / totalConflict) * 100;
      }
    }

    return Math.round(score);
  }

  // Teamwork and collaboration assessment
  private assessTeamwork(candidate: any, questions?: any[]): number {
    let score = 75;

    if (questions && questions.length > 0) {
      const teamworkQuestions = questions.filter(q => q.type === 'teamwork');
      const teamworkScore = teamworkQuestions.filter(
        q => q.effective === 'yes'
      ).length;
      const totalTeamwork = teamworkQuestions.length;

      if (totalTeamwork > 0) {
        score = (teamworkScore / totalTeamwork) * 100;
      }
    }

    return Math.round(score);
  }

  private assessCrossFunctional(candidate: any, questions?: any[]): number {
    let score = 70;

    if (questions && questions.length > 0) {
      const crossFuncQuestions = questions.filter(
        q => q.type === 'cross_functional'
      );
      const crossFuncScore = crossFuncQuestions.filter(
        q => q.effective === 'yes'
      ).length;
      const totalCrossFunc = crossFuncQuestions.length;

      if (totalCrossFunc > 0) {
        score = (crossFuncScore / totalCrossFunc) * 100;
      }
    }

    return Math.round(score);
  }

  private assessStakeholderManagement(
    candidate: any,
    questions?: any[]
  ): number {
    let score = 70;

    if (questions && questions.length > 0) {
      const stakeholderQuestions = questions.filter(
        q => q.type === 'stakeholder'
      );
      const stakeholderScore = stakeholderQuestions.filter(
        q => q.effective === 'yes'
      ).length;
      const totalStakeholder = stakeholderQuestions.length;

      if (totalStakeholder > 0) {
        score = (stakeholderScore / totalStakeholder) * 100;
      }
    }

    return Math.round(score);
  }

  // Scoring and calculation methods
  private calculateTechnicalScore(
    coding: string,
    problemSolving: string,
    systemDesign: string,
    debugging: string,
    codeQuality: string
  ): number {
    const scores = {
      coding: {
        beginner: 25,
        intermediate: 50,
        advanced: 75,
        expert: 95,
      } as const,
      problemSolving: {
        basic: 20,
        analytical: 50,
        creative: 75,
        strategic: 90,
      } as const,
      systemDesign: {
        none: 0,
        basic: 30,
        intermediate: 60,
        advanced: 85,
      } as const,
      debugging: {
        basic: 25,
        methodical: 50,
        efficient: 75,
        expert: 90,
      } as const,
      codeQuality: { poor: 20, adequate: 45, good: 70, excellent: 90 } as const,
    };

    const total =
      (scores.coding[coding as keyof typeof scores.coding] || 0) +
      (scores.problemSolving[
        problemSolving as keyof typeof scores.problemSolving
      ] || 0) +
      (scores.systemDesign[systemDesign as keyof typeof scores.systemDesign] ||
        0) +
      (scores.debugging[debugging as keyof typeof scores.debugging] || 0) +
      (scores.codeQuality[codeQuality as keyof typeof scores.codeQuality] || 0);

    return Math.round(total / 5);
  }

  private calculateSoftSkillsScore(
    communication: any,
    leadership: any,
    collaboration: any
  ): number {
    const commAvg =
      (communication.verbal +
        communication.written +
        communication.presentation +
        communication.listening) /
      4;

    const leaderAvg =
      (leadership.vision +
        leadership.motivation +
        leadership.delegation +
        leadership.conflictManagement) /
      4;

    const collabAvg =
      (collaboration.teamwork +
        collaboration.crossFunctional +
        collaboration.stakeholderManagement) /
      3;

    return Math.round((commAvg + leaderAvg + collabAvg) / 3);
  }

  private calculateOverallAssessmentScore(
    behavioral: BehavioralAssessment,
    technical: TechnicalAssessment,
    softSkills: SoftSkillsAssessment,
    leadership: LeadershipPotential
  ): number {
    const behavioralWeight = 0.25;
    const technicalWeight = 0.35;
    const softSkillsWeight = 0.25;
    const leadershipWeight = 0.15;

    const behavioralScore =
      (behavioral.adaptabilityScore + behavioral.emotionalIntelligence) / 2;
    const technicalScore = technical.overallScore;
    const softSkillsScore = softSkills.overallScore;
    const leadershipScore = leadership.confidence;

    const overallScore =
      behavioralScore * behavioralWeight +
      technicalScore * technicalWeight +
      softSkillsScore * softSkillsWeight +
      leadershipScore * leadershipWeight;

    return Math.round(overallScore);
  }

  // Leadership potential evaluation methods
  private evaluateLeadershipPotential(
    behavioral: BehavioralAssessment,
    technical: TechnicalAssessment,
    softSkills: SoftSkillsAssessment
  ): 'low' | 'medium' | 'high' | 'exceptional' {
    const leadershipScore =
      (softSkills.leadership.vision +
        softSkills.leadership.motivation +
        softSkills.leadership.delegation +
        softSkills.leadership.conflictManagement) /
      4;

    if (leadershipScore >= 90) return 'exceptional';
    if (leadershipScore >= 80) return 'high';
    if (leadershipScore >= 65) return 'medium';
    return 'low';
  }

  private assessLeadershipReadiness(
    behavioral: BehavioralAssessment,
    technical: TechnicalAssessment,
    softSkills: SoftSkillsAssessment
  ): 'not_ready' | 'developing' | 'ready' | 'overdue' {
    const overallScore =
      (behavioral.adaptabilityScore +
        technical.overallScore +
        softSkills.overallScore) /
      3;

    if (overallScore >= 85) return 'ready';
    if (overallScore >= 70) return 'developing';
    if (overallScore >= 55) return 'not_ready';
    return 'not_ready';
  }

  private predictLeadershipTimeline(
    behavioral: BehavioralAssessment,
    technical: TechnicalAssessment,
    softSkills: SoftSkillsAssessment
  ): '6_months' | '1_year' | '2_years' | '3_years' {
    const readiness = this.assessLeadershipReadiness(
      behavioral,
      technical,
      softSkills
    );

    switch (readiness) {
      case 'ready':
        return '6_months';
      case 'developing':
        return '1_year';
      case 'not_ready':
        return '2_years';
      default:
        return '3_years';
    }
  }

  private calculateLeadershipConfidence(
    behavioral: BehavioralAssessment,
    technical: TechnicalAssessment,
    softSkills: SoftSkillsAssessment
  ): number {
    const behavioralScore =
      (behavioral.adaptabilityScore + behavioral.emotionalIntelligence) / 2;
    const technicalScore = technical.overallScore;
    const softSkillsScore = softSkills.overallScore;

    const confidence =
      behavioralScore * 0.3 + technicalScore * 0.3 + softSkillsScore * 0.4;
    return Math.round(confidence);
  }

  // Utility methods
  private extractYearsFromExperience(experience: string): number {
    const match = experience.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
  }

  // Recommendation generation methods
  private generateBehavioralRecommendations(
    communication: string,
    teamwork: string,
    conflict: string,
    stress: string,
    adaptability: number,
    emotionalIntelligence: number
  ): string[] {
    const recommendations: string[] = [];

    if (communication === 'passive') {
      recommendations.push('Develop more assertive communication style');
    }
    if (teamwork === 'independent') {
      recommendations.push('Enhance collaboration and team-building skills');
    }
    if (conflict === 'avoidant') {
      recommendations.push('Practice constructive conflict resolution');
    }
    if (adaptability < 70) {
      recommendations.push('Work on adaptability and change management');
    }
    if (emotionalIntelligence < 70) {
      recommendations.push('Develop emotional intelligence and empathy');
    }

    return recommendations;
  }

  private identifyTechnicalStrengths(
    coding: string,
    problemSolving: string,
    systemDesign: string,
    debugging: string,
    codeQuality: string
  ): string[] {
    const strengths: string[] = [];

    if (coding === 'expert' || coding === 'advanced')
      strengths.push('Strong coding abilities');
    if (problemSolving === 'strategic' || problemSolving === 'creative')
      strengths.push('Excellent problem-solving skills');
    if (systemDesign === 'advanced')
      strengths.push('Advanced system design capabilities');
    if (debugging === 'expert' || debugging === 'efficient')
      strengths.push('Strong debugging skills');
    if (codeQuality === 'excellent' || codeQuality === 'good')
      strengths.push('High code quality standards');

    return strengths;
  }

  private identifyTechnicalWeaknesses(
    coding: string,
    problemSolving: string,
    systemDesign: string,
    debugging: string,
    codeQuality: string
  ): string[] {
    const weaknesses: string[] = [];

    if (coding === 'beginner')
      weaknesses.push('Basic coding skills need development');
    if (problemSolving === 'basic')
      weaknesses.push('Problem-solving approach needs improvement');
    if (systemDesign === 'none' || systemDesign === 'basic')
      weaknesses.push('System design skills require development');
    if (debugging === 'basic')
      weaknesses.push('Debugging methodology needs enhancement');
    if (codeQuality === 'poor' || codeQuality === 'adequate')
      weaknesses.push('Code quality standards need improvement');

    return weaknesses;
  }

  private generateSoftSkillsRecommendations(
    communication: any,
    leadership: any,
    collaboration: any
  ): string[] {
    const recommendations: string[] = [];

    if (communication.verbal < 70)
      recommendations.push('Improve verbal communication clarity');
    if (communication.written < 70)
      recommendations.push('Enhance written communication skills');
    if (communication.presentation < 70)
      recommendations.push('Develop presentation skills');
    if (communication.listening < 70)
      recommendations.push('Practice active listening techniques');

    if (leadership.vision < 70)
      recommendations.push('Develop strategic vision and planning');
    if (leadership.motivation < 70)
      recommendations.push('Enhance team motivation skills');
    if (leadership.delegation < 70)
      recommendations.push('Improve delegation and task assignment');
    if (leadership.conflictManagement < 70)
      recommendations.push('Develop conflict resolution strategies');

    if (collaboration.teamwork < 70)
      recommendations.push('Strengthen teamwork and collaboration');
    if (collaboration.crossFunctional < 70)
      recommendations.push('Develop cross-functional collaboration skills');
    if (collaboration.stakeholderManagement < 70)
      recommendations.push('Improve stakeholder management');

    return recommendations;
  }

  private identifyLeadershipStrengths(
    behavioral: BehavioralAssessment,
    technical: TechnicalAssessment,
    softSkills: SoftSkillsAssessment
  ): string[] {
    const strengths: string[] = [];

    if (behavioral.adaptabilityScore >= 80)
      strengths.push('High adaptability to change');
    if (behavioral.emotionalIntelligence >= 80)
      strengths.push('Strong emotional intelligence');
    if (technical.overallScore >= 80)
      strengths.push('Solid technical foundation');
    if (softSkills.leadership.vision >= 80)
      strengths.push('Clear strategic vision');
    if (softSkills.leadership.motivation >= 80)
      strengths.push('Strong motivational abilities');

    return strengths;
  }

  private identifyLeadershipDevelopmentAreas(
    behavioral: BehavioralAssessment,
    technical: TechnicalAssessment,
    softSkills: SoftSkillsAssessment
  ): string[] {
    const areas: string[] = [];

    if (behavioral.adaptabilityScore < 70)
      areas.push('Adaptability and change management');
    if (behavioral.emotionalIntelligence < 70)
      areas.push('Emotional intelligence development');
    if (technical.overallScore < 70) areas.push('Technical skill enhancement');
    if (softSkills.leadership.vision < 70)
      areas.push('Strategic vision development');
    if (softSkills.leadership.motivation < 70)
      areas.push('Team motivation skills');

    return areas;
  }

  private generateLeadershipRecommendations(
    potential: string,
    readiness: string,
    strengths: string[],
    developmentAreas: string[],
    timeline: string
  ): string[] {
    const recommendations: string[] = [];

    if (potential === 'high' || potential === 'exceptional') {
      recommendations.push(
        'High leadership potential - focus on readiness development'
      );
    }

    if (readiness === 'ready') {
      recommendations.push(
        'Ready for leadership role - consider promotion opportunities'
      );
    } else if (readiness === 'developing') {
      recommendations.push(
        'Leadership development in progress - continue current path'
      );
    } else {
      recommendations.push(
        'Leadership development needed - create structured development plan'
      );
    }

    if (strengths.length > 0) {
      recommendations.push(`Leverage strengths: ${strengths.join(', ')}`);
    }

    if (developmentAreas.length > 0) {
      recommendations.push(`Focus on: ${developmentAreas.join(', ')}`);
    }

    recommendations.push(`Expected timeline: ${timeline.replace('_', ' ')}`);

    return recommendations;
  }

  // Risk assessment and development planning
  private identifyRiskFactors(
    behavioral: BehavioralAssessment,
    technical: TechnicalAssessment,
    softSkills: SoftSkillsAssessment,
    leadership: LeadershipPotential
  ): string[] {
    const risks: string[] = [];

    if (behavioral.adaptabilityScore < 60)
      risks.push('Low adaptability may impact change management');
    if (behavioral.emotionalIntelligence < 60)
      risks.push('Low emotional intelligence may affect team dynamics');
    if (technical.overallScore < 60)
      risks.push('Technical gaps may impact role performance');
    if (softSkills.overallScore < 60)
      risks.push('Soft skills gaps may affect collaboration');
    if (leadership.confidence < 60)
      risks.push('Low leadership confidence may limit growth potential');

    return risks;
  }

  private identifyOverallStrengths(
    behavioral: BehavioralAssessment,
    technical: TechnicalAssessment,
    softSkills: SoftSkillsAssessment,
    leadership: LeadershipPotential
  ): string[] {
    const strengths: string[] = [];

    if (behavioral.adaptabilityScore >= 80)
      strengths.push('Highly adaptable to change');
    if (behavioral.emotionalIntelligence >= 80)
      strengths.push('Strong emotional intelligence');
    if (technical.overallScore >= 80)
      strengths.push('Excellent technical capabilities');
    if (softSkills.overallScore >= 80)
      strengths.push('Outstanding soft skills');
    if (leadership.confidence >= 80)
      strengths.push('High leadership potential');

    return strengths;
  }

  private createDevelopmentPlan(
    behavioral: BehavioralAssessment,
    technical: TechnicalAssessment,
    softSkills: SoftSkillsAssessment,
    leadership: LeadershipPotential
  ): string[] {
    const plan: string[] = [];

    // Behavioral development
    if (behavioral.adaptabilityScore < 70) {
      plan.push('Enroll in change management training');
      plan.push('Practice adapting to new situations');
    }

    if (behavioral.emotionalIntelligence < 70) {
      plan.push('Take emotional intelligence assessment');
      plan.push('Practice active listening and empathy');
    }

    // Technical development
    if (technical.overallScore < 70) {
      plan.push('Identify specific technical skill gaps');
      plan.push('Create technical learning roadmap');
    }

    // Soft skills development
    if (softSkills.overallScore < 70) {
      plan.push('Attend communication workshops');
      plan.push('Practice presentation skills');
    }

    // Leadership development
    if (leadership.confidence < 70) {
      plan.push('Seek mentorship opportunities');
      plan.push('Take on small leadership projects');
    }

    return plan;
  }

  private recommendNextSteps(
    overallScore: number,
    riskFactors: string[],
    strengths: string[],
    developmentPlan: string[]
  ): string[] {
    const nextSteps: string[] = [];

    if (overallScore >= 85) {
      nextSteps.push('Candidate is highly qualified - proceed with hiring');
      nextSteps.push('Consider fast-track development opportunities');
    } else if (overallScore >= 70) {
      nextSteps.push(
        'Candidate shows potential - proceed with development plan'
      );
      nextSteps.push('Implement structured development program');
    } else if (overallScore >= 55) {
      nextSteps.push(
        'Candidate needs significant development - consider alternative roles'
      );
      nextSteps.push('Create intensive development program if proceeding');
    } else {
      nextSteps.push('Candidate may not be suitable for this role');
      nextSteps.push('Consider other opportunities or additional screening');
    }

    if (riskFactors.length > 0) {
      nextSteps.push('Address identified risk factors before proceeding');
    }

    if (strengths.length > 0) {
      nextSteps.push('Leverage identified strengths in role assignment');
    }

    if (developmentPlan.length > 0) {
      nextSteps.push('Implement development plan with regular check-ins');
    }

    return nextSteps;
  }

  // Template initialization
  private initializeTemplates() {
    // Initialize assessment templates for different roles and levels
    this.assessmentTemplates.set('senior_developer', {
      technicalWeight: 0.4,
      softSkillsWeight: 0.3,
      behavioralWeight: 0.2,
      leadershipWeight: 0.1,
    });

    this.assessmentTemplates.set('team_lead', {
      technicalWeight: 0.3,
      softSkillsWeight: 0.3,
      behavioralWeight: 0.2,
      leadershipWeight: 0.2,
    });

    this.assessmentTemplates.set('engineering_manager', {
      technicalWeight: 0.2,
      softSkillsWeight: 0.3,
      behavioralWeight: 0.2,
      leadershipWeight: 0.3,
    });
  }
}
