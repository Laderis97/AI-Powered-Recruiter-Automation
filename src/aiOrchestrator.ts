// src/aiOrchestrator.ts

import { AIAgent } from './aiAgent.js';
import { SemanticSearchService } from './semanticSearch.js';
import { PredictiveAnalyticsService } from './predictiveAnalytics.js';
import { AdvancedAssessmentEngine } from './advancedAssessment.js';
import { MachineLearningService } from './machineLearning.js';

export interface OrchestrationConfig {
  enableSemanticSearch: boolean;
  enablePredictiveAnalytics: boolean;
  enableAdvancedAssessment: boolean;
  enableMachineLearning: boolean;
  fallbackStrategy: 'graceful' | 'aggressive' | 'conservative';
  timeoutMs: number;
  maxRetries: number;
  enableCaching: boolean;
  cacheTTLMs: number;
}

export interface WorkflowRequest {
  workflowType: 'comprehensive_assessment' | 'quick_evaluation' | 'leadership_assessment' | 'technical_deep_dive';
  candidateId: string;
  jobId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  config?: any;
  metadata?: {
    source: string;
    userId: string;
    timestamp: Date;
  };
}

export interface WorkflowResult {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  results: {
    roleAlignment?: any;
    skillsGap?: any;
    interviewQuestions?: any;
    culturalFit?: any;
    semanticAnalysis?: any;
    predictiveAnalytics?: any;
    advancedAssessment?: any;
    machineLearning?: any;
  };
  summary: {
    overallScore: number;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    nextSteps: string[];
  };
  metadata: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    servicesUsed: string[];
    errors?: string[];
  };
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  details: string;
}

export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  throughput: number; // requests per minute
  errorRate: number;
  cacheHitRate: number;
  serviceUtilization: {
    [serviceName: string]: number; // 0-100
  };
}

export class AIOrchestrator {
  private aiAgent!: AIAgent;
  private semanticSearch!: SemanticSearchService;
  private predictiveAnalytics!: PredictiveAnalyticsService;
  private advancedAssessment!: AdvancedAssessmentEngine;
  private machineLearning!: MachineLearningService;
  
  private config: OrchestrationConfig;
  private workflows: Map<string, WorkflowResult> = new Map();
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  private performanceMetrics!: PerformanceMetrics;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  
  constructor(config: Partial<OrchestrationConfig> = {}) {
    this.config = {
      enableSemanticSearch: true,
      enablePredictiveAnalytics: true,
      enableAdvancedAssessment: true,
      enableMachineLearning: true,
      fallbackStrategy: 'graceful',
      timeoutMs: 30000,
      maxRetries: 3,
      enableCaching: true,
      cacheTTLMs: 300000, // 5 minutes
      ...config
    };
    
    this.initializeServices();
    this.initializePerformanceMetrics();
    this.startHealthMonitoring();
  }

