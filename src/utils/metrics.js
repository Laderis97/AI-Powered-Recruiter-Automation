/**
 * RED Metrics Utility
 * Provides Request rate, Error rate, and Duration metrics
 * Uses OpenTelemetry metrics for collection
 */

import { metrics, ValueType } from '@opentelemetry/api';
import { Counter, Histogram, ObservableGauge } from '@opentelemetry/sdk-metrics';

// Get meter instance
const meter = metrics.getMeter('ai-recruiter-automation');

// Request rate metrics
export const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
  unit: 'requests',
});

// Error rate metrics
export const errorCounter = meter.createCounter('http_errors_total', {
  description: 'Total number of HTTP errors',
  unit: 'errors',
});

// Duration metrics
export const requestDuration = meter.createHistogram('http_request_duration_seconds', {
  description: 'HTTP request duration in seconds',
  unit: 'seconds',
  valueType: ValueType.DOUBLE,
});

// Business metrics
export const candidateCounter = meter.createCounter('candidates_processed_total', {
  description: 'Total number of candidates processed',
  unit: 'candidates',
});

export const jobCounter = meter.createCounter('jobs_processed_total', {
  description: 'Total number of jobs processed',
  unit: 'jobs',
});

export const aiOperationCounter = meter.createCounter('ai_operations_total', {
  description: 'Total number of AI operations',
  unit: 'operations',
});

export const aiOperationDuration = meter.createHistogram('ai_operation_duration_seconds', {
  description: 'AI operation duration in seconds',
  unit: 'seconds',
  valueType: ValueType.DOUBLE,
});

// Database metrics
export const dbOperationCounter = meter.createCounter('database_operations_total', {
  description: 'Total number of database operations',
  unit: 'operations',
});

export const dbOperationDuration = meter.createHistogram('database_operation_duration_seconds', {
  description: 'Database operation duration in seconds',
  unit: 'seconds',
  valueType: ValueType.DOUBLE,
});

// System metrics
export const memoryUsage = meter.createObservableGauge('process_memory_usage_bytes', {
  description: 'Process memory usage in bytes',
  unit: 'bytes',
});

export const cpuUsage = meter.createObservableGauge('process_cpu_usage_percent', {
  description: 'Process CPU usage percentage',
  unit: 'percent',
});

// Register system metrics
meter.addBatchObservableCallback((result) => {
  const memUsage = process.memoryUsage();
  const cpuUsagePercent = process.cpuUsage();
  
  result.observe(memoryUsage, {
    type: 'rss',
    value: memUsage.rss,
  });
  
  result.observe(memoryUsage, {
    type: 'heapUsed',
    value: memUsage.heapUsed,
  });
  
  result.observe(memoryUsage, {
    type: 'heapTotal',
    value: memUsage.heapTotal,
  });
  
  result.observe(memoryUsage, {
    type: 'external',
    value: memUsage.external,
  });
  
  // Calculate CPU usage over time (simplified)
  result.observe(cpuUsage, {
    type: 'user',
    value: cpuUsagePercent.user / 1000000, // Convert to seconds
  });
  
  result.observe(cpuUsage, {
    type: 'system',
    value: cpuUsagePercent.system / 1000000, // Convert to seconds
  });
});

/**
 * Metrics middleware for Express
 */
export function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Record request
  requestCounter.add(1, {
    method: req.method,
    path: req.route?.path || req.path,
    status: res.statusCode,
    user_agent: req.get('User-Agent'),
  });
  
  // Record response
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    
    // Record duration
    requestDuration.record(duration, {
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode,
    });
    
    // Record errors
    if (res.statusCode >= 400) {
      errorCounter.add(1, {
        method: req.method,
        path: req.route?.path || req.path,
        status: res.statusCode,
        error_type: res.statusCode >= 500 ? 'server_error' : 'client_error',
      });
    }
  });
  
  next();
}

/**
 * Business metrics helpers
 */
export const businessMetrics = {
  /**
   * Record candidate processing
   */
  recordCandidateProcessed(operation, success = true, duration = null) {
    candidateCounter.add(1, {
      operation,
      success: success.toString(),
    });
    
    if (duration !== null) {
      // Record duration if provided
      const durationSeconds = typeof duration === 'number' ? duration / 1000 : duration;
      // Note: We'd need a separate histogram for candidate operations
    }
  },
  
  /**
   * Record job processing
   */
  recordJobProcessed(operation, success = true, duration = null) {
    jobCounter.add(1, {
      operation,
      success: success.toString(),
    });
  },
  
  /**
   * Record AI operation
   */
  recordAIOperation(operation, model, success = true, duration = null) {
    aiOperationCounter.add(1, {
      operation,
      model,
      success: success.toString(),
    });
    
    if (duration !== null) {
      const durationSeconds = typeof duration === 'number' ? duration / 1000 : duration;
      aiOperationDuration.record(durationSeconds, {
        operation,
        model,
        success: success.toString(),
      });
    }
  },
  
  /**
   * Record database operation
   */
  recordDBOperation(operation, table, success = true, duration = null) {
    dbOperationCounter.add(1, {
      operation,
      table,
      success: success.toString(),
    });
    
    if (duration !== null) {
      const durationSeconds = typeof duration === 'number' ? duration / 1000 : duration;
      dbOperationDuration.record(durationSeconds, {
        operation,
        table,
        success: success.toString(),
      });
    }
  },
};

/**
 * Performance monitoring decorator
 */
export function withMetrics(operation, category = 'business') {
  return function(target, propertyName, descriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(...args) {
      const startTime = Date.now();
      let success = true;
      
      try {
        const result = await method.apply(this, args);
        return result;
      } catch (error) {
        success = false;
        throw error;
      } finally {
        const duration = Date.now() - startTime;
        
        switch (category) {
          case 'ai':
            businessMetrics.recordAIOperation(operation, 'unknown', success, duration);
            break;
          case 'database':
            businessMetrics.recordDBOperation(operation, 'unknown', success, duration);
            break;
          case 'candidate':
            businessMetrics.recordCandidateProcessed(operation, success, duration);
            break;
          case 'job':
            businessMetrics.recordJobProcessed(operation, success, duration);
            break;
          default:
            businessMetrics.recordAIOperation(operation, 'unknown', success, duration);
        }
      }
    };
    
    return descriptor;
  };
}

export default {
  requestCounter,
  errorCounter,
  requestDuration,
  businessMetrics,
  metricsMiddleware,
  withMetrics,
};
