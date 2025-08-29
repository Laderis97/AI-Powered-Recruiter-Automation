/**
 * Observability Integration Example
 * Shows how to integrate logging, tracing, and metrics into your application
 */

import Logger from './logger.js';
import { businessMetrics, withMetrics } from './metrics.js';
import { trace } from '@opentelemetry/api';

// Example service class with observability integration
class CandidateService {
  constructor() {
    this.logger = new Logger();
  }

  /**
   * Example method with metrics decorator
   */
  @withMetrics('analyze_candidate', 'ai')
  async analyzeCandidate(candidate) {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting candidate analysis', {
        candidateId: candidate.id,
        operation: 'analyze_candidate'
      });

      // Create custom span for business logic
      const tracer = trace.getTracer('ai-recruiter-automation');
      const span = tracer.startSpan('analyze_candidate_resume');
      
      try {
        // Simulate AI analysis
        const analysis = await this.performAIAnalysis(candidate);
        
        // Record successful operation
        businessMetrics.recordAIOperation('analyze_candidate', 'gpt-4', true);
        
        span.setStatus({ code: 1 }); // OK
        span.setAttributes({
          'candidate.id': candidate.id,
          'ai.model': 'gpt-4',
          'analysis.score': analysis.score
        });
        
        this.logger.info('Candidate analysis completed', {
          candidateId: candidate.id,
          score: analysis.score,
          duration: Date.now() - startTime
        });
        
        return analysis;
      } finally {
        span.end();
      }
      
    } catch (error) {
      // Record failed operation
      businessMetrics.recordAIOperation('analyze_candidate', 'gpt-4', false);
      
      this.logger.error('Candidate analysis failed', error, {
        candidateId: candidate.id,
        duration: Date.now() - startTime
      });
      
      throw error;
    }
  }

  /**
   * Example method with manual metrics recording
   */
  async createCandidate(candidateData) {
    const startTime = Date.now();
    
    try {
      this.logger.info('Creating new candidate', {
        email: candidateData.email,
        operation: 'create_candidate'
      });

      // Simulate database operation
      const candidate = await this.saveToDatabase(candidateData);
      
      // Record successful operation
      businessMetrics.recordCandidateProcessed('create', true, Date.now() - startTime);
      
      this.logger.info('Candidate created successfully', {
        candidateId: candidate.id,
        duration: Date.now() - startTime
      });
      
      return candidate;
      
    } catch (error) {
      // Record failed operation
      businessMetrics.recordCandidateProcessed('create', false, Date.now() - startTime);
      
      this.logger.error('Failed to create candidate', error, {
        email: candidateData.email,
        duration: Date.now() - startTime
      });
      
      throw error;
    }
  }

  /**
   * Example method showing correlation ID propagation
   */
  async processCandidateWorkflow(candidateId, correlationId) {
    // Create logger with correlation ID
    const logger = Logger.withCorrelationId(correlationId);
    
    logger.info('Starting candidate workflow', {
      candidateId,
      workflow: 'recruitment_pipeline'
    });

    try {
      // Process through different stages
      await this.screenCandidate(candidateId, logger);
      await this.interviewCandidate(candidateId, logger);
      await this.makeDecision(candidateId, logger);
      
      logger.info('Candidate workflow completed', {
        candidateId,
        workflow: 'recruitment_pipeline'
      });
      
    } catch (error) {
      logger.error('Candidate workflow failed', error, {
        candidateId,
        workflow: 'recruitment_pipeline'
      });
      
      throw error;
    }
  }

  // Helper methods (simulated)
  async performAIAnalysis(candidate) {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    return { score: Math.floor(Math.random() * 100) + 1 };
  }

  async saveToDatabase(candidateData) {
    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    return { id: 'candidate-' + Date.now(), ...candidateData };
  }

  async screenCandidate(candidateId, logger) {
    logger.info('Screening candidate', { candidateId, stage: 'screening' });
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  async interviewCandidate(candidateId, logger) {
    logger.info('Interviewing candidate', { candidateId, stage: 'interview' });
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async makeDecision(candidateId, logger) {
    logger.info('Making decision on candidate', { candidateId, stage: 'decision' });
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Example middleware integration
export function observabilityMiddleware(req, res, next) {
  // Generate correlation ID for the request
  const correlationId = Logger.generateCorrelationId();
  
  // Create logger with correlation ID
  const logger = Logger.withCorrelationId(correlationId);
  
  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Log request start
  logger.info('Request started', {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - req.startTime
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  // Add start time to request
  req.startTime = Date.now();
  
  next();
}

// Example Express route integration
export function setupObservabilityRoutes(app) {
  // Add observability middleware
  app.use(observabilityMiddleware);
  
  // Add metrics endpoint (if Prometheus is configured)
  app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.end('# Metrics endpoint - configure Prometheus to scrape this endpoint');
  });
  
  // Add health check routes
  import('./routes/health.js').then(healthRouter => {
    app.use('/health', healthRouter.default);
  });
}

// Example usage in main application
export function initializeObservability() {
  // Initialize OpenTelemetry
  import('./telemetry.js').then(({ initializeTelemetry }) => {
    const sdk = initializeTelemetry();
    if (sdk) {
      console.log('✅ Observability initialized successfully');
    }
  });
  
  // Set up logging
  const logger = new Logger();
  logger.info('Observability system starting up', {
    environment: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL || 'info'
  });
}

export default {
  CandidateService,
  observabilityMiddleware,
  setupObservabilityRoutes,
  initializeObservability
};
