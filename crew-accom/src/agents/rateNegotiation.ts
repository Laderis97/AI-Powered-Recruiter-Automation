// src/agents/rateNegotiation.ts

import { AgentContext } from '../context';
import { DecisionRecord, HotelCandidate } from '../data/types';

/**
 * Rate Negotiation Agent
 * Purpose: Suggest rate caps/counteroffers
 * Analyzes market rates and suggests negotiation strategies
 */

export interface NegotiationStrategy {
  targetRate: number;
  maxRate: number;
  negotiationPoints: string[];
  confidence: 'high' | 'medium' | 'low';
}

export async function rateNegotiation(
  candidates: HotelCandidate[],
  ctx: AgentContext,
  push: (r: DecisionRecord) => void
): Promise<HotelCandidate[]> {
  try {
    // Calculate market statistics
    const rates = candidates
      .map(h => h.rate?.nightly)
      .filter((rate): rate is number => rate !== undefined);
    
    if (rates.length === 0) {
      push({
        stage: 'rateNegotiation',
        outcome: 'reject',
        reasons: ['No rate data available for negotiation analysis'],
      });
      return candidates;
    }
    
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const medianRate = rates.sort((a, b) => a - b)[Math.floor(rates.length / 2)];
    
    // Analyze each hotel for negotiation opportunities
    const negotiationAnalyzed = candidates.map(hotel => {
      if (!hotel.rate) {
        return hotel;
      }
      
      const currentRate = hotel.rate.nightly;
      const negotiationPoints: string[] = [];
      let targetRate = currentRate;
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      
      // Rate comparison analysis
      if (currentRate > avgRate * 1.1) {
        const savings = currentRate - avgRate;
        targetRate = avgRate;
        negotiationPoints.push(`Rate ${savings.toFixed(0)}% above market average`);
        confidence = 'high';
      }
      
      if (currentRate > medianRate * 1.15) {
        targetRate = Math.min(targetRate, medianRate);
        negotiationPoints.push(`Rate significantly above median`);
        confidence = 'high';
      }
      
      // Volume/loyalty considerations
      if (hotel.brand && ctx.constraints.preferredBrands?.includes(hotel.brand)) {
        const corporateDiscount = currentRate * 0.1; // 10% corporate rate
        targetRate = Math.min(targetRate, currentRate - corporateDiscount);
        negotiationPoints.push(`Preferred brand - corporate rate eligible`);
        if (confidence === 'medium') confidence = 'high';
      }
      
      // Extended stay discounts (if applicable)
      negotiationPoints.push('Extended stay discount potential');
      
      // Market position leverage
      if (currentRate === maxRate) {
        negotiationPoints.push('Highest rate in market - strong negotiation position');
        confidence = 'high';
      }
      
      const strategy: NegotiationStrategy = {
        targetRate: Math.round(targetRate),
        maxRate: Math.round(currentRate * 0.95), // Never pay more than 95% of asking
        negotiationPoints,
        confidence,
      };
      
      push({
        stage: 'rateNegotiation',
        subjectId: hotel.id,
        outcome: 'score',
        score: targetRate,
        reasons: [
          `Current: $${currentRate}, Target: $${targetRate.toFixed(0)}`,
          `Potential savings: $${(currentRate - targetRate).toFixed(0)}`,
          `Confidence: ${confidence}`,
          ...negotiationPoints.slice(0, 2), // Top 2 points
        ],
        details: {
          hotelName: hotel.name,
          currentRate,
          targetRate,
          potentialSavings: currentRate - targetRate,
          strategy,
          marketPosition: {
            avgRate: avgRate.toFixed(0),
            medianRate: medianRate.toFixed(0),
            minRate,
            maxRate,
          },
        },
      });
      
      return {
        ...hotel,
        negotiationStrategy: strategy,
      };
    });
    
    // Summary of negotiation opportunities
    const totalSavings = negotiationAnalyzed.reduce((sum, hotel) => {
      const current = hotel.rate?.nightly ?? 0;
      const target = (hotel as any).negotiationStrategy?.targetRate ?? current;
      return sum + Math.max(0, current - target);
    }, 0);
    
    push({
      stage: 'rateNegotiation',
      outcome: 'accept',
      reasons: [
        `Analyzed ${candidates.length} hotels for rate negotiation`,
        `Market average: $${avgRate.toFixed(0)}`,
        `Potential total savings: $${totalSavings.toFixed(0)}`,
        `${negotiationAnalyzed.filter(h => (h as any).negotiationStrategy?.confidence === 'high').length} high-confidence opportunities`,
      ],
      details: {
        marketStats: { avgRate, minRate, maxRate, medianRate },
        totalPotentialSavings: totalSavings,
        highConfidenceCount: negotiationAnalyzed.filter(h => (h as any).negotiationStrategy?.confidence === 'high').length,
      },
    });
    
    return negotiationAnalyzed;
  } catch (error) {
    push({
      stage: 'rateNegotiation',
      outcome: 'reject',
      reasons: [`Error in rate negotiation analysis: ${error instanceof Error ? error.message : 'Unknown error'}`],
    });
    throw error;
  }
}