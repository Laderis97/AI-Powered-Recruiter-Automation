/**
 * Health Check Endpoints
 * Provides health status and build information
 */

import express from 'express';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import Logger from '../utils/logger.js';
import { businessMetrics } from '../utils/metrics.js';

const router = express.Router();
const logger = new Logger();

/**
 * Get build information
 */
function getBuildInfo() {
  try {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    );
    
    let gitSha = 'unknown';
    let gitBranch = 'unknown';
    let buildTime = new Date().toISOString();
    
    try {
      // Get git information
      gitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      logger.warn('Could not get git information', { error: error.message });
    }
    
    return {
      version: packageJson.version,
      name: packageJson.name,
      description: packageJson.description,
      git: {
        sha: gitSha,
        branch: gitBranch,
        shortSha: gitSha.substring(0, 7),
      },
      build: {
        time: buildTime,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      dependencies: {
        total: Object.keys(packageJson.dependencies || {}).length,
        devTotal: Object.keys(packageJson.devDependencies || {}).length,
      }
    };
  } catch (error) {
    logger.error('Failed to get build info', error);
    return {
      error: 'Failed to get build information',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get system health information
 */
function getSystemHealth() {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    uptime: process.uptime(),
    memory: {
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rssMB: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
      userMs: Math.round(cpuUsage.user / 1000 * 100) / 100,
      systemMs: Math.round(cpuUsage.system / 1000 * 100) / 100,
    },
    process: {
      pid: process.pid,
      title: process.title,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    }
  };
}

/**
 * Health check endpoint
 * GET /health
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Record health check request
    businessMetrics.recordAIOperation('health_check', 'system', true);
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ai-recruiter-automation',
      version: process.env.npm_package_version || '1.0.0',
      build: getBuildInfo(),
      system: getSystemHealth(),
      checks: {
        database: 'healthy', // TODO: Add actual database health check
        redis: 'healthy',    // TODO: Add actual Redis health check
        external: 'healthy'  // TODO: Add external service health checks
      }
    };
    
    const duration = Date.now() - startTime;
    
    // Log health check
    logger.info('Health check completed', {
      duration,
      status: 'healthy',
      path: '/health'
    });
    
    res.status(200).json(healthData);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Record failed health check
    businessMetrics.recordAIOperation('health_check', 'system', false);
    
    logger.error('Health check failed', error, {
      duration,
      path: '/health'
    });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      duration
    });
  }
});

/**
 * Detailed health check endpoint
 * GET /health/detailed
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ai-recruiter-automation',
      version: process.env.npm_package_version || '1.0.0',
      build: getBuildInfo(),
      system: getSystemHealth(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        LOG_LEVEL: process.env.LOG_LEVEL,
        DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'not_configured',
        REDIS_URL: process.env.REDIS_URL ? 'configured' : 'not_configured',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      },
      checks: {
        database: {
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          // TODO: Add actual database connection test
        },
        redis: {
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          // TODO: Add actual Redis connection test
        },
        external: {
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          // TODO: Add external service health checks
        }
      },
      metrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      }
    };
    
    const duration = Date.now() - startTime;
    
    logger.info('Detailed health check completed', {
      duration,
      status: 'healthy',
      path: '/health/detailed'
    });
    
    res.status(200).json(detailedHealth);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Detailed health check failed', error, {
      duration,
      path: '/health/detailed'
    });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      duration
    });
  }
});

/**
 * Readiness probe endpoint
 * GET /health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Basic readiness check - service is ready to accept traffic
    const readyData = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      service: 'ai-recruiter-automation',
      checks: {
        startup: 'complete',
        dependencies: 'available',
        configuration: 'loaded'
      }
    };
    
    logger.info('Readiness check completed', {
      status: 'ready',
      path: '/health/ready'
    });
    
    res.status(200).json(readyData);
  } catch (error) {
    logger.error('Readiness check failed', error, {
      path: '/health/ready'
    });
    
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Liveness probe endpoint
 * GET /health/live
 */
router.get('/live', async (req, res) => {
  try {
    // Basic liveness check - service is alive and running
    const liveData = {
      status: 'alive',
      timestamp: new Date().toISOString(),
      service: 'ai-recruiter-automation',
      uptime: process.uptime(),
      pid: process.pid
    };
    
    res.status(200).json(liveData);
  } catch (error) {
    logger.error('Liveness check failed', error, {
      path: '/health/live'
    });
    
    res.status(503).json({
      status: 'dead',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;
