/**
 * Structured Logging Utility
 * Provides consistent, structured logging across the application
 * Supports different log levels, correlation IDs, and structured data
 */

import { createLogger, format, transports } from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Custom format for structured logging
const structuredFormat = format.combine(
  format.timestamp({ format: 'ISO' }),
  format.errors({ stack: true }),
  format.json(),
  format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      correlationId: correlationId || 'no-correlation-id',
      ...meta
    };
    
    // Remove undefined values
    Object.keys(logEntry).forEach(key => {
      if (logEntry[key] === undefined) {
        delete logEntry[key];
      }
    });
    
    return JSON.stringify(logEntry);
  })
);

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: structuredFormat,
  defaultMeta: {
    service: 'ai-recruiter-automation',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: structuredFormat
  }));
  
  logger.add(new transports.File({
    filename: 'logs/combined.log',
    format: structuredFormat
  }));
}

/**
 * Logger class with correlation ID support
 */
class Logger {
  constructor(correlationId = null) {
    this.correlationId = correlationId || uuidv4();
    this.startTime = Date.now();
  }

  /**
   * Generate a new correlation ID
   */
  static generateCorrelationId() {
    return uuidv4();
  }

  /**
   * Create a new logger instance with correlation ID
   */
  static withCorrelationId(correlationId) {
    return new Logger(correlationId);
  }

  /**
   * Log info level message
   */
  info(message, meta = {}) {
    logger.info(message, {
      correlationId: this.correlationId,
      ...meta
    });
  }

  /**
   * Log error level message
   */
  error(message, error = null, meta = {}) {
    const errorMeta = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    } : {};
    
    logger.error(message, {
      correlationId: this.correlationId,
      ...errorMeta,
      ...meta
    });
  }

  /**
   * Log warn level message
   */
  warn(message, meta = {}) {
    logger.warn(message, {
      correlationId: this.correlationId,
      ...meta
    });
  }

  /**
   * Log debug level message
   */
  debug(message, meta = {}) {
    logger.debug(message, {
      correlationId: this.correlationId,
      ...meta
    });
  }

  /**
   * Log with performance timing
   */
  time(label, meta = {}) {
    const duration = Date.now() - this.startTime;
    this.info(`${label} completed`, {
      duration,
      durationMs: duration,
      ...meta
    });
  }

  /**
   * Log database operation
   */
  db(operation, table, duration, meta = {}) {
    this.info(`Database operation: ${operation}`, {
      operation,
      table,
      duration,
      durationMs: duration,
      type: 'database',
      ...meta
    });
  }

  /**
   * Log API request
   */
  api(method, path, statusCode, duration, meta = {}) {
    this.info(`API ${method} ${path}`, {
      method,
      path,
      statusCode,
      duration,
      durationMs: duration,
      type: 'api',
      ...meta
    });
  }

  /**
   * Log business event
   */
  business(event, entity, entityId, meta = {}) {
    this.info(`Business event: ${event}`, {
      event,
      entity,
      entityId,
      type: 'business',
      ...meta
    });
  }

  /**
   * Log security event
   */
  security(event, userId, ip, meta = {}) {
    this.warn(`Security event: ${event}`, {
      event,
      userId,
      ip,
      type: 'security',
      ...meta
    });
  }

  /**
   * Log AI/ML operation
   */
  ai(operation, model, duration, meta = {}) {
    this.info(`AI operation: ${operation}`, {
      operation,
      model,
      duration,
      durationMs: duration,
      type: 'ai',
      ...meta
    });
  }

  /**
   * Create child logger with additional context
   */
  child(additionalMeta = {}) {
    const childLogger = new Logger(this.correlationId);
    childLogger.startTime = this.startTime;
    childLogger.additionalMeta = { ...this.additionalMeta, ...additionalMeta };
    return childLogger;
  }
}

// Export both the class and a default instance
export default Logger;
export { logger as winstonLogger };
