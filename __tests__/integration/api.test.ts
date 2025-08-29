import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { app } from '../../src/server';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test server if needed
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('GET /api/analytics', () => {
    it('should return analytics data', async () => {
      const response = await request(app)
        .get('/api/analytics')
        .expect(200);

      expect(response.body).toHaveProperty('totalJobs');
      expect(response.body).toHaveProperty('totalCandidates');
      expect(response.body).toHaveProperty('totalHires');
      expect(response.body).toHaveProperty('timeToHire');
    });
  });

  describe('GET /api/candidates', () => {
    it('should return candidates list', async () => {
      const response = await request(app)
        .get('/api/candidates')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/jobs', () => {
    it('should return jobs list', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});
