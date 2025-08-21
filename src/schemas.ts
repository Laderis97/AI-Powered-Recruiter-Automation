import { z } from "zod";

export const AlignmentScoreSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  technicalScore: z.number().int().min(0).max(100),
  experienceScore: z.number().int().min(0).max(100),
  skillsScore: z.number().int().min(0).max(100),
  culturalFitScore: z.number().int().min(0).max(100),
  detailedBreakdown: z.string(),
  recommendations: z.array(z.string()),
  interviewQuestions: z.array(z.string()),
  riskFactors: z.array(z.string()),
  trainingNeeds: z.array(z.string()),
});

export const SkillsGapSchema = z.object({
  missingSkills: z.array(z.string()),
  skillLevels: z.record(z.string(), z.enum(["beginner", "intermediate", "advanced"])),
  criticalGaps: z.array(z.string()),
  niceToHave: z.array(z.string()),
});

export const CulturalFitSchema = z.object({
  fitScore: z.number().int().min(0).max(100),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type AlignmentScore = z.infer<typeof AlignmentScoreSchema>;
export type SkillsGap = z.infer<typeof SkillsGapSchema>;
export type CulturalFit = z.infer<typeof CulturalFitSchema>;

// Utility function to clamp numbers between 0-100
export const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
