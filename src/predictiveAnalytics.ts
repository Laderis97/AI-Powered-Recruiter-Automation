// src/predictiveAnalytics.ts

export interface CandidatePrediction {
  successProbability: number;
  timeToHire: number; // in days
  retentionRisk: 'low' | 'medium' | 'high';
  performancePrediction: 'excellent' | 'good' | 'average' | 'below_average';
  confidence: number;
}

export interface MarketIntelligence {
  salaryRange: {
    min: number;
    median: number;
    max: number;
    currency: string;
  };
  skillsDemand: {
    skill: string;
    demand: 'high' | 'medium' | 'low';
    trend: 'rising' | 'stable' | 'declining';
  }[];
  marketRate: number;
  competitorAnalysis: {
    company: string;
    avgSalary: number;
    benefits: string[];
  }[];
}

export interface HiringMetrics {
  avgTimeToHire: number;
  successRate: number;
  retentionRate: number;
  costPerHire: number;
}

export class PredictiveAnalyticsService {
  private industryData: Map<string, any> = new Map();
  private roleData: Map<string, any> = new Map();
  
  constructor() {
    this.initializeMarketData();
  }

  /**
   * Predict candidate success probability
   */
  predictCandidateSuccess(
    candidate: any,
    job: any,
    marketData: MarketIntelligence
  ): CandidatePrediction {
    // Base success probability based on skills match
    let baseProbability = this.calculateBaseSuccessProbability(candidate, job);
    
    // Adjust based on experience level
    const experienceAdjustment = this.calculateExperienceAdjustment(candidate, job);
    
    // Adjust based on market conditions
    const marketAdjustment = this.calculateMarketAdjustment(marketData);
    
    // Adjust based on location and remote work
    const locationAdjustment = this.calculateLocationAdjustment(candidate, job);
    
    // Calculate final probability
    const successProbability = Math.min(95, Math.max(5, 
      baseProbability + experienceAdjustment + marketAdjustment + locationAdjustment
    ));
    
    // Predict time to hire
    const timeToHire = this.predictTimeToHire(candidate, job, marketData);
    
    // Assess retention risk
    const retentionRisk = this.assessRetentionRisk(candidate, job, marketData);
    
    // Predict performance
    const performancePrediction = this.predictPerformance(candidate, job);
    
    // Calculate confidence level
    const confidence = this.calculateConfidence(candidate, job);
    
    return {
      successProbability: Math.round(successProbability),
      timeToHire,
      retentionRisk,
      performancePrediction,
      confidence
    };
  }

  /**
   * Get market intelligence for a role
   */
  getMarketIntelligence(
    role: string,
    location: string,
    industry: string,
    seniority: string
  ): MarketIntelligence {
    const baseSalary = this.getBaseSalary(role, location, industry, seniority);
    const marketMultiplier = this.getMarketMultiplier(location, industry);
    
    const salaryRange = {
      min: Math.round(baseSalary * 0.8),
      median: Math.round(baseSalary),
      max: Math.round(baseSalary * 1.4),
      currency: 'USD'
    };
    
    const skillsDemand = this.getSkillsDemand(role, industry);
    const marketRate = Math.round(baseSalary * marketMultiplier);
    const competitorAnalysis = this.getCompetitorAnalysis(role, industry);
    
    return {
      salaryRange,
      skillsDemand,
      marketRate,
      competitorAnalysis
    };
  }

  /**
   * Calculate hiring metrics
   */
  calculateHiringMetrics(
    role: string,
    industry: string,
    location: string
  ): HiringMetrics {
    const avgTimeToHire = this.getAverageTimeToHire(role, industry);
    const successRate = this.getSuccessRate(role, industry);
    const retentionRate = this.getRetentionRate(role, industry);
    const costPerHire = this.getCostPerHire(role, industry, location);
    
    return {
      avgTimeToHire,
      successRate,
      retentionRate,
      costPerHire
    };
  }

  // Private helper methods
  private calculateBaseSuccessProbability(candidate: any, job: any): number {
    let probability = 50; // Base 50%
    
    // Skills match bonus (0-30%)
    const skillsMatch = this.calculateSkillsMatch(candidate.skills, job.parsedData?.skills || []);
    probability += skillsMatch * 0.3;
    
    // Experience level bonus (0-20%)
    const experienceMatch = this.calculateExperienceMatch(candidate.experience, job.parsedData?.seniority);
    probability += experienceMatch * 0.2;
    
    return probability;
  }

  private calculateExperienceAdjustment(candidate: any, job: any): number {
    const candidateYears = this.extractYearsFromExperience(candidate.experience);
    const requiredYears = this.getRequiredYears(job.parsedData?.seniority);
    
    if (candidateYears >= requiredYears * 1.5) return 10; // Overqualified bonus
    if (candidateYears >= requiredYears) return 5; // Meets requirements
    if (candidateYears >= requiredYears * 0.7) return 0; // Slightly under
    return -10; // Significantly under
  }

