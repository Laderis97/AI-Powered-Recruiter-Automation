// src/agents/preference.ts

import { AgentContext } from '../context';
import { DecisionRecord, HotelCandidate } from '../data/types';

/**
 * Preference Agent
 * Purpose: Model airline/union/crew preferences
 * Applies preference weights and personalization rules
 */

export interface PreferenceWeights {
  brands: Record<string, number>; // brand -> weight (0-10)
  amenities: Record<string, number>; // amenity -> weight
  proximity: number; // weight for distance factor
  cost: number; // weight for cost factor
  quality: number; // weight for rating/reviews
}

export async function preference(
  candidates: HotelCandidate[],
  ctx: AgentContext,
  push: (r: DecisionRecord) => void
): Promise<HotelCandidate[]> {
  try {
    // Default preference weights (can be customized per airline/crew)
    const weights: PreferenceWeights = {
      brands: {
        'Hilton': 8,
        'Marriott': 7,
        'Hyatt': 9,
        'Sheraton': 6,
        'Independent': 3,
      },
      amenities: {
        'Airport Shuttle': 10,
        'WiFi': 8,
        'Fitness Center': 5,
        'Pool': 4,
        'Restaurant': 6,
        'Business Center': 7,
      },
      proximity: 0.4,
      cost: 0.3,
      quality: 0.3,
    };
    
    // Apply preference scoring
    const preferenceScored = candidates.map(hotel => {
      let preferenceScore = 0;
      const details: string[] = [];
      
      // Brand preference
      const brandWeight = weights.brands[hotel.brand || 'Independent'] || 0;
      preferenceScore += brandWeight;
      if (brandWeight > 0) {
        details.push(`Brand ${hotel.brand}: +${brandWeight}`);
      }
      
      // Amenity preferences
      let amenityScore = 0;
      if (hotel.amenities) {
        for (const amenity of hotel.amenities) {
          const weight = weights.amenities[amenity] || 0;
          amenityScore += weight;
          if (weight > 0) {
            details.push(`${amenity}: +${weight}`);
          }
        }
      }
      preferenceScore += amenityScore * 0.1; // Scale down amenity impact
      
      // Crew seniority considerations (placeholder for future enhancement)
      // Senior crew might prefer premium brands, junior crew might prefer cost savings
      
      push({
        stage: 'preference',
        subjectId: hotel.id,
        outcome: 'score',
        score: preferenceScore,
        reasons: [
          `Preference score: ${preferenceScore.toFixed(1)}`,
          ...details,
        ],
        details: {
          hotelName: hotel.name,
          brandWeight,
          amenityScore,
          totalPreferenceScore: preferenceScore,
        },
      });
      
      return {
        ...hotel,
        preferenceScore,
      };
    });
    
    // Sort by preference score (highest first)
    preferenceScored.sort((a, b) => (b.preferenceScore || 0) - (a.preferenceScore || 0));
    
    push({
      stage: 'preference',
      outcome: 'accept',
      reasons: [
        `Applied preference scoring to ${candidates.length} hotels`,
        `Top choice: ${preferenceScored[0]?.name} (score: ${preferenceScored[0]?.preferenceScore?.toFixed(1)})`,
      ],
      details: {
        processedCount: candidates.length,
        topScore: preferenceScored[0]?.preferenceScore,
        weights,
      },
    });
    
    return preferenceScored;
  } catch (error) {
    push({
      stage: 'preference',
      outcome: 'reject',
      reasons: [`Error in preference analysis: ${error instanceof Error ? error.message : 'Unknown error'}`],
    });
    throw error;
  }
}