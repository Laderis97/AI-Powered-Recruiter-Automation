// src/services/flights.ts

import { FlightLeg, CrewPairing, IATA } from '../data/types';

/**
 * Flight Data Service
 * Purpose: Interface with flight data providers (GDS, airline systems)
 * MVP uses static data; production would integrate with Amadeus, Sabre, airline APIs
 */

export interface FlightConfig {
  provider: 'amadeus' | 'sabre' | 'airline' | 'offline';
  apiKey?: string;
  airlineCode?: string;
}

export class FlightService {
  constructor(private config: FlightConfig) {}
  
  /**
   * Get flight details by flight number and date
   */
  async getFlightDetails(flightNo: string, date: string): Promise<FlightLeg | null> {
    if (this.config.provider === 'offline') {
      // MVP: Return null, actual data comes from sample files
      return null;
    }
    
    // TODO: Implement real flight data lookup
    throw new Error('Live flight data lookup not implemented in MVP');
  }
  
  /**
   * Get crew pairing information
   */
  async getCrewPairing(pairingId: string): Promise<CrewPairing | null> {
    if (this.config.provider === 'offline') {
      return null;
    }
    
    // TODO: Implement crew pairing lookup from airline systems
    throw new Error('Crew pairing lookup not implemented in MVP');
  }
  
  /**
   * Get airport information by IATA code
   */
  async getAirportInfo(iata: IATA): Promise<{
    iata: IATA;
    name: string;
    city: string;
    country: string;
    timezone: string;
    coordinates: { lat: number; lon: number };
  } | null> {
    if (this.config.provider === 'offline') {
      return null;
    }
    
    // TODO: Implement airport data lookup
    throw new Error('Airport data lookup not implemented in MVP');
  }
  
  /**
   * Validate flight continuity and timing
   */
  validatePairing(pairing: CrewPairing): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (pairing.legs.length === 0) {
      issues.push('No flight legs in pairing');
      return { valid: false, issues };
    }
    
    // Check leg continuity
    for (let i = 1; i < pairing.legs.length; i++) {
      const prevLeg = pairing.legs[i - 1];
      const currentLeg = pairing.legs[i];
      
      if (prevLeg.arrIata !== currentLeg.depIata) {
        issues.push(`Routing gap: ${prevLeg.arrIata} → ${currentLeg.depIata}`);
      }
      
      const prevArrival = new Date(prevLeg.arrUtc);
      const currentDeparture = new Date(currentLeg.depUtc);
      const layoverMinutes = (currentDeparture.getTime() - prevArrival.getTime()) / (1000 * 60);
      
      if (layoverMinutes < 45) {
        issues.push(`Short layover: ${layoverMinutes.toFixed(0)}min at ${prevLeg.arrIata}`);
      }
      
      if (layoverMinutes < 0) {
        issues.push(`Invalid timing: departure before arrival at ${prevLeg.arrIata}`);
      }
    }
    
    // Check crew complement
    const requiredRoles = ['Captain', 'FirstOfficer'];
    const presentRoles = pairing.members.map(m => m.role);
    
    for (const role of requiredRoles) {
      if (!presentRoles.includes(role)) {
        issues.push(`Missing required crew role: ${role}`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }
  
  /**
   * Calculate duty time for a pairing
   */
  calculateDutyTime(pairing: CrewPairing): {
    dutyHours: number;
    startUtc: string;
    endUtc: string;
    flightHours: number;
    groundTime: number;
  } {
    if (pairing.legs.length === 0) {
      throw new Error('Cannot calculate duty time for empty pairing');
    }
    
    const startUtc = pairing.legs[0].depUtc;
    const endUtc = pairing.legs[pairing.legs.length - 1].arrUtc;
    
    const dutyMs = new Date(endUtc).getTime() - new Date(startUtc).getTime();
    const dutyHours = dutyMs / (1000 * 60 * 60);
    
    // Calculate flight time
    const flightMs = pairing.legs.reduce((total, leg) => {
      const legMs = new Date(leg.arrUtc).getTime() - new Date(leg.depUtc).getTime();
      return total + legMs;
    }, 0);
    const flightHours = flightMs / (1000 * 60 * 60);
    
    const groundTime = dutyHours - flightHours;
    
    return {
      dutyHours,
      startUtc,
      endUtc,
      flightHours,
      groundTime,
    };
  }
  
  /**
   * Check if service is available and configured
   */
  isAvailable(): boolean {
    return this.config.provider === 'offline' || !!this.config.apiKey;
  }
}