  private calculateMarketAdjustment(marketData: MarketIntelligence): number {
    // Adjust based on market demand
    const highDemandSkills = marketData.skillsDemand.filter(s => s.demand === 'high').length;
    const risingSkills = marketData.skillsDemand.filter(s => s.trend === 'rising').length;
    
    return (highDemandSkills * 2) + (risingSkills * 1);
  }

  private calculateLocationAdjustment(candidate: any, job: any): number {
    // Simple location-based adjustment
    if (candidate.location === 'Remote' || job.location === 'Remote') return 5;
    if (candidate.location === job.location) return 10;
    if (this.isNearbyLocation(candidate.location, job.location)) return 5;
    return -5;
  }

  private predictTimeToHire(candidate: any, job: any, marketData: MarketIntelligence): number {
    let baseTime = 30; // Base 30 days
    
    // Adjust based on candidate availability
    if (candidate.isActivelyLooking) baseTime -= 5;
    if (candidate.hasNoticePeriod) baseTime += candidate.noticePeriod || 0;
    
    // Adjust based on market conditions
    const marketDemand = marketData.skillsDemand.filter(s => s.demand === 'high').length;
    if (marketDemand > 5) baseTime += 10; // High demand = longer time
    if (marketDemand < 2) baseTime -= 5; // Low demand = faster hiring
    
    // Adjust based on role seniority
    if (job.parsedData?.seniority === 'Senior' || job.parsedData?.seniority === 'Lead') {
      baseTime += 10;
    }
    
    return Math.max(7, Math.min(90, baseTime)); // Between 7-90 days
  }

  private assessRetentionRisk(candidate: any, job: any, marketData: MarketIntelligence): 'low' | 'medium' | 'high' {
    let riskScore = 0;
    
    // Job hopping risk
    if (candidate.jobHistory && candidate.jobHistory.length > 0) {
      const avgTenure = candidate.jobHistory.reduce((sum: number, job: any) => 
        sum + (job.duration || 12), 0) / candidate.jobHistory.length;
      
      if (avgTenure < 12) riskScore += 3; // Less than 1 year average
      else if (avgTenure < 24) riskScore += 1; // 1-2 years average
    }
    
    // Market competition risk
    const highDemandSkills = marketData.skillsDemand.filter(s => s.demand === 'high').length;
    if (highDemandSkills > 5) riskScore += 2; // High market demand
    
    // Salary risk
    if (marketData.marketRate > job.salary * 1.2) riskScore += 2; // Underpaid
    
    if (riskScore <= 2) return 'low';
    if (riskScore <= 4) return 'medium';
    return 'high';
  }

  private predictPerformance(candidate: any, job: any): 'excellent' | 'good' | 'average' | 'below_average' {
    let score = 0;
    
    // Skills match
    const skillsMatch = this.calculateSkillsMatch(candidate.skills, job.parsedData?.skills || []);
    score += skillsMatch * 0.4;
    
    // Experience relevance
    const experienceRelevance = this.calculateExperienceRelevance(candidate.experience, job.parsedData?.seniority);
    score += experienceRelevance * 0.3;
    
    // Education and certifications
    if (candidate.education) score += 10;
    if (candidate.certifications && candidate.certifications.length > 0) score += 10;
    
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'below_average';
  }

  private calculateConfidence(candidate: any, job: any): number {
    let confidence = 70; // Base confidence
    
    // More candidate data = higher confidence
    if (candidate.linkedin) confidence += 5;
    if (candidate.github) confidence += 5;
    if (candidate.portfolio) confidence += 5;
    if (candidate.references) confidence += 5;
    
    // Job description quality
    if (job.parsedData?.skills && job.parsedData.skills.length > 5) confidence += 10;
    
    return Math.min(95, confidence);
  }