  /**
   * Execute a comprehensive AI workflow
   */
  async executeWorkflow(request: WorkflowRequest): Promise<WorkflowResult> {
    const workflowId = this.generateWorkflowId();
    const startTime = new Date();
    
    // Create workflow result
    const workflowResult: WorkflowResult = {
      workflowId,
      status: 'pending',
      progress: 0,
      results: {},
      summary: {
        overallScore: 0,
        confidence: 0,
        riskLevel: 'medium',
        recommendations: [],
        nextSteps: []
      },
      metadata: {
        startTime,
        servicesUsed: [],
        errors: []
      }
    };
    
    this.workflows.set(workflowId, workflowResult);
    
    try {
      // Update status to running
      workflowResult.status = 'running';
      workflowResult.progress = 10;
      
      // Get candidate and job data
      const { candidate, job } = await this.getCandidateAndJob(request.candidateId, request.jobId);
      workflowResult.progress = 20;
      
      // Execute workflow based on type
      switch (request.workflowType) {
        case 'comprehensive_assessment':
          await this.executeComprehensiveAssessment(workflowResult, candidate, job, request.config);
          break;
        case 'quick_evaluation':
          await this.executeQuickEvaluation(workflowResult, candidate, job, request.config);
          break;
        case 'leadership_assessment':
          await this.executeLeadershipAssessment(workflowResult, candidate, job, request.config);
          break;
        case 'technical_deep_dive':
          await this.executeTechnicalDeepDive(workflowResult, candidate, job, request.config);
          break;
        default:
          throw new Error(`Unknown workflow type: ${request.workflowType}`);
      }
      
      // Generate summary
      await this.generateWorkflowSummary(workflowResult);
      
      // Mark as completed
      workflowResult.status = 'completed';
      workflowResult.progress = 100;
      workflowResult.metadata.endTime = new Date();
      workflowResult.metadata.duration = workflowResult.metadata.endTime.getTime() - startTime.getTime();
      
      // Update performance metrics
      this.updatePerformanceMetrics(true, workflowResult.metadata.duration || 0);
      
      return workflowResult;
      
    } catch (error) {
      // Handle workflow failure
      workflowResult.status = 'failed';
      workflowResult.metadata.errors = workflowResult.metadata.errors || [];
      workflowResult.metadata.errors.push(error instanceof Error ? error.message : 'Unknown error');
      workflowResult.metadata.endTime = new Date();
      workflowResult.metadata.duration = workflowResult.metadata.endTime.getTime() - startTime.getTime();
      
      // Update performance metrics
      this.updatePerformanceMetrics(false, workflowResult.metadata.duration || 0);
      
      // Apply fallback strategy
      if (this.config.fallbackStrategy !== 'aggressive') {
        await this.applyFallbackStrategy(workflowResult, request);
      }
      
      return workflowResult;
    }
  }

  /**
   * Get workflow status and results
   */
  getWorkflowStatus(workflowId: string): WorkflowResult | null {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Cancel a running workflow
   */
  async cancelWorkflow(workflowId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return { success: false, message: 'Workflow not found' };
    }
    
    if (workflow.status === 'running') {
      workflow.status = 'cancelled';
      workflow.metadata.endTime = new Date();
      return { success: true, message: 'Workflow cancelled successfully' };
    }
    
    return { success: false, message: 'Workflow cannot be cancelled in current state' };
  }

