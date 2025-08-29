/**
 * Candidate Analyzer - Core utility for analyzing candidate data
 * This module provides functions for scoring, matching, and analyzing candidates
 */

class CandidateAnalyzer {
  constructor() {
    this.skillWeights = {
      'JavaScript': 1.0,
      'Node.js': 1.2,
      'React': 1.1,
      'Python': 0.9,
      'Java': 0.8,
      'SQL': 0.7,
      'AWS': 1.3,
      'Docker': 1.1,
      'Kubernetes': 1.4,
      'Machine Learning': 1.5
    };
    
    this.experienceMultiplier = 0.1;
    this.baseScore = 50;
  }

  /**
   * Calculate candidate score based on skills and experience
   * @param {Object} candidate - Candidate object
   * @returns {number} Score between 0-100
   */
  calculateScore(candidate) {
    if (!candidate || !candidate.skills || !Array.isArray(candidate.skills) || candidate.skills.length === 0) {
      throw new Error('Invalid candidate data: skills array required');
    }

    if (typeof candidate.experience !== 'number' || candidate.experience < 0) {
      throw new Error('Invalid candidate data: experience must be a positive number');
    }

    let skillScore = 0;
    let totalWeight = 0;

    candidate.skills.forEach(skill => {
      const weight = this.skillWeights[skill] || 0.5;
      skillScore += weight;
      totalWeight += weight;
    });

    const averageSkillScore = totalWeight > 0 ? skillScore / totalWeight : 0;
    const experienceBonus = Math.min(candidate.experience * this.experienceMultiplier, 20);
    
    const finalScore = Math.min(
      this.baseScore + (averageSkillScore * 30) + experienceBonus,
      100
    );

    return Math.round(finalScore * 100) / 100;
  }

  /**
   * Match candidate to job requirements
   * @param {Object} candidate - Candidate object
   * @param {Object} job - Job object
   * @returns {Object} Match result with score and details
   */
  matchCandidateToJob(candidate, job) {
    if (!candidate || !job) {
      throw new Error('Both candidate and job are required');
    }

    if (!job.requirements || !Array.isArray(job.requirements)) {
      throw new Error('Job requirements array is required');
    }

    const candidateSkills = new Set(candidate.skills.map(s => s.toLowerCase()));
    const jobRequirements = new Set(job.requirements.map(r => r.toLowerCase()));
    
    const matchingSkills = [...candidateSkills].filter(skill => 
      [...jobRequirements].some(req => skill.includes(req) || req.includes(skill))
    );

    const matchPercentage = (matchingSkills.length / jobRequirements.size) * 100;
    const baseScore = this.calculateScore(candidate);
    const matchScore = Math.min(baseScore * (matchPercentage / 100), 100);

    return {
      candidateId: candidate.id,
      jobId: job.id,
      matchScore: Math.round(matchScore * 100) / 100,
      matchPercentage: Math.round(matchPercentage * 100) / 100,
      matchingSkills,
      missingSkills: [...jobRequirements].filter(req => 
        ![...candidateSkills].some(skill => skill.includes(req) || req.includes(skill))
      ),
      recommendation: this.getRecommendation(matchScore)
    };
  }

  /**
   * Get recommendation based on match score
   * @param {number} score - Match score
   * @returns {string} Recommendation
   */
  getRecommendation(score) {
    if (score >= 90) return 'Strong Hire';
    if (score >= 80) return 'Hire';
    if (score >= 70) return 'Consider';
    if (score >= 60) return 'Maybe';
    if (score >= 50) return 'Unlikely';
    return 'Not Recommended';
  }

  /**
   * Analyze candidate trends
   * @param {Array} candidates - Array of candidate objects
   * @returns {Object} Analysis results
   */
  analyzeTrends(candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
      throw new Error('Candidates array is required and cannot be empty');
    }

    const scores = candidates.map(c => this.calculateScore(c));
    const skills = candidates.flatMap(c => c.skills || []);
    
    const skillFrequency = skills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

    const topSkills = Object.entries(skillFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    return {
      totalCandidates: candidates.length,
      averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      topSkills,
      scoreDistribution: {
        excellent: scores.filter(s => s >= 90).length,
        good: scores.filter(s => s >= 80 && s < 90).length,
        average: scores.filter(s => s >= 70 && s < 80).length,
        below: scores.filter(s => s < 70).length
      }
    };
  }

  /**
   * Validate candidate data
   * @param {Object} candidate - Candidate object
   * @returns {Object} Validation result
   */
  validateCandidate(candidate) {
    const errors = [];
    const warnings = [];

    if (!candidate.name || candidate.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!candidate.email || !this.isValidEmail(candidate.email)) {
      errors.push('Valid email is required');
    }

    if (!candidate.skills || !Array.isArray(candidate.skills) || candidate.skills.length === 0) {
      errors.push('At least one skill is required');
    }

    if (candidate.experience !== undefined && (typeof candidate.experience !== 'number' || candidate.experience < 0)) {
      errors.push('Experience must be a positive number');
    }

    if (candidate.phone && !this.isValidPhone(candidate.phone)) {
      warnings.push('Phone number format may be invalid');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format
   * @param {string} phone - Phone to validate
   * @returns {boolean} Is valid phone
   */
  isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    const phoneRegex = /^[\+]?[1-9][\d]{7,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Update skill weights
   * @param {Object} newWeights - New skill weights
   */
  updateSkillWeights(newWeights) {
    if (typeof newWeights !== 'object' || newWeights === null) {
      throw new Error('Skill weights must be an object');
    }

    Object.entries(newWeights).forEach(([skill, weight]) => {
      if (typeof weight !== 'number' || weight < 0) {
        throw new Error(`Invalid weight for skill ${skill}: must be a positive number`);
      }
      this.skillWeights[skill] = weight;
    });
  }

  /**
   * Get current skill weights
   * @returns {Object} Current skill weights
   */
  getSkillWeights() {
    return { ...this.skillWeights };
  }
}

module.exports = CandidateAnalyzer;