  // Utility methods
  private calculateSkillsMatch(candidateSkills: string[], jobSkills: string[]): number {
    if (jobSkills.length === 0) return 70;
    
    const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase()));
    const jobSet = new Set(jobSkills.map(s => s.toLowerCase()));
    
    const intersection = new Set([...candidateSet].filter(x => jobSet.has(x)));
    return Math.round((intersection.size / jobSet.size) * 100);
  }

  private calculateExperienceMatch(candidateExperience: string, requiredSeniority: string): number {
    const candidateYears = this.extractYearsFromExperience(candidateExperience);
    const requiredYears = this.getRequiredYears(requiredSeniority);
    
    if (candidateYears >= requiredYears) return 100;
    if (candidateYears >= requiredYears * 0.8) return 80;
    if (candidateYears >= requiredYears * 0.6) return 60;
    return 40;
  }

  private calculateExperienceRelevance(candidateExperience: string, requiredSeniority: string): number {
    const candidateYears = this.extractYearsFromExperience(candidateExperience);
    const requiredYears = this.getRequiredYears(requiredSeniority);
    
    if (candidateYears >= requiredYears * 1.2) return 100; // Overqualified
    if (candidateYears >= requiredYears * 0.9) return 90; // Perfect match
    if (candidateYears >= requiredYears * 0.7) return 70; // Slightly under
    return 50; // Significantly under
  }

  private extractYearsFromExperience(experience: string): number {
    const match = experience.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
  }

  private getRequiredYears(seniority: string): number {
    switch (seniority) {
      case 'IC': return 2;
      case 'Senior': return 5;
      case 'Manager': return 7;
      case 'Lead': return 8;
      default: return 3;
    }
  }

  private getMarketMultiplier(location: string, industry: string): number {
    // Location multipliers
    const locationMultipliers: { [key: string]: number } = {
      'San Francisco': 1.4,
      'New York': 1.35,
      'Seattle': 1.3,
      'Austin': 1.2,
      'Remote': 1.0
    };
    
    // Industry multipliers
    const industryMultipliers: { [key: string]: number } = {
      'technology': 1.2,
      'finance': 1.15,
      'healthcare': 1.1,
      'retail': 0.9
    };
    
    const locationMultiplier = locationMultipliers[location] || 1.0;
    const industryMultiplier = industryMultipliers[industry] || 1.0;
    
    return locationMultiplier * industryMultiplier;
  }

  private isNearbyLocation(location1: string, location2: string): boolean {
    // Simple nearby location check
    const nearbyLocations: { [key: string]: string[] } = {
      'San Francisco': ['Oakland', 'San Jose', 'Palo Alto'],
      'New York': ['Brooklyn', 'Queens', 'Jersey City'],
      'Seattle': ['Bellevue', 'Redmond', 'Kirkland']
    };
    
    return nearbyLocations[location1]?.includes(location2) || 
           nearbyLocations[location2]?.includes(location1) || false;
  }

  // Market data methods
  private getBaseSalary(role: string, location: string, industry: string, seniority: string): number {
    // Base salaries by role and seniority
    const baseSalaries: { [key: string]: { [key: string]: number } } = {
      'Software Engineer': { 'IC': 80000, 'Senior': 120000, 'Manager': 150000, 'Lead': 180000 },
      'Data Scientist': { 'IC': 90000, 'Senior': 130000, 'Manager': 160000, 'Lead': 190000 },
      'Product Manager': { 'IC': 85000, 'Senior': 125000, 'Manager': 160000, 'Lead': 190000 },
      'DevOps Engineer': { 'IC': 85000, 'Senior': 125000, 'Manager': 155000, 'Lead': 180000 }
    };
    
    return baseSalaries[role]?.[seniority] || 80000;
  }

  private getSkillsDemand(role: string, industry: string): any[] {
    // Mock skills demand data
    return [
      { skill: 'Python', demand: 'high', trend: 'rising' },
      { skill: 'JavaScript', demand: 'high', trend: 'stable' },
      { skill: 'React', demand: 'high', trend: 'rising' },
      { skill: 'AWS', demand: 'high', trend: 'rising' },
      { skill: 'Machine Learning', demand: 'medium', trend: 'rising' }
    ];
  }

  private getCompetitorAnalysis(role: string, industry: string): any[] {
    // Mock competitor analysis
    return [
      { company: 'Google', avgSalary: 150000, benefits: ['Health', '401k', 'Stock'] },
      { company: 'Microsoft', avgSalary: 140000, benefits: ['Health', '401k', 'Stock'] },
      { company: 'Amazon', avgSalary: 130000, benefits: ['Health', '401k', 'Stock'] }
    ];
  }

  private getAverageTimeToHire(role: string, industry: string): number {
    return 35; // Mock data
  }

  private getSuccessRate(role: string, industry: string): number {
    return 75; // Mock data
  }

  private getRetentionRate(role: string, industry: string): number {
    return 80; // Mock data
  }

  private getCostPerHire(role: string, industry: string, location: string): number {
    return 15000; // Mock data
  }

  private initializeMarketData() {
    // Initialize market data maps
    this.industryData.set('technology', {
      avgSalary: 120000,
      growthRate: 0.15,
      demand: 'high'
    });
    
    this.roleData.set('Software Engineer', {
      avgSalary: 110000,
      demand: 'high',
      skills: ['Programming', 'Problem Solving', 'Communication']
    });
  }
}
