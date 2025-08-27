import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/server.js';

describe('Dashboard E2E Tests', () => {
  beforeAll(async () => {
    // Setup test environment
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('Dashboard Page', () => {
    it('should load the modern dashboard', async () => {
      const response = await request(app)
        .get('/modern')
        .expect(200);

      expect(response.text).toContain('AI-Powered Recruiter');
      expect(response.text).toContain('modern-dashboard');
    });
  });

  describe('API Endpoints', () => {
    it('should return analytics data for dashboard', async () => {
      const response = await request(app)
        .get('/api/analytics')
        .expect(200);

      expect(response.body).toHaveProperty('totalJobs');
      expect(response.body).toHaveProperty('totalCandidates');
      expect(response.body).toHaveProperty('totalHires');
    });

    it('should return candidates for dashboard', async () => {
      const response = await request(app)
        .get('/api/candidates')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return jobs for dashboard', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
