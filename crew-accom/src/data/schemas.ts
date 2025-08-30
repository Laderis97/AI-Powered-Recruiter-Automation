// src/data/schemas.ts

import { z } from 'zod';

export const FlightLegSchema = z.object({
  flightNo: z.string(),
  carrier: z.string(),
  depIata: z.string().length(3),
  arrIata: z.string().length(3),
  depUtc: z.string().datetime(),
  arrUtc: z.string().datetime(),
  equipment: z.string().optional(),
});

export const CrewMemberSchema = z.object({
  id: z.string(),
  role: z.enum(['Captain', 'FirstOfficer', 'FA']),
  seniority: z.number().optional(),
});

export const CrewPairingSchema = z.object({
  id: z.string(),
  members: z.array(CrewMemberSchema),
  legs: z.array(FlightLegSchema),
});

export const AirportSchema = z.object({
  iata: z.string().length(3),
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  city: z.string(),
  tz: z.string(),
});

export const HotelSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  address: z.string(),
  brand: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
});

export const HotelRateSchema = z.object({
  hotelId: z.string(),
  currency: z.literal('USD'),
  nightly: z.number().min(0),
  taxesFees: z.number().min(0).optional(),
});

export const ConstraintsSchema = z.object({
  maxCommuteMinutes: z.number().min(0).optional(),
  minHotelRating: z.number().min(0).max(5).optional(),
  maxNightlyUsd: z.number().min(0).optional(),
  preferredBrands: z.array(z.string()).optional(),
  blacklistHotels: z.array(z.string()).optional(),
  minRestHours: z.number().min(0).optional(),
  sameHotelForCrew: z.boolean().optional(),
  minReviews: z.number().min(0).optional(),
  safetyFlags: z.array(z.string()).optional(),
});

export const DecisionRecordSchema = z.object({
  stage: z.string(),
  subjectId: z.string().optional(),
  outcome: z.enum(['accept', 'reject', 'score']),
  score: z.number().optional(),
  reasons: z.array(z.string()),
  details: z.record(z.unknown()).optional(),
});

export const PlanResultSchema = z.object({
  city: z.string(),
  arrAirport: z.string().length(3),
  candidates: z.array(HotelSchema.extend({
    rate: HotelRateSchema.optional(),
    distanceKm: z.number().optional(),
    etaMinutes: z.number().optional(),
    notes: z.array(z.string()).optional(),
  })),
  chosen: HotelSchema.extend({
    rate: HotelRateSchema.optional(),
    distanceKm: z.number().optional(),
    etaMinutes: z.number().optional(),
    notes: z.array(z.string()).optional(),
  }).optional(),
  audit: z.array(DecisionRecordSchema),
});

// Export type inference from schemas
export type FlightLeg = z.infer<typeof FlightLegSchema>;
export type CrewMember = z.infer<typeof CrewMemberSchema>;
export type CrewPairing = z.infer<typeof CrewPairingSchema>;
export type Airport = z.infer<typeof AirportSchema>;
export type Hotel = z.infer<typeof HotelSchema>;
export type HotelRate = z.infer<typeof HotelRateSchema>;
export type Constraints = z.infer<typeof ConstraintsSchema>;
export type DecisionRecord = z.infer<typeof DecisionRecordSchema>;
export type PlanResult = z.infer<typeof PlanResultSchema>;