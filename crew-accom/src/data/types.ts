// src/data/types.ts

export type IATA = string; // e.g., "SEA"
export type HotelId = string;

export interface FlightLeg {
  flightNo: string;
  carrier: string;
  depIata: IATA;
  arrIata: IATA;
  depUtc: string; // ISO
  arrUtc: string; // ISO
  equipment?: string;
}

export interface CrewMember {
  id: string;
  role: 'Captain' | 'FirstOfficer' | 'FA';
  seniority?: number;
}

export interface CrewPairing {
  id: string;
  members: CrewMember[];
  legs: FlightLeg[];
}

export interface Airport {
  iata: IATA;
  name: string;
  lat: number;
  lon: number;
  city: string;
  tz: string;
}

export interface Hotel {
  id: HotelId;
  name: string;
  lat: number;
  lon: number;
  address: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  amenities?: string[];
}

export interface HotelRate {
  hotelId: HotelId;
  currency: 'USD';
  nightly: number;
  taxesFees?: number;
}

export interface HotelCandidate extends Hotel {
  rate?: HotelRate;
  distanceKm?: number;
  etaMinutes?: number;
  notes?: string[];
}

export interface TravelTime {
  hotelId: HotelId;
  mode: 'drive' | 'transit' | 'shuttle';
  minutes: number;
  distanceKm: number;
  window: {
    startUtc: string;
    endUtc: string;
  };
}

export interface Constraints {
  maxCommuteMinutes?: number; // e.g., 30
  minHotelRating?: number; // e.g., 3.5
  maxNightlyUsd?: number; // e.g., 220
  preferredBrands?: string[]; // e.g., ["Hilton","Marriott"]
  blacklistHotels?: HotelId[];
  minRestHours?: number; // e.g., 10h
  sameHotelForCrew?: boolean; // keep a crew together
  minReviews?: number; // quality floor
  safetyFlags?: string[]; // avoid zones
}

export interface DecisionRecord {
  stage: string;
  subjectId?: string;
  outcome: 'accept' | 'reject' | 'score';
  score?: number;
  reasons: string[];
  details?: Record<string, unknown>;
}

export interface CityProfile {
  city: string;
  arrAirport: IATA;
  risk: string[];
  curfew: boolean;
}

export interface PlanResult {
  city: string;
  arrAirport: IATA;
  candidates: HotelCandidate[];
  chosen?: HotelCandidate;
  audit: DecisionRecord[];
}