  /**
   * Get service health status
   */
  getServiceHealth(): ServiceHealth[] {
    return Array.from(this.serviceHealth.values());
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update orchestration configuration
   */
  updateConfig(newConfig: Partial<OrchestrationConfig>): Promise<{
    success: boolean;
    message: string;
    previousConfig: OrchestrationConfig;
  }> {
    try {
      const previousConfig = { ...this.config };
      this.config = { ...this.config, ...newConfig };
      
      // Reinitialize services if needed
      if (newConfig.enableSemanticSearch !== undefined || 
          newConfig.enablePredictiveAnalytics !== undefined ||
          newConfig.enableAdvancedAssessment !== undefined ||
          newConfig.enableMachineLearning !== undefined) {
        this.initializeServices();
      }
      
      return Promise.resolve({
        success: true,
        message: 'Configuration updated successfully',
        previousConfig
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Failed to update configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        previousConfig: this.config
      });
    }
  }

  /**
   * Clear cache
   */
  clearCache(): Promise<{
    success: boolean;
    message: string;
    clearedEntries: number;
  }> {
    try {
      const clearedEntries = this.cache.size;
      this.cache.clear();
      
      return Promise.resolve({
        success: true,
        message: 'Cache cleared successfully',
        clearedEntries
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
        clearedEntries: 0
      });
    }
  }

  // Private methods for workflow execution
  private async executeComprehensiveAssessment(
    workflowResult: WorkflowResult,
    candidate: any,
    job: any,
    config?: any
  ): Promise<void> {
    const services: Promise<any>[] = [];
    
    // Role alignment
    if (this.config.enableSemanticSearch) {
      services.push(this.executeWithFallback(
        () => this.aiAgent.calculateRoleAlignment(candidate, job, config),
        'roleAlignment'
      ));
    }
    
    // Skills gap analysis
    services.push(this.executeWithFallback(
      () => this.aiAgent.analyzeSkillsGap(candidate, job, config),
      'skillsGap'
    ));
    
    // Interview questions
    services.push(this.executeWithFallback(
      () => this.aiAgent.generateCategorizedInterviewQuestions(candidate, job, config),
      'interviewQuestions'
    ));
    
    // Cultural fit
    services.push(this.executeWithFallback(
      () => this.aiAgent.assessCulturalFit(candidate, job, config),
      'culturalFit'
    ));
    
          // Semantic analysis
      if (this.config.enableSemanticSearch) {
        services.push(this.executeWithFallback(
          async () => this.semanticSearch.analyzeSkills(candidate.skills || [], job.parsedData?.skills || []),
          'semanticAnalysis'
        ));
      }
      
      // Predictive analytics
      if (this.config.enablePredictiveAnalytics) {
        services.push(this.executeWithFallback(
          async () => this.predictiveAnalytics.predictCandidateSuccess(candidate, job, {
            salaryRange: { min: 80000, median: 120000, max: 200000, currency: 'USD' },
            skillsDemand: [],
            marketRate: 120000,
            competitorAnalysis: []
          }),
          'predictiveAnalytics'
        ));
      }
      
      // Advanced assessment
      if (this.config.enableAdvancedAssessment) {
        services.push(this.executeWithFallback(
          async () => this.advancedAssessment.performComprehensiveAssessment(candidate, job),
          'advancedAssessment'
        ));
      }
    
    // Machine learning prediction
    if (this.config.enableMachineLearning) {
      services.push(this.executeWithFallback(
        () => this.machineLearning.predictCandidateSuccess(candidate, job),
        'machineLearning'
      ));
    }
    
    // Execute all services
    const results = await Promise.allSettled(services);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const serviceName = Object.keys(workflowResult.results)[index];
        if (serviceName) {
          workflowResult.results[serviceName as keyof typeof workflowResult.results] = result.value;
        }
      } else {
        workflowResult.metadata.errors = workflowResult.metadata.errors || [];
        workflowResult.metadata.errors.push(`Service ${index} failed: ${result.reason}`);
      }
    });
    
    workflowResult.progress = 80;
  }

  private async executeQuickEvaluation(
    workflowResult: WorkflowResult,
    candidate: any,
    job: any,
    config?: any
  ): Promise<void> {
    // Quick evaluation focuses on essential assessments
    const services: Promise<any>[] = [];
    
    // Basic role alignment
    services.push(this.executeWithFallback(
      () => this.aiAgent.calculateRoleAlignment(candidate, job, config),
      'roleAlignment'
    ));
    
    // Basic skills gap
    services.push(this.executeWithFallback(
      () => this.aiAgent.analyzeSkillsGap(candidate, job, config),
      'skillsGap'
    ));
    
    // Execute services
    const results = await Promise.allSettled(services);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const serviceName = Object.keys(workflowResult.results)[index];
        if (serviceName) {
          workflowResult.results[serviceName as keyof typeof workflowResult.results] = result.value;
        }
      }
    });
    
    workflowResult.progress = 80;
  }

  private async executeLeadershipAssessment(
    workflowResult: WorkflowResult,
    candidate: any,
    job: any,
    config?: any
  ): Promise<void> {
    // Leadership assessment focuses on leadership potential
    const services: Promise<any>[] = [];
    
          // Advanced assessment with leadership focus
      if (this.config.enableAdvancedAssessment) {
        services.push(this.executeWithFallback(
          async () => this.advancedAssessment.performComprehensiveAssessment(candidate, job),
          'advancedAssessment'
        ));
      }
    
    // Cultural fit assessment
    services.push(this.executeWithFallback(
      () => this.aiAgent.assessCulturalFit(candidate, job, { ...config, focus: 'leadership' }),
      'culturalFit'
    ));
    
    // Execute services
    const results = await Promise.allSettled(services);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const serviceName = Object.keys(workflowResult.results)[index];
        if (serviceName) {
          workflowResult.results[serviceName as keyof typeof workflowResult.results] = result.value;
        }
      }
    });
    
    workflowResult.progress = 80;
  }

  private async executeTechnicalDeepDive(
    workflowResult: WorkflowResult,
    candidate: any,
    job: any,
    config?: any
  ): Promise<void> {
    // Technical deep dive focuses on technical capabilities
    const services: Promise<any>[] = [];
    
          // Advanced technical assessment
      if (this.config.enableAdvancedAssessment) {
        services.push(this.executeWithFallback(
          async () => this.advancedAssessment.performComprehensiveAssessment(candidate, job),
          'advancedAssessment'
        ));
      }
    
    // Technical skills gap analysis
    services.push(this.executeWithFallback(
      () => this.aiAgent.analyzeSkillsGap(candidate, job, { ...config, focus: 'technical' }),
      'skillsGap'
    ));
    
    // Technical interview questions
    services.push(this.executeWithFallback(
      () => this.aiAgent.generateInterviewQuestions(candidate, job, { ...config, focus: 'technical' }),
      'interviewQuestions'
    ));
    
    // Execute services
    const results = await Promise.allSettled(services);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const serviceName = Object.keys(workflowResult.results)[index];
        if (serviceName) {
          workflowResult.results[serviceName as keyof typeof workflowResult.results] = result.value;
        }
      }
    });
    
    workflowResult.progress = 80;
  }

  private async executeWithFallback<T>(
    serviceCall: () => Promise<T>,
    serviceName: string
  ): Promise<T> {
    try {
      const result = await Promise.race([
        serviceCall(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Service timeout')), this.config.timeoutMs)
        )
      ]);
      
      // Update service health
      this.updateServiceHealth(serviceName, 'healthy', 0, 0);
      
      return result;
    } catch (error) {
      // Update service health
      this.updateServiceHealth(serviceName, 'degraded', 0, 1);
      
      // Apply fallback based on strategy
      if (this.config.fallbackStrategy === 'conservative') {
        throw error;
      }
      
      // Return fallback data
      return this.getFallbackData(serviceName) as T;
    }
  }

  private async generateWorkflowSummary(workflowResult: WorkflowResult): Promise<void> {
    try {
      // Calculate overall score
      const scores: number[] = [];
      let totalConfidence = 0;
      let confidenceCount = 0;
      
      // Extract scores from results
      if (workflowResult.results.roleAlignment?.data?.overallScore) {
        scores.push(workflowResult.results.roleAlignment.data.overallScore);
      }
      if (workflowResult.results.skillsGap?.data) {
        // Calculate skills gap score
        const skillsScore = this.calculateSkillsGapScore(workflowResult.results.skillsGap.data);
        scores.push(skillsScore);
      }
      if (workflowResult.results.culturalFit?.data?.fitScore) {
        scores.push(workflowResult.results.culturalFit.data.fitScore);
      }
      if (workflowResult.results.advancedAssessment?.overallScore) {
        scores.push(workflowResult.results.advancedAssessment.overallScore);
      }
      if (workflowResult.results.machineLearning?.successProbability) {
        scores.push(workflowResult.results.machineLearning.successProbability * 100);
      }
      
      // Calculate overall score
      const overallScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      
      // Calculate confidence
      if (workflowResult.results.roleAlignment?.confidence) {
        totalConfidence += workflowResult.results.roleAlignment.confidence;
        confidenceCount++;
      }
      if (workflowResult.results.machineLearning?.confidence) {
        totalConfidence += workflowResult.results.machineLearning.confidence;
        confidenceCount++;
      }
      
      const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0.5;
      
      // Determine risk level
      const riskLevel = this.determineRiskLevel(overallScore, averageConfidence);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(workflowResult.results);
      
      // Generate next steps
      const nextSteps = this.generateNextSteps(workflowResult.results, overallScore, riskLevel);
      
      // Update summary
      workflowResult.summary = {
        overallScore: Math.round(overallScore),
        confidence: Math.round(averageConfidence * 100),
        riskLevel,
        recommendations,
        nextSteps
      };
      
    } catch (error) {
      console.error('Error generating workflow summary:', error);
      // Set default summary
      workflowResult.summary = {
        overallScore: 0,
        confidence: 0,
        riskLevel: 'high',
        recommendations: ['Unable to generate recommendations'],
        nextSteps: ['Review results manually']
      };
    }
  }

  private async applyFallbackStrategy(
    workflowResult: WorkflowResult,
    request: WorkflowRequest
  ): Promise<void> {
    try {
      // Apply fallback based on configuration
      if (this.config.fallbackStrategy === 'graceful') {
        // Generate basic fallback results
        workflowResult.results.roleAlignment = {
          ok: true,
          data: {
            overallScore: 50,
            technicalScore: 50,
            experienceScore: 50,
            skillsScore: 50,
            culturalFitScore: 50,
            detailedBreakdown: 'Fallback analysis due to service unavailability',
            recommendations: ['Review candidate manually', 'Conduct additional interviews'],
            interviewQuestions: ['Tell me about your experience', 'What are your career goals?'],
            riskFactors: ['Limited AI analysis available'],
            trainingNeeds: ['Manual assessment required']
          }
        };
        
        workflowResult.summary = {
          overallScore: 50,
          confidence: 30,
          riskLevel: 'high',
          recommendations: ['Use fallback analysis', 'Conduct manual review'],
          nextSteps: ['Schedule manual interview', 'Review candidate documentation']
        };
      }
      
    } catch (error) {
      console.error('Error applying fallback strategy:', error);
    }
  }

  // Utility methods
  private initializeServices(): void {
    try {
      this.aiAgent = new AIAgent();
      this.semanticSearch = new SemanticSearchService();
      this.predictiveAnalytics = new PredictiveAnalyticsService();
      this.advancedAssessment = new AdvancedAssessmentEngine();
      this.machineLearning = new MachineLearningService();
      
      console.log('AI services initialized successfully');
    } catch (error) {
      console.error('Error initializing AI services:', error);
    }
  }

  private initializePerformanceMetrics(): void {
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      cacheHitRate: 0,
      serviceUtilization: {}
    };
  }

  private startHealthMonitoring(): void {
    // Monitor service health every 30 seconds
    setInterval(() => {
      this.checkServiceHealth();
    }, 30000);
  }

  private async checkServiceHealth(): Promise<void> {
    const services = [
      { name: 'aiAgent', service: this.aiAgent },
      { name: 'semanticSearch', service: this.semanticSearch },
      { name: 'predictiveAnalytics', service: this.predictiveAnalytics },
      { name: 'advancedAssessment', service: this.advancedAssessment },
      { name: 'machineLearning', service: this.machineLearning }
    ];
    
    for (const { name, service } of services) {
      try {
        const startTime = Date.now();
        
        // Simple health check - try to access a property or method
        if (service && typeof service === 'object') {
          const responseTime = Date.now() - startTime;
          this.updateServiceHealth(name, 'healthy', responseTime, 0);
        } else {
          this.updateServiceHealth(name, 'unhealthy', 0, 1);
        }
      } catch (error) {
        this.updateServiceHealth(name, 'unhealthy', 0, 1);
      }
    }
  }

  private updateServiceHealth(
    serviceName: string,
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
    responseTime: number,
    errorCount: number
  ): void {
    const existing = this.serviceHealth.get(serviceName);
    
    if (existing) {
      existing.status = status;
      existing.responseTime = responseTime;
      existing.errorRate = (existing.errorRate + errorCount) / 2;
      existing.lastCheck = new Date();
    } else {
      this.serviceHealth.set(serviceName, {
        service: serviceName,
        status,
        responseTime,
        errorRate: errorCount,
        lastCheck: new Date(),
        details: `Service ${status}`
      });
    }
  }

  private updatePerformanceMetrics(success: boolean, responseTime: number): void {
    this.performanceMetrics.totalRequests++;
    
    if (success) {
      this.performanceMetrics.successfulRequests++;
    } else {
      this.performanceMetrics.failedRequests++;
    }
    
    // Update average response time
    const totalTime = this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalRequests - 1) + responseTime;
    this.performanceMetrics.averageResponseTime = totalTime / this.performanceMetrics.totalRequests;
    
    // Update error rate
    this.performanceMetrics.errorRate = this.performanceMetrics.failedRequests / this.performanceMetrics.totalRequests;
    
    // Update throughput (requests per minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = Array.from(this.workflows.values())
      .filter(w => w.metadata.startTime.getTime() > oneMinuteAgo).length;
    this.performanceMetrics.throughput = recentRequests;
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getCandidateAndJob(candidateId: string, jobId: string): Promise<{
    candidate: any;
    job: any;
  }> {
    // In production, this would fetch from database
    // For now, return mock data
    return {
      candidate: {
        id: candidateId,
        name: 'John Doe',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '5 years',
        location: 'San Francisco'
      },
      job: {
        id: jobId,
        title: 'Senior Software Engineer',
        parsedData: {
          skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
          seniority: 'Senior'
        }
      }
    };
  }

  private getFallbackData(serviceName: string): any {
    const fallbackData: { [key: string]: any } = {
      roleAlignment: {
        ok: true,
        data: {
          overallScore: 50,
          technicalScore: 50,
          experienceScore: 50,
          skillsScore: 50,
          culturalFitScore: 50
        }
      },
      skillsGap: {
        ok: true,
        data: {
          missingSkills: ['Fallback data'],
          skillLevels: {},
          criticalGaps: ['Fallback data']
        }
      },
      interviewQuestions: {
        ok: true,
        data: ['Tell me about your experience', 'What are your career goals?']
      },
      culturalFit: {
        ok: true,
        data: {
          fitScore: 50,
          strengths: ['Fallback data'],
          concerns: ['Limited data available']
        }
      }
    };
    
    return fallbackData[serviceName] || { ok: false, error: 'No fallback data available' };
  }

  private calculateSkillsGapScore(skillsGapData: any): number {
    // Calculate score based on missing skills and critical gaps
    let score = 100;
    
    if (skillsGapData.missingSkills) {
      score -= skillsGapData.missingSkills.length * 10;
    }
    
    if (skillsGapData.criticalGaps) {
      score -= skillsGapData.criticalGaps.length * 20;
    }
    
    return Math.max(0, score);
  }

  private determineRiskLevel(overallScore: number, confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (overallScore >= 80 && confidence >= 0.8) return 'low';
    if (overallScore >= 60 && confidence >= 0.6) return 'medium';
    if (overallScore >= 40 && confidence >= 0.4) return 'high';
    return 'critical';
  }

  private generateRecommendations(results: any): string[] {
    const recommendations: string[] = [];
    
    // Generate recommendations based on results
    if (results.roleAlignment?.data?.overallScore < 70) {
      recommendations.push('Consider additional screening for this candidate');
    }
    
    if (results.skillsGap?.data?.criticalGaps?.length > 0) {
      recommendations.push('Address critical skills gaps before proceeding');
    }
    
    if (results.culturalFit?.data?.fitScore < 60) {
      recommendations.push('Assess cultural fit through additional interviews');
    }
    
    if (results.machineLearning?.successProbability < 0.5) {
      recommendations.push('Consider alternative candidates or additional assessment');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Candidate appears well-qualified for the role');
    }
    
    return recommendations;
  }

  private generateNextSteps(results: any, overallScore: number, riskLevel: string): string[] {
    const nextSteps: string[] = [];
    
    if (riskLevel === 'low') {
      nextSteps.push('Proceed with hiring process');
      nextSteps.push('Schedule onboarding');
    } else if (riskLevel === 'medium') {
      nextSteps.push('Conduct additional interviews');
      nextSteps.push('Verify key skills and experience');
    } else if (riskLevel === 'high') {
      nextSteps.push('Conduct comprehensive assessment');
      nextSteps.push('Consider alternative candidates');
    } else {
      nextSteps.push('Reject candidate');
      nextSteps.push('Continue search for better matches');
    }
    
    // Add specific next steps based on results
    if (results.skillsGap?.data?.missingSkills?.length > 0) {
      nextSteps.push('Develop training plan for missing skills');
    }
    
    if (results.advancedAssessment?.leadership?.potential === 'high') {
      nextSteps.push('Consider leadership development opportunities');
    }
    
    return nextSteps;
  }

  // Cache management
  private getCacheKey(service: string, params: any): string {
    return `${service}_${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    if (!this.config.enableCaching) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttl?: number): void {
    if (!this.config.enableCaching) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTTLMs
    });
  }
}
