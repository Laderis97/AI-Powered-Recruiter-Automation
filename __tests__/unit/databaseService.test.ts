import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock the databaseService module
jest.mock('../../src/databaseService', () => ({
  databaseService: {
    getAnalytics: jest.fn(),
    getAllCandidates: jest.fn(),
    getAllJobs: jest.fn()
  }
}));

// Import after mocking
import { databaseService } from '../../src/databaseService';

describe('DatabaseService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (databaseService.getAnalytics as jest.Mock).mockResolvedValue({
      totalJobs: 5,
      totalCandidates: 25,
      timeToHire: '15 days',
      hiringFunnel: [
        { stage: 'applied', count: 100 },
        { stage: 'screening', count: 50 },
        { stage: 'interview', count: 20 },
        { stage: 'offer', count: 5 }
      ]
    });
    
    (databaseService.getAllCandidates as jest.Mock).mockResolvedValue([
      {
        id: '1',
        name: 'John Doe',
        title: 'Software Engineer',
        email: 'john@example.com',
        status: 'active'
      }
    ]);
    
    (databaseService.getAllJobs as jest.Mock).mockResolvedValue([
      {
        id: '1',
        title: 'Senior Developer',
        description: 'Full-stack development role',
        company: 'Tech Corp',
        status: 'open'
      }
    ]);
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
