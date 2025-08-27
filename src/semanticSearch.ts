// src/semanticSearch.ts

import { z } from 'zod';

export interface SkillMatch {
  skill: string;
  confidence: number;
  synonyms: string[];
  category: 'exact' | 'semantic' | 'related';
}

export interface SemanticAnalysis {
  skillMatches: SkillMatch[];
  overallSimilarity: number;
  missingSkills: string[];
  relatedSkills: string[];
}

export class SemanticSearchService {
  private skillSynonyms: Map<string, string[]> = new Map();
  private skillCategories: Map<string, string> = new Map();

  constructor() {
    this.initializeSkillMappings();
  }

  /**
   * Analyze skills with semantic matching
   */
  analyzeSkills(
    candidateSkills: string[],
    jobSkills: string[]
  ): SemanticAnalysis {
    const skillMatches: SkillMatch[] = [];
    const missingSkills: string[] = [];
    const relatedSkills: string[] = [];

    // Find exact matches first
    const exactMatches = candidateSkills.filter(skill =>
      jobSkills.some(
        jobSkill => this.normalizeSkill(skill) === this.normalizeSkill(jobSkill)
      )
    );

    exactMatches.forEach(skill => {
      skillMatches.push({
        skill,
        confidence: 1.0,
        synonyms: [skill],
        category: 'exact',
      });
    });

    // Find semantic matches
    const remainingJobSkills = jobSkills.filter(
      jobSkill =>
        !exactMatches.some(
          candidateSkill =>
            this.normalizeSkill(candidateSkill) ===
            this.normalizeSkill(jobSkill)
        )
    );

    remainingJobSkills.forEach(jobSkill => {
      const bestMatch = this.findBestSemanticMatch(jobSkill, candidateSkills);
      if (bestMatch && bestMatch.confidence > 0.7) {
        skillMatches.push(bestMatch);
      } else {
        missingSkills.push(jobSkill);
      }
    });

    // Find related skills
    candidateSkills.forEach(skill => {
      if (!skillMatches.some(match => match.skill === skill)) {
        const related = this.findRelatedSkills(skill, jobSkills);
        if (related.length > 0) {
          relatedSkills.push(skill);
        }
      }
    });

    const overallSimilarity = this.calculateOverallSimilarity(
      skillMatches,
      jobSkills.length
    );

    return {
      skillMatches,
      overallSimilarity,
      missingSkills,
      relatedSkills,
    };
  }

  /**
   * Find the best semantic match for a skill
   */
  private findBestSemanticMatch(
    targetSkill: string,
    candidateSkills: string[]
  ): SkillMatch | null {
    let bestMatch: SkillMatch | null = null;
    let bestConfidence = 0;

    candidateSkills.forEach(skill => {
      const confidence = this.calculateSkillSimilarity(targetSkill, skill);
      if (confidence > bestConfidence && confidence > 0.7) {
        bestConfidence = confidence;
        bestMatch = {
          skill,
          confidence,
          synonyms: this.getSkillSynonyms(skill),
          category: 'semantic',
        };
      }
    });

    return bestMatch;
  }

  /**
   * Calculate similarity between two skills
   */
  private calculateSkillSimilarity(skill1: string, skill2: string): number {
    const normalized1 = this.normalizeSkill(skill1);
    const normalized2 = this.normalizeSkill(skill2);

    // Exact match
    if (normalized1 === normalized2) return 1.0;

    // Check synonyms
    const synonyms1 = this.getSkillSynonyms(normalized1);
    const synonyms2 = this.getSkillSynonyms(normalized2);

    if (synonyms1.includes(normalized2) || synonyms2.includes(normalized1)) {
      return 0.95;
    }

    // Check for partial matches
    if (
      normalized1.includes(normalized2) ||
      normalized2.includes(normalized1)
    ) {
      return 0.8;
    }

    // Check for common substrings
    const commonWords = this.findCommonWords(normalized1, normalized2);
    if (commonWords.length > 0) {
      return 0.6 + commonWords.length * 0.1;
    }

    return 0.0;
  }

