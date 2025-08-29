/**
 * Example tests demonstrating flaky test quarantine patterns
 * These tests show how to handle and quarantine flaky tests
 */

const CandidateAnalyzer = require('../../src/utils/candidate-analyzer');

describe('Flaky Test Examples', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new CandidateAnalyzer();
  });

  // MARK: Flaky Test Examples

  describe('Flaky Tests - Quarantined', () => {
    // This test is known to be flaky and is quarantined
    test.skip('should handle network timeout gracefully - QUARANTINED', async () => {
      // This test simulates a flaky network condition
      const startTime = Date.now();
      
      try {
        // Simulate network call that sometimes times out
        await new Promise((resolve, reject) => {
          const timeout = Math.random() > 0.7 ? 100 : 5000; // 30% chance of timeout
          setTimeout(() => {
            if (timeout === 100) {
              reject(new Error('Network timeout'));
            } else {
              resolve();
            }
          }, timeout);
        });
        
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(1000);
      } catch (error) {
        // Test passes if we get a timeout error (expected flaky behavior)
        expect(error.message).toBe('Network timeout');
      }
    }, 10000); // Extended timeout for flaky test

    // Another flaky test that's quarantined
    test.skip('should handle race condition in skill weight update - QUARANTINED', async () => {
      // This test demonstrates a race condition that makes it flaky
      const promises = [];
      
      // Simulate concurrent updates to skill weights
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              analyzer.updateSkillWeights({ [`Skill${i}`]: i + 1 });
              resolve();
            }, Math.random() * 100); // Random delay
          })
        );
      }
      
      await Promise.all(promises);
      
      // This assertion sometimes fails due to race conditions
      const weights = analyzer.getSkillWeights();
      expect(Object.keys(weights).length).toBeGreaterThan(10);
    });

    // Test that fails intermittently due to timing issues
    test.skip('should complete analysis within time budget - QUARANTINED', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        skills: [`Skill${i % 10}`],
        experience: Math.floor(Math.random() * 10) + 1
      }));
      
      const startTime = Date.now();
      const trends = analyzer.analyzeTrends(largeDataset);
      const duration = Date.now() - startTime;
      
      // This assertion is flaky due to system load variations
      expect(duration).toBeLessThan(100); // Sometimes takes longer
      expect(trends.totalCandidates).toBe(1000);
    });
  });

  describe('Flaky Tests - Retry Pattern', () => {
    // Test with retry logic for flaky behavior
    test('should handle intermittent database connection - RETRY', async () => {
      const maxRetries = 3;
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Simulate database operation that sometimes fails
          const success = Math.random() > 0.3; // 70% success rate
          
          if (!success) {
            throw new Error('Database connection failed');
          }
          
          // If we get here, the operation succeeded
          expect(success).toBe(true);
          return; // Test passed, exit early
          
        } catch (error) {
          lastError = error;
          console.log(`Attempt ${attempt} failed: ${error.message}`);
          
          if (attempt === maxRetries) {
            // Final attempt failed, fail the test
            throw new Error(`Test failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }, 30000); // Extended timeout for retry logic

    // Test with conditional retry based on error type
    test('should retry only on specific error types', async () => {
      const maxRetries = 3;
      let attempts = 0;
      
      const operation = async () => {
        attempts++;
        
        // Simulate different types of errors
        const errorType = Math.random();
        
        if (errorType < 0.3) {
          throw new Error('NETWORK_ERROR');
        } else if (errorType < 0.6) {
          throw new Error('TIMEOUT_ERROR');
        } else if (errorType < 0.8) {
          throw new Error('VALIDATION_ERROR');
        } else {
          return 'SUCCESS';
        }
      };
      
      const result = await retryOnSpecificErrors(operation, ['NETWORK_ERROR', 'TIMEOUT_ERROR'], maxRetries);
      
      expect(result).toBe('SUCCESS');
      expect(attempts).toBeGreaterThan(1); // Should have retried at least once
    });
  });

  describe('Flaky Tests - Stabilization', () => {
    // Test with stabilization techniques
    test('should stabilize flaky timing-dependent operation', async () => {
      const results = [];
      
      // Run the operation multiple times to stabilize results
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        // Simulate operation with variable timing
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        
        const duration = Date.now() - startTime;
        results.push(duration);
        
        // Small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Calculate median to avoid outliers
      const sortedResults = results.sort((a, b) => a - b);
      const median = sortedResults[Math.floor(sortedResults.length / 2)];
      
      // Use median for assertion to stabilize the test
      expect(median).toBeGreaterThan(50);
      expect(median).toBeLessThan(150);
    });

    // Test with state cleanup between iterations
    test('should maintain consistent state across operations', async () => {
      const testResults = [];
      
      for (let i = 0; i < 3; i++) {
        // Reset analyzer state before each iteration
        analyzer = new CandidateAnalyzer();
        
        // Perform operation
        const candidate = {
          skills: ['JavaScript', 'React'],
          experience: 2
        };
        
        const score = analyzer.calculateScore(candidate);
        testResults.push(score);
        
        // Verify state is consistent
        expect(analyzer.getSkillWeights()['JavaScript']).toBe(1.0);
      }
      
      // All results should be identical since we reset state
      const firstResult = testResults[0];
      testResults.forEach(result => {
        expect(result).toBe(firstResult);
      });
    });
  });

  describe('Flaky Tests - Monitoring and Reporting', () => {
    // Test that tracks flaky behavior
    test('should monitor and report flaky behavior patterns', async () => {
      const flakyMetrics = {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageDuration: 0,
        durationVariance: 0
      };
      
      const durations = [];
      
      // Run operation multiple times to collect metrics
      for (let i = 0; i < 10; i++) {
        flakyMetrics.totalRuns++;
        
        try {
          const startTime = Date.now();
          
          // Simulate operation that might fail
          const success = Math.random() > 0.2; // 80% success rate
          
          if (!success) {
            throw new Error('Operation failed');
          }
          
          const duration = Date.now() - startTime;
          durations.push(duration);
          flakyMetrics.successfulRuns++;
          
        } catch (error) {
          flakyMetrics.failedRuns++;
        }
      }
      
      // Calculate metrics
      if (durations.length > 0) {
        flakyMetrics.averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        flakyMetrics.durationVariance = durations.reduce((acc, d) => acc + Math.pow(d - flakyMetrics.averageDuration, 2), 0) / durations.length;
      }
      
      // Log metrics for monitoring
      console.log('Flaky Test Metrics:', JSON.stringify(flakyMetrics, null, 2));
      
      // Assertions based on collected metrics
      expect(flakyMetrics.successfulRuns).toBeGreaterThan(flakyMetrics.failedRuns);
      expect(flakyMetrics.averageDuration).toBeGreaterThan(0);
      
      // If failure rate is too high, mark as potentially flaky
      const failureRate = flakyMetrics.failedRuns / flakyMetrics.totalRuns;
      if (failureRate > 0.3) {
        console.warn('⚠️  High failure rate detected - test may be flaky');
      }
    });
  });
});

// Helper function for retry logic
async function retryOnSpecificErrors(operation, retryableErrors, maxRetries) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if this error is retryable
      const isRetryable = retryableErrors.some(errorType => 
        error.message.includes(errorType)
      );
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
  
  throw lastError;
}

// Test configuration for flaky tests
describe('Flaky Test Configuration', () => {
  // These tests demonstrate different quarantine strategies
  
  test('should run with extended timeout for flaky operations', async () => {
    // This test gets more time to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    expect(true).toBe(true);
  }, 10000); // 10 second timeout
  
  test('should handle resource cleanup properly', async () => {
    // Simulate resource allocation
    const resource = { id: 'test-resource', allocated: true };
    
    try {
      expect(resource.allocated).toBe(true);
    } finally {
      // Always cleanup, even if test fails
      resource.allocated = false;
      expect(resource.allocated).toBe(false);
    }
  });
});

// Test tags for CI/CD pipeline
describe('Test Tags and CI Integration', () => {
  // Tests can be tagged for different CI strategies
  
  test('should run in fast CI pipeline', () => {
    // This test is fast and reliable
    expect(true).toBe(true);
  });
  
  test('should run in full CI pipeline', () => {
    // This test takes longer but is comprehensive
    expect(true).toBe(true);
  });
  
  test('should run in nightly pipeline only', () => {
    // This test is slow and should only run nightly
    expect(true).toBe(true);
  });
});
