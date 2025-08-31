// src/agents/hotelSourcing.ts

import { DecisionRecord, HotelCandidate, CityProfile } from '../data/types';
import { AgentContext } from '../context';
import hotelsData from '../data/samples/hotels.sample.json';

/**
 * Hotel Sourcing Agent
 * Purpose: Produce candidate hotels with rates
 * Finds available hotels in the arrival city that meet basic criteria
 */
export async function hotelSourcing(
  cityProfile: CityProfile,
  ctx: AgentContext,
  push: (r: DecisionRecord) => void
): Promise<HotelCandidate[]> {
  try {
    // Filter hotels by city/airport area
    const cityKeywords = [
      cityProfile.city.toLowerCase(),
      cityProfile.arrAirport.toLowerCase(),
    ];
    
    const candidateHotels = (hotelsData as HotelCandidate[]).filter(hotel => {
      const addressLower = hotel.address.toLowerCase();
      const nameLower = hotel.name.toLowerCase();
      
      return cityKeywords.some(keyword => 
        addressLower.includes(keyword) || nameLower.includes(keyword)
      );
    });
    
    // Apply basic pre-filtering based on constraints
    const preFiltered: HotelCandidate[] = [];
    
    for (const hotel of candidateHotels) {
      const reasons: string[] = [];
      let shouldInclude = true;
      
      // Check basic constraints that don't require geo data
      if (ctx.constraints.minHotelRating && hotel.rating && hotel.rating < ctx.constraints.minHotelRating) {
        reasons.push(`Rating ${hotel.rating} below minimum ${ctx.constraints.minHotelRating}`);
        shouldInclude = false;
      }
      
      if (ctx.constraints.minReviews && hotel.reviews && hotel.reviews < ctx.constraints.minReviews) {
        reasons.push(`Reviews ${hotel.reviews} below minimum ${ctx.constraints.minReviews}`);
        shouldInclude = false;
      }
      
      if (ctx.constraints.blacklistHotels?.includes(hotel.id)) {
        reasons.push('Hotel is blacklisted');
        shouldInclude = false;
      }
      
      if (ctx.constraints.maxNightlyUsd && hotel.rate && hotel.rate.nightly > ctx.constraints.maxNightlyUsd) {
        reasons.push(`Rate $${hotel.rate.nightly} exceeds maximum $${ctx.constraints.maxNightlyUsd}`);
        shouldInclude = false;
      }
      
      if (shouldInclude) {
        preFiltered.push(hotel);
        reasons.push('Passed initial screening');
      }
      
      push({
        stage: 'hotelSourcing',
        subjectId: hotel.id,
        outcome: shouldInclude ? 'accept' : 'reject',
        reasons,
        details: {
          hotelName: hotel.name,
          brand: hotel.brand,
          rating: hotel.rating,
          rate: hotel.rate?.nightly,
        },
      });
    }
    
    // Add brand preference scoring
    const scoredCandidates = preFiltered.map(hotel => {
      let brandScore = 0;
      if (ctx.constraints.preferredBrands?.includes(hotel.brand || '')) {
        brandScore = 5;
      }
      
      return {
        ...hotel,
        brandScore,
      };
    });
    
    // Sort by brand preference and rating
    scoredCandidates.sort((a, b) => {
      const scoreA = (a.brandScore || 0) + (a.rating || 0) * 10;
      const scoreB = (b.brandScore || 0) + (b.rating || 0) * 10;
      return scoreB - scoreA;
    });
    
    push({
      stage: 'hotelSourcing',
      outcome: 'score',
      score: scoredCandidates.length,
      reasons: [
        `Found ${candidateHotels.length} hotels in ${cityProfile.city}`,
        `${scoredCandidates.length} passed initial screening`,
      ],
      details: {
        city: cityProfile.city,
        totalFound: candidateHotels.length,
        passedScreening: scoredCandidates.length,
        preferredBrands: ctx.constraints.preferredBrands,
      },
    });
    
    return scoredCandidates;
  } catch (error) {
    push({
      stage: 'hotelSourcing',
      outcome: 'reject',
      reasons: [`Error sourcing hotels: ${error instanceof Error ? error.message : 'Unknown error'}`],
    });
    throw error;
  }
}