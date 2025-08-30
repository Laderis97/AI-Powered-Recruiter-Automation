// src/agents/contractCompliance.ts

import { AgentContext } from '../context';
import { DecisionRecord, HotelCandidate } from '../data/types';

/**
 * Contract Compliance Agent
 * Purpose: Enforce rules (e.g., max time-to-hotel, rating minimums, rate caps)
 * Filters out hotels that violate airline contract constraints
 */
export async function contractCompliance(
  candidates: HotelCandidate[],
  ctx: AgentContext,
  push: (r: DecisionRecord) => void
): Promise<HotelCandidate[]> {
  try {
    const compliantHotels: HotelCandidate[] = [];
    const constraints = ctx.constraints;
    
    let totalProcessed = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (const hotel of candidates) {
      totalProcessed++;
      const violations: string[] = [];
      const reasons: string[] = [];
      
      // Check maximum commute time
      if (constraints.maxCommuteMinutes && (hotel.etaMinutes ?? 999) > constraints.maxCommuteMinutes) {
        violations.push(`ETA ${hotel.etaMinutes}min > max ${constraints.maxCommuteMinutes}min`);
      }
      
      // Check minimum hotel rating
      if (constraints.minHotelRating && (hotel.rating ?? 0) < constraints.minHotelRating) {
        violations.push(`Rating ${hotel.rating} < minimum ${constraints.minHotelRating}`);
      }
      
      // Check maximum nightly rate
      if (constraints.maxNightlyUsd && (hotel.rate?.nightly ?? 999999) > constraints.maxNightlyUsd) {
        violations.push(`Rate $${hotel.rate?.nightly} > max $${constraints.maxNightlyUsd}`);
      }
      
      // Check minimum reviews count
      if (constraints.minReviews && (hotel.reviews ?? 0) < constraints.minReviews) {
        violations.push(`Reviews ${hotel.reviews} < minimum ${constraints.minReviews}`);
      }
      
      // Check blacklist
      if (constraints.blacklistHotels?.includes(hotel.id)) {
        violations.push('Hotel is blacklisted');
      }
      
      // Determine compliance status
      const isCompliant = violations.length === 0;
      
      if (isCompliant) {
        compliantHotels.push(hotel);
        totalPassed++;
        
        reasons.push('Passes all contract constraints');
        
        // Add positive notes
        if (constraints.preferredBrands?.includes(hotel.brand || '')) {
          reasons.push('Preferred brand match');
        }
        
        if (hotel.rating && hotel.rating >= 4.0) {
          reasons.push('High quality rating');
        }
        
        if (hotel.etaMinutes && hotel.etaMinutes <= 20) {
          reasons.push('Excellent proximity to airport');
        }
        
        push({
          stage: 'contractCompliance',
          subjectId: hotel.id,
          outcome: 'accept',
          reasons,
          details: {
            hotelName: hotel.name,
            brand: hotel.brand,
            rating: hotel.rating,
            etaMinutes: hotel.etaMinutes,
            rate: hotel.rate?.nightly,
            preferredBrand: constraints.preferredBrands?.includes(hotel.brand || ''),
          },
        });
      } else {
        totalFailed++;
        
        push({
          stage: 'contractCompliance',
          subjectId: hotel.id,
          outcome: 'reject',
          reasons: violations,
          details: {
            hotelName: hotel.name,
            violationCount: violations.length,
            etaMinutes: hotel.etaMinutes,
            rating: hotel.rating,
            rate: hotel.rate?.nightly,
          },
        });
      }
    }
    
    // Summary audit record
    push({
      stage: 'contractCompliance',
      outcome: 'score',
      score: totalPassed,
      reasons: [
        `Processed ${totalProcessed} hotels`,
        `${totalPassed} compliant, ${totalFailed} rejected`,
        `Compliance rate: ${totalProcessed > 0 ? Math.round((totalPassed / totalProcessed) * 100) : 0}%`,
      ],
      details: {
        totalProcessed,
        totalPassed,
        totalFailed,
        complianceRate: totalProcessed > 0 ? (totalPassed / totalProcessed) * 100 : 0,
        appliedConstraints: {
          maxCommuteMinutes: constraints.maxCommuteMinutes,
          minHotelRating: constraints.minHotelRating,
          maxNightlyUsd: constraints.maxNightlyUsd,
          minReviews: constraints.minReviews,
          preferredBrands: constraints.preferredBrands?.length || 0,
          blacklistCount: constraints.blacklistHotels?.length || 0,
        },
      },
    });
    
    return compliantHotels;
  } catch (error) {
    push({
      stage: 'contractCompliance',
      outcome: 'reject',
      reasons: [`Error in compliance check: ${error instanceof Error ? error.message : 'Unknown error'}`],
    });
    throw error;
  }
}