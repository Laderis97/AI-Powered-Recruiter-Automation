import { describe, it, expect, beforeEach } from '@jest/globals';
import { databaseService } from '../../src/databaseService.js';

describe('DatabaseService', () => {
  beforeEach(() => {
    // Reset any test state if needed
  });

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      const analytics = await databaseService.getAnalytics();
      
      expect(analytics).toBeDefined();
      expect(analytics).toHaveProperty('totalJobs');
      expect(analytics).toHaveProperty('totalCandidates');
      expect(analytics).toHaveProperty('timeToHire');
      expect(analytics).toHaveProperty('hiringFunnel');
    });
  });

  describe('getAllCandidates', () => {
    it('should return array of candidates', async () => {
      const candidates = await databaseService.getAllCandidates();
      
      expect(Array.isArray(candidates)).toBe(true);
      expect(candidates.length).toBeGreaterThan(0);
      
      if (candidates.length > 0) {
        const candidate = candidates[0];
        expect(candidate).toHaveProperty('id');
        expect(candidate).toHaveProperty('name');
        expect(candidate).toHaveProperty('title');
      }
    });
  });

  describe('getAllJobs', () => {
    it('should return array of jobs', async () => {
      const jobs = await databaseService.getAllJobs();
      
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
      
      if (jobs.length > 0) {
        const job = jobs[0];
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('title');
        expect(job).toHaveProperty('description');
      }
    });
  });
});
