// src/agents/scheduleOptimizer.ts

import { AgentContext } from '../context';
import { DecisionRecord, HotelCandidate } from '../data/types';

/**
 * Schedule Optimizer Agent
 * Purpose: Rank/choose hotel set per crew
 * Applies sophisticated scoring to select the optimal hotel choice
 */

interface ScoredHotel {
  hotel: HotelCandidate;
  score: number;
  breakdown: {
    proximityScore: number;
    ratingScore: number;
    costScore: number;
    brandScore: number;
    totalScore: number;
  };
}

export async function scheduleOptimizer(
  candidates: HotelCandidate[],
  ctx: AgentContext,
  push: (r: DecisionRecord) => void
): Promise<HotelCandidate | undefined> {
  try {
    if (candidates.length === 0) {
      push({
        stage: 'scheduleOptimizer',
        outcome: 'reject',
        reasons: ['No compliant hotels available for selection'],
      });
      return undefined;
    }
    
    // Score each hotel using the specified algorithm
    const scoredHotels: ScoredHotel[] = candidates.map(hotel => {
      // Proximity Score: 100 - etaMinutes (closer is better)
      const proximityScore = Math.max(0, 100 - (hotel.etaMinutes ?? 100));
      
      // Rating Score: rating * 10 (higher rating is better)
      const ratingScore = (hotel.rating ?? 0) * 10;
      
      // Cost Score: -(nightly / 10) (lower cost is better)
      const costScore = -((hotel.rate?.nightly ?? 200) / 10);
      
      // Brand Score: +5 if in preferred brands
      const brandScore = ctx.constraints.preferredBrands?.includes(hotel.brand || '') ? 5 : 0;
      
      // Total score
      const totalScore = proximityScore + ratingScore + costScore + brandScore;
      
      return {
        hotel,
        score: totalScore,
        breakdown: {
          proximityScore,
          ratingScore,
          costScore,
          brandScore,
          totalScore,
        },
      };
    });
    
    // Sort by score (highest first)
    scoredHotels.sort((a, b) => b.score - a.score);
    
    // Apply tie-breaking rules: higher reviews, then lower rate
    for (let i = 0; i < scoredHotels.length - 1; i++) {
      const current = scoredHotels[i];
      const next = scoredHotels[i + 1];
      
      if (Math.abs(current.score - next.score) < 0.1) { // Essentially tied
        const currentReviews = current.hotel.reviews ?? 0;
        const nextReviews = next.hotel.reviews ?? 0;
        
        if (nextReviews > currentReviews) {
          // Swap for higher reviews
          [scoredHotels[i], scoredHotels[i + 1]] = [scoredHotels[i + 1], scoredHotels[i]];
        } else if (currentReviews === nextReviews) {
          // Same reviews, prefer lower rate
          const currentRate = current.hotel.rate?.nightly ?? 999999;
          const nextRate = next.hotel.rate?.nightly ?? 999999;
          
          if (nextRate < currentRate) {
            [scoredHotels[i], scoredHotels[i + 1]] = [scoredHotels[i + 1], scoredHotels[i]];
          }
        }
      }
    }
    
    // Log scoring details for all candidates
    scoredHotels.forEach((scored, index) => {
      const hotel = scored.hotel;
      const isChosen = index === 0;
      
      push({
        stage: 'scheduleOptimizer',
        subjectId: hotel.id,
        outcome: isChosen ? 'accept' : 'score',
        score: scored.score,
        reasons: [
          `Rank #${index + 1} with score ${scored.score.toFixed(1)}`,
          `Proximity: ${scored.breakdown.proximityScore.toFixed(1)}`,
          `Rating: ${scored.breakdown.ratingScore.toFixed(1)}`,
          `Cost: ${scored.breakdown.costScore.toFixed(1)}`,
          `Brand: ${scored.breakdown.brandScore.toFixed(1)}`,
          ...(isChosen ? ['SELECTED as optimal choice'] : []),
        ],
        details: {
          hotelName: hotel.name,
          rank: index + 1,
          scoreBreakdown: scored.breakdown,
          etaMinutes: hotel.etaMinutes,
          rating: hotel.rating,
          rate: hotel.rate?.nightly,
          brand: hotel.brand,
          reviews: hotel.reviews,
        },
      });
    });
    
    const chosenHotel = scoredHotels[0]?.hotel;
    
    if (chosenHotel) {
      // Final summary
      push({
        stage: 'scheduleOptimizer',
        outcome: 'accept',
        score: scoredHotels[0].score,
        reasons: [
          `Selected: ${chosenHotel.name}`,
          `Score: ${scoredHotels[0].score.toFixed(1)} (best of ${candidates.length})`,
          `${chosenHotel.etaMinutes}min to hotel`,
          `$${chosenHotel.rate?.nightly} nightly`,
          `${chosenHotel.rating}/5 rating (${chosenHotel.reviews} reviews)`,
        ],
        details: {
          selection: {
            hotelId: chosenHotel.id,
            hotelName: chosenHotel.name,
            finalScore: scoredHotels[0].score,
            alternatives: candidates.length - 1,
          },
        },
      });
    }
    
    return chosenHotel;
  } catch (error) {
    push({
      stage: 'scheduleOptimizer',
      outcome: 'reject',
      reasons: [`Error in schedule optimization: ${error instanceof Error ? error.message : 'Unknown error'}`],
    });
    throw error;
  }
}