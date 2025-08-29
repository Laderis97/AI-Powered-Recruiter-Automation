/**
 * Unit tests for CandidateAnalyzer
 * Tests core functionality, edge cases, and error handling
 */

const CandidateAnalyzer = require('../../src/utils/candidate-analyzer');

describe('CandidateAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new CandidateAnalyzer();
  });

  describe('Constructor', () => {
    test('should initialize with default skill weights', () => {
      expect(analyzer.skillWeights).toBeDefined();
      expect(analyzer.skillWeights['JavaScript']).toBe(1.0);
      expect(analyzer.skillWeights['Machine Learning']).toBe(1.5);
    });

    test('should set default multipliers and base score', () => {
      expect(analyzer.experienceMultiplier).toBe(0.1);
      expect(analyzer.baseScore).toBe(50);
    });
  });

  describe('calculateScore', () => {
    test('should calculate score for candidate with basic skills', () => {
      const candidate = {
        skills: ['JavaScript', 'React'],
        experience: 2
      };

      const score = analyzer.calculateScore(candidate);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should calculate higher score for candidate with valuable skills', () => {
      const candidate1 = {
        skills: ['JavaScript', 'React'],
        experience: 2
      };

      const candidate2 = {
        skills: ['Machine Learning', 'AWS', 'Kubernetes'],
        experience: 5
      };

      const score1 = analyzer.calculateScore(candidate1);
      const score2 = analyzer.calculateScore(candidate2);

      expect(score2).toBeGreaterThan(score1);
    });

    test('should handle experience bonus correctly', () => {
      const candidate1 = {
        skills: ['JavaScript'],
        experience: 1
      };

      const candidate2 = {
        skills: ['JavaScript'],
        experience: 10
      };

      const score1 = analyzer.calculateScore(candidate1);
      const score2 = analyzer.calculateScore(candidate2);

      expect(score2).toBeGreaterThan(score1);
    });

    test('should cap score at 100', () => {
      const candidate = {
        skills: ['Machine Learning', 'AWS', 'Kubernetes', 'Docker'],
        experience: 20
      };

      const score = analyzer.calculateScore(candidate);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should throw error for invalid candidate data', () => {
      expect(() => analyzer.calculateScore(null)).toThrow('Invalid candidate data: skills array required');
      expect(() => analyzer.calculateScore({})).toThrow('Invalid candidate data: skills array required');
      expect(() => analyzer.calculateScore({ skills: 'not an array' })).toThrow('Invalid candidate data: skills array required');
    });

    test('should throw error for invalid experience', () => {
      const candidate = {
        skills: ['JavaScript'],
        experience: -1
      };

      expect(() => analyzer.calculateScore(candidate)).toThrow('Invalid candidate data: experience must be a positive number');
    });

    test('should handle unknown skills with default weight', () => {
      const candidate = {
        skills: ['UnknownSkill', 'JavaScript'],
        experience: 1
      };

      const score = analyzer.calculateScore(candidate);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('matchCandidateToJob', () => {
    const candidate = {
      id: 'candidate-1',
      skills: ['JavaScript', 'Node.js', 'React'],
      experience: 3
    };

    const job = {
      id: 'job-1',
      requirements: ['JavaScript', 'Node.js', 'TypeScript']
    };

    test('should match candidate to job requirements', () => {
      const match = analyzer.matchCandidateToJob(candidate, job);

      expect(match.candidateId).toBe('candidate-1');
      expect(match.jobId).toBe('job-1');
      expect(match.matchScore).toBeGreaterThan(0);
      expect(match.matchPercentage).toBeGreaterThan(0);
      expect(match.matchingSkills).toContain('javascript');
      expect(match.missingSkills).toContain('typescript');
    });

    test('should calculate match percentage correctly', () => {
      const match = analyzer.matchCandidateToJob(candidate, job);
      // 2 out of 3 skills match = 66.67%
      expect(match.matchPercentage).toBeCloseTo(66.67, 1);
    });

    test('should throw error for missing parameters', () => {
      expect(() => analyzer.matchCandidateToJob(null, job)).toThrow('Both candidate and job are required');
      expect(() => analyzer.matchCandidateToJob(candidate, null)).toThrow('Both candidate and job are required');
    });

    test('should throw error for invalid job requirements', () => {
      const invalidJob = { id: 'job-1' };
      expect(() => analyzer.matchCandidateToJob(candidate, invalidJob)).toThrow('Job requirements array is required');
    });

    test('should handle case-insensitive skill matching', () => {
      const candidateWithCase = {
        id: 'candidate-2',
        skills: ['JAVASCRIPT', 'NODE.JS'],
        experience: 2
      };

      const match = analyzer.matchCandidateToJob(candidateWithCase, job);
      expect(match.matchingSkills).toContain('javascript');
      expect(match.matchingSkills).toContain('node.js');
    });
  });

  describe('getRecommendation', () => {
    test('should return correct recommendations for different scores', () => {
      expect(analyzer.getRecommendation(95)).toBe('Strong Hire');
      expect(analyzer.getRecommendation(85)).toBe('Hire');
      expect(analyzer.getRecommendation(75)).toBe('Consider');
      expect(analyzer.getRecommendation(65)).toBe('Maybe');
      expect(analyzer.getRecommendation(55)).toBe('Unlikely');
      expect(analyzer.getRecommendation(45)).toBe('Not Recommended');
    });

    test('should handle boundary scores', () => {
      expect(analyzer.getRecommendation(90)).toBe('Strong Hire');
      expect(analyzer.getRecommendation(80)).toBe('Hire');
      expect(analyzer.getRecommendation(70)).toBe('Consider');
      expect(analyzer.getRecommendation(60)).toBe('Maybe');
      expect(analyzer.getRecommendation(50)).toBe('Unlikely');
    });
  });

  describe('analyzeTrends', () => {
    const candidates = [
      {
        skills: ['JavaScript', 'React'],
        experience: 2
      },
      {
        skills: ['Python', 'Machine Learning'],
        experience: 5
      },
      {
        skills: ['JavaScript', 'Node.js'],
        experience: 3
      }
    ];

    test('should analyze candidate trends correctly', () => {
      const trends = analyzer.analyzeTrends(candidates);

      expect(trends.totalCandidates).toBe(3);
      expect(trends.averageScore).toBeGreaterThan(0);
      expect(trends.minScore).toBeGreaterThan(0);
      expect(trends.maxScore).toBeGreaterThan(0);
      expect(trends.topSkills).toHaveLength(5);
      expect(trends.scoreDistribution).toBeDefined();
    });

    test('should calculate skill frequency correctly', () => {
      const trends = analyzer.analyzeTrends(candidates);
      const javascriptSkill = trends.topSkills.find(s => s.skill === 'JavaScript');
      expect(javascriptSkill.count).toBe(2);
    });

    test('should throw error for empty candidates array', () => {
      expect(() => analyzer.analyzeTrends([])).toThrow('Candidates array is required and cannot be empty');
    });

    test('should throw error for invalid candidates parameter', () => {
      expect(() => analyzer.analyzeTrends(null)).toThrow('Candidates array is required and cannot be empty');
      expect(() => analyzer.analyzeTrends('not an array')).toThrow('Candidates array is required and cannot be empty');
    });
  });

  describe('validateCandidate', () => {
    test('should validate valid candidate data', () => {
      const validCandidate = {
        name: 'John Doe',
        email: 'john@example.com',
        skills: ['JavaScript'],
        experience: 2
      };

      const result = analyzer.validateCandidate(validCandidate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect validation errors', () => {
      const invalidCandidate = {
        name: 'J',
        email: 'invalid-email',
        skills: []
      };

      const result = analyzer.validateCandidate(invalidCandidate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Name must be at least 2 characters long');
      expect(result.errors).toContain('Valid email is required');
      expect(result.errors).toContain('At least one skill is required');
    });

    test('should generate warnings for phone validation', () => {
      const candidateWithPhone = {
        name: 'John Doe',
        email: 'john@example.com',
        skills: ['JavaScript'],
        phone: 'invalid-phone'
      };

      const result = analyzer.validateCandidate(candidateWithPhone);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Phone number format may be invalid');
    });
  });

  describe('Email and Phone Validation', () => {
    test('should validate correct email formats', () => {
      expect(analyzer.isValidEmail('test@example.com')).toBe(true);
      expect(analyzer.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(analyzer.isValidEmail('test+tag@example.org')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(analyzer.isValidEmail('invalid-email')).toBe(false);
      expect(analyzer.isValidEmail('test@')).toBe(false);
      expect(analyzer.isValidEmail('@example.com')).toBe(false);
      expect(analyzer.isValidEmail('')).toBe(false);
    });

    test('should validate correct phone formats', () => {
      expect(analyzer.isValidPhone('+1234567890')).toBe(true);
      expect(analyzer.isValidPhone('1234567890')).toBe(true);
      expect(analyzer.isValidPhone('(123) 456-7890')).toBe(true);
      expect(analyzer.isValidPhone('123-456-7890')).toBe(true);
    });

    test('should reject invalid phone formats', () => {
      expect(analyzer.isValidPhone('invalid')).toBe(false);
      expect(analyzer.isValidPhone('123')).toBe(false);
      expect(analyzer.isValidPhone('')).toBe(false);
    });
  });

  describe('Skill Weights Management', () => {
    test('should update skill weights correctly', () => {
      const newWeights = {
        'JavaScript': 2.0,
        'NewSkill': 1.8
      };

      analyzer.updateSkillWeights(newWeights);
      expect(analyzer.skillWeights['JavaScript']).toBe(2.0);
      expect(analyzer.skillWeights['NewSkill']).toBe(1.8);
    });

    test('should throw error for invalid weight updates', () => {
      expect(() => analyzer.updateSkillWeights(null)).toThrow('Skill weights must be an object');
      expect(() => analyzer.updateSkillWeights('not an object')).toThrow('Skill weights must be an object');
      expect(() => analyzer.updateSkillWeights({ 'Skill': -1 })).toThrow('Invalid weight for skill Skill: must be a positive number');
    });

    test('should return copy of skill weights', () => {
      const weights = analyzer.getSkillWeights();
      expect(weights).toEqual(analyzer.skillWeights);
      expect(weights).not.toBe(analyzer.skillWeights); // Should be a copy
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle candidate with no skills gracefully', () => {
      const candidate = {
        skills: [],
        experience: 1
      };

      expect(() => analyzer.calculateScore(candidate)).toThrow('Invalid candidate data: skills array required');
    });

    test('should handle very high experience values', () => {
      const candidate = {
        skills: ['JavaScript'],
        experience: 1000
      };

      const score = analyzer.calculateScore(candidate);
      expect(score).toBeLessThanOrEqual(100); // Should be capped
    });

    test('should handle special characters in skills', () => {
      const candidate = {
        skills: ['C++', 'C#', 'F#'],
        experience: 2
      };

      const score = analyzer.calculateScore(candidate);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('Performance and Large Datasets', () => {
    test('should handle large number of candidates efficiently', () => {
      const largeCandidateList = Array.from({ length: 1000 }, (_, i) => ({
        skills: ['JavaScript', 'React'],
        experience: Math.floor(Math.random() * 10) + 1
      }));

      const startTime = Date.now();
      const trends = analyzer.analyzeTrends(largeCandidateList);
      const endTime = Date.now();

      expect(trends.totalCandidates).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle candidate with many skills', () => {
      const manySkills = Array.from({ length: 100 }, (_, i) => `Skill${i}`);
      const candidate = {
        skills: manySkills,
        experience: 5
      };

      const score = analyzer.calculateScore(candidate);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