  /**
   * Find related skills
   */
  private findRelatedSkills(skill: string, targetSkills: string[]): string[] {
    const related: string[] = [];
    const skillCategory = this.getSkillCategory(skill);

    targetSkills.forEach(targetSkill => {
      const targetCategory = this.getSkillCategory(targetSkill);
      if (skillCategory === targetCategory && skill !== targetSkill) {
        related.push(targetSkill);
      }
    });

    return related;
  }

  /**
   * Calculate overall similarity score
   */
  private calculateOverallSimilarity(
    skillMatches: SkillMatch[],
    totalJobSkills: number
  ): number {
    if (totalJobSkills === 0) return 0;

    const totalConfidence = skillMatches.reduce(
      (sum, match) => sum + match.confidence,
      0
    );
    return Math.round((totalConfidence / totalJobSkills) * 100);
  }

  /**
   * Normalize skill names for comparison
   */
  private normalizeSkill(skill: string): string {
    return skill
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Find common words between two strings
   */
  private findCommonWords(str1: string, str2: string): string[] {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    return words1.filter(word => words2.includes(word));
  }

  /**
   * Get skill synonyms
   */
  private getSkillSynonyms(skill: string): string[] {
    const normalized = this.normalizeSkill(skill);
    return this.skillSynonyms.get(normalized) || [skill];
  }

  /**
   * Get skill category
   */
  private getSkillCategory(skill: string): string {
    const normalized = this.normalizeSkill(skill);
    return this.skillCategories.get(normalized) || 'general';
  }

  /**
   * Initialize skill mappings
   */
  private initializeSkillMappings() {
    // Programming Languages
    this.addSkillMapping(
      'javascript',
      ['js', 'es6', 'es2015', 'ecmascript'],
      'programming'
    );
    this.addSkillMapping('python', ['py', 'python3'], 'programming');
    this.addSkillMapping('java', ['java8', 'java11', 'java17'], 'programming');
    this.addSkillMapping('typescript', ['ts', 'typescript'], 'programming');
    this.addSkillMapping('c++', ['cpp', 'c plus plus'], 'programming');
    this.addSkillMapping('c#', ['csharp', 'dotnet'], 'programming');
    this.addSkillMapping('go', ['golang'], 'programming');
    this.addSkillMapping('rust', ['rustlang'], 'programming');
    this.addSkillMapping('php', ['php7', 'php8'], 'programming');
    this.addSkillMapping('ruby', ['ruby on rails', 'rails'], 'programming');

    // Frameworks & Libraries
    this.addSkillMapping(
      'react',
      ['reactjs', 'react.js', 'reactjs'],
      'frontend'
    );
    this.addSkillMapping(
      'angular',
      ['angularjs', 'angular2', 'angular4'],
      'frontend'
    );
    this.addSkillMapping('vue', ['vuejs', 'vue.js'], 'frontend');
    this.addSkillMapping('node.js', ['nodejs', 'node'], 'backend');
    this.addSkillMapping('express', ['expressjs', 'express.js'], 'backend');
    this.addSkillMapping('django', ['djangorest', 'django rest'], 'backend');
    this.addSkillMapping('flask', ['flask python'], 'backend');
    this.addSkillMapping(
      'spring',
      ['spring boot', 'spring framework'],
      'backend'
    );
    this.addSkillMapping('laravel', ['laravel php'], 'backend');
    this.addSkillMapping('asp.net', ['aspnet', 'dotnet core'], 'backend');

    // Databases
    this.addSkillMapping('postgresql', ['postgres', 'psql'], 'database');
    this.addSkillMapping('mysql', ['mariadb'], 'database');
    this.addSkillMapping('mongodb', ['mongo', 'nosql'], 'database');
    this.addSkillMapping('redis', ['redis cache'], 'database');
    this.addSkillMapping('elasticsearch', ['elastic search', 'es'], 'database');
    this.addSkillMapping('dynamodb', ['dynamo db', 'aws dynamodb'], 'database');

    // Cloud & DevOps
    this.addSkillMapping('aws', ['amazon web services', 'amazon aws'], 'cloud');
    this.addSkillMapping('azure', ['microsoft azure', 'azure cloud'], 'cloud');
    this.addSkillMapping(
      'gcp',
      ['google cloud', 'google cloud platform'],
      'cloud'
    );
    this.addSkillMapping(
      'docker',
      ['containerization', 'containers'],
      'devops'
    );
    this.addSkillMapping('kubernetes', ['k8s', 'kube'], 'devops');
    this.addSkillMapping(
      'terraform',
      ['iac', 'infrastructure as code'],
      'devops'
    );
    this.addSkillMapping(
      'jenkins',
      ['ci/cd', 'continuous integration'],
      'devops'
    );
    this.addSkillMapping(
      'git',
      ['gitlab', 'github', 'version control'],
      'devops'
    );

    // Data & AI
    this.addSkillMapping(
      'machine learning',
      ['ml', 'ai', 'artificial intelligence'],
      'data'
    );
    this.addSkillMapping(
      'data science',
      ['analytics', 'data analytics'],
      'data'
    );
    this.addSkillMapping('pandas', ['python pandas'], 'data');
    this.addSkillMapping('numpy', ['python numpy'], 'data');
    this.addSkillMapping('tensorflow', ['tf', 'deep learning'], 'data');
    this.addSkillMapping('pytorch', ['torch', 'deep learning'], 'data');
    this.addSkillMapping(
      'scikit-learn',
      ['sklearn', 'machine learning'],
      'data'
    );

    // Web Technologies
    this.addSkillMapping('html', ['html5'], 'frontend');
    this.addSkillMapping('css', ['css3', 'styling'], 'frontend');
    this.addSkillMapping('sass', ['scss', 'css preprocessor'], 'frontend');
    this.addSkillMapping('webpack', ['bundler', 'module bundler'], 'frontend');
    this.addSkillMapping('babel', ['transpiler', 'es6 transpiler'], 'frontend');

    // Testing
    this.addSkillMapping(
      'jest',
      ['javascript testing', 'unit testing'],
      'testing'
    );
    this.addSkillMapping('pytest', ['python testing'], 'testing');
    this.addSkillMapping('selenium', ['web testing', 'automation'], 'testing');
    this.addSkillMapping(
      'cypress',
      ['e2e testing', 'end to end testing'],
      'testing'
    );

    // Methodologies
    this.addSkillMapping('agile', ['scrum', 'kanban', 'sprint'], 'methodology');
    this.addSkillMapping('scrum', ['agile', 'sprint planning'], 'methodology');
    this.addSkillMapping('kanban', ['agile', 'lean'], 'methodology');
    this.addSkillMapping('tdd', ['test driven development'], 'methodology');
    this.addSkillMapping('bdd', ['behavior driven development'], 'methodology');

    // Soft Skills
    this.addSkillMapping(
      'leadership',
      ['team lead', 'management'],
      'soft skills'
    );
    this.addSkillMapping('communication', ['verbal', 'written'], 'soft skills');
    this.addSkillMapping(
      'problem solving',
      ['analytical thinking', 'critical thinking'],
      'soft skills'
    );
    this.addSkillMapping(
      'collaboration',
      ['teamwork', 'cross-functional'],
      'soft skills'
    );
    this.addSkillMapping('mentoring', ['coaching', 'training'], 'soft skills');
  }

  /**
   * Add skill mapping with synonyms and category
   */
  private addSkillMapping(skill: string, synonyms: string[], category: string) {
    const normalized = this.normalizeSkill(skill);
    this.skillSynonyms.set(normalized, [skill, ...synonyms]);
    this.skillCategories.set(normalized, category);
  }
}
