// src/agents/geoDistance.ts

import { AgentContext } from '../context';
import { DecisionRecord, HotelCandidate, CityProfile } from '../data/types';
import airportsData from '../data/samples/airports.sample.json';

/**
 * Geo/Distance Agent
 * Purpose: Compute ETA/time from airport to hotel
 * Uses haversine distance as fallback, with caching for efficiency
 */

// Haversine distance calculation (km)
function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Convert distance to estimated travel time
function estimateTravelTime(distanceKm: number, arrivalTime: Date): number {
  // Base speed assumptions
  let avgSpeedKmh = 30; // Urban traffic average
  
  // Adjust for time of day
  const hour = arrivalTime.getUTCHours();
  
  // Rush hour penalties
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
    avgSpeedKmh = 20; // Heavy traffic
  } else if (hour >= 22 || hour <= 6) {
    avgSpeedKmh = 45; // Light late-night traffic
  }
  
  // Weekend adjustment
  const dayOfWeek = arrivalTime.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    avgSpeedKmh *= 1.2; // Less traffic on weekends
  }
  
  const timeHours = distanceKm / avgSpeedKmh;
  return Math.round(timeHours * 60); // Convert to minutes
}

export async function geoDistance(
  cityProfile: CityProfile,
  hotels: HotelCandidate[],
  ctx: AgentContext,
  push: (r: DecisionRecord) => void
): Promise<HotelCandidate[]> {
  try {
    // Find airport coordinates
    const airport = airportsData.find(ap => ap.iata === cityProfile.arrAirport);
    
    if (!airport) {
      push({
        stage: 'geoDistance',
        outcome: 'reject',
        reasons: [`Airport ${cityProfile.arrAirport} not found in database`],
      });
      throw new Error(`Airport ${cityProfile.arrAirport} coordinates not available`);
    }
    
    // For travel time calculation, we need an arrival time
    // In MVP, we'll use current time as approximation
    const arrivalTime = new Date(ctx.nowUtc);
    
    const enrichedHotels = hotels.map(hotel => {
      // Check cache first
      const cacheKey = `${airport.iata}-${hotel.id}`;
      let distanceKm = ctx.caches.distances.get(cacheKey);
      
      if (distanceKm === undefined) {
        // Calculate haversine distance
        distanceKm = haversine(
          { lat: airport.lat, lon: airport.lon },
          { lat: hotel.lat, lon: hotel.lon }
        );
        
        // Cache the result
        ctx.caches.distances.set(cacheKey, distanceKm);
      }
      
      // Estimate travel time based on distance and arrival context
      const etaMinutes = estimateTravelTime(distanceKm, arrivalTime);
      
      // Add notes based on distance and risk factors
      const notes: string[] = [];
      
      if (distanceKm > 20) {
        notes.push('Long distance from airport');
      }
      
      if (etaMinutes > 45) {
        notes.push('Extended travel time');
      }
      
      if (cityProfile.curfew && etaMinutes > 30) {
        notes.push('Late arrival - consider closer options');
      }
      
      if (cityProfile.risk.includes('High traffic metro area')) {
        notes.push('Traffic delays possible');
      }
      
      // Log the calculation
      push({
        stage: 'geoDistance',
        subjectId: hotel.id,
        outcome: 'score',
        score: etaMinutes,
        reasons: [
          `Distance: ${distanceKm.toFixed(1)}km`,
          `ETA: ${etaMinutes} minutes`,
          ...(notes.length > 0 ? [`Flags: ${notes.join(', ')}`] : []),
        ],
        details: {
          hotelName: hotel.name,
          distanceKm: distanceKm,
          etaMinutes: etaMinutes,
          arrivalHour: arrivalTime.getUTCHours(),
          cacheHit: ctx.caches.distances.has(cacheKey),
        },
      });
      
      return {
        ...hotel,
        distanceKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
        etaMinutes,
        notes: [...(hotel.notes || []), ...notes],
      };
    });
    
    // Sort by travel time (closest first)
    enrichedHotels.sort((a, b) => (a.etaMinutes || 999) - (b.etaMinutes || 999));
    
    push({
      stage: 'geoDistance',
      outcome: 'accept',
      reasons: [
        `Calculated distances for ${enrichedHotels.length} hotels`,
        `Airport: ${airport.name}`,
        `Closest hotel: ${enrichedHotels[0]?.etaMinutes || 'N/A'} minutes`,
      ],
      details: {
        airport: airport.name,
        hotelCount: enrichedHotels.length,
        avgDistance: enrichedHotels.reduce((sum, h) => sum + (h.distanceKm || 0), 0) / enrichedHotels.length,
        avgEta: enrichedHotels.reduce((sum, h) => sum + (h.etaMinutes || 0), 0) / enrichedHotels.length,
      },
    });
    
    return enrichedHotels;
  } catch (error) {
    push({
      stage: 'geoDistance',
      outcome: 'reject',
      reasons: [`Error calculating distances: ${error instanceof Error ? error.message : 'Unknown error'}`],
    });
    throw error;
  }
}