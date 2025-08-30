// src/agents/cityContext.ts

import { AgentContext } from '../context';
import { CrewPairing, DecisionRecord, CityProfile, IATA } from '../data/types';
import airportsData from '../data/samples/airports.sample.json';

/**
 * City Context Agent
 * Purpose: Resolve arrival city/metro, risk flags, curfew notes
 * Determines the layover city and relevant contextual information
 */
export async function cityContext(
  pairing: CrewPairing,
  ctx: AgentContext,
  push: (r: DecisionRecord) => void
): Promise<CityProfile> {
  try {
    // Get the final destination from the last flight leg
    const lastLeg = pairing.legs[pairing.legs.length - 1];
    const arrivalIata = lastLeg.arrIata;
    
    // Look up airport information
    const airport = airportsData.find(ap => ap.iata === arrivalIata);
    
    if (!airport) {
      push({
        stage: 'cityContext',
        subjectId: arrivalIata,
        outcome: 'reject',
        reasons: [`Unknown airport: ${arrivalIata}`],
      });
      throw new Error(`Airport ${arrivalIata} not found in database`);
    }
    
    // Determine risk factors based on arrival time and location
    const arrivalTime = new Date(lastLeg.arrUtc);
    const arrivalHour = arrivalTime.getUTCHours();
    const risk: string[] = [];
    let curfew = false;
    
    // Check for late night arrival (potential curfew issues)
    if (arrivalHour >= 23 || arrivalHour <= 5) {
      risk.push('Late night arrival');
      curfew = true;
    }
    
    // Check for high-traffic cities (longer commute times expected)
    const highTrafficCities = ['JFK', 'LAX', 'LGA', 'EWR', 'ORD'];
    if (highTrafficCities.includes(arrivalIata)) {
      risk.push('High traffic metro area');
    }
    
    // Check for weather-prone airports
    const weatherRiskCities = ['ORD', 'DEN', 'BOS', 'DCA'];
    if (weatherRiskCities.includes(arrivalIata)) {
      risk.push('Weather-sensitive location');
    }
    
    // Determine if it's a weekend (higher traffic/rates)
    const dayOfWeek = arrivalTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      risk.push('Weekend arrival');
    }
    
    const cityProfile: CityProfile = {
      city: airport.city,
      arrAirport: arrivalIata,
      risk,
      curfew,
    };
    
    const reasons = [
      `Arrival: ${airport.name} (${arrivalIata})`,
      `City: ${airport.city}`,
      `Time: ${arrivalTime.toLocaleString()}`,
    ];
    
    if (risk.length > 0) {
      reasons.push(`Risk factors: ${risk.join(', ')}`);
    }
    
    if (curfew) {
      reasons.push('Late night curfew considerations apply');
    }
    
    push({
      stage: 'cityContext',
      subjectId: arrivalIata,
      outcome: 'accept',
      reasons,
      details: {
        airport: airport.name,
        city: airport.city,
        arrivalTime: lastLeg.arrUtc,
        riskCount: risk.length,
        curfew,
      },
    });
    
    return cityProfile;
  } catch (error) {
    push({
      stage: 'cityContext',
      subjectId: 'unknown',
      outcome: 'reject',
      reasons: [`Error processing city context: ${error instanceof Error ? error.message : 'Unknown error'}`],
    });
    throw error;
  }
}