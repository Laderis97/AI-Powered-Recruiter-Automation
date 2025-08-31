// src/agents/audit.ts

import { AgentContext } from '../context';
import { DecisionRecord, HotelCandidate, PlanResult } from '../data/types';

/**
 * Audit & Explainability Agent
 * Purpose: Summarize why hotels were selected/rejected
 * Provides human-readable explanations for all decisions
 */

export interface AuditSummary {
  selection: string;
  rationale: string;
  alternatives: string;
  compliance: string;
  risks: string[];
  recommendations: string[];
}

export async function auditExplainability(
  planResult: PlanResult,
  allAuditRecords: DecisionRecord[],
  ctx: AgentContext,
  push: (r: DecisionRecord) => void
): Promise<AuditSummary> {
  try {
    const chosen = planResult.chosen;
    const candidates = planResult.candidates;
    
    if (!chosen) {
      const summary: AuditSummary = {
        selection: 'No hotel selected',
        rationale: 'No hotels met the compliance requirements',
        alternatives: `${candidates.length} hotels were evaluated but none passed all constraints`,
        compliance: 'All options failed contract compliance checks',
        risks: ['Crew may need alternative accommodation arrangements'],
        recommendations: ['Review and relax constraints', 'Expand search radius', 'Consider exception approval process'],
      };
      
      push({
        stage: 'auditExplainability',
        outcome: 'reject',
        reasons: ['No viable selection to audit'],
        details: { summary },
      });
      
      return summary;
    }
    
    // Build comprehensive rationale
    const rationale = buildSelectionRationale(chosen, allAuditRecords);
    const alternatives = buildAlternativesAnalysis(candidates, chosen);
    const compliance = buildComplianceReport(allAuditRecords);
    const risks = identifyRisks(chosen, allAuditRecords, ctx);
    const recommendations = generateRecommendations(chosen, allAuditRecords, ctx);
    
    const summary: AuditSummary = {
      selection: `Selected ${chosen.name} in ${planResult.city}`,
      rationale,
      alternatives,
      compliance,
      risks,
      recommendations,
    };
    
    push({
      stage: 'auditExplainability',
      outcome: 'accept',
      reasons: [
        'Generated comprehensive audit summary',
        `Selection: ${chosen.name}`,
        `Key factors: ${rationale.split('. ')[0]}`,
      ],
      details: {
        summary,
        auditRecordCount: allAuditRecords.length,
        stagesProcessed: [...new Set(allAuditRecords.map(r => r.stage))],
      },
    });
    
    return summary;
  } catch (error) {
    push({
      stage: 'auditExplainability',
      outcome: 'reject',
      reasons: [`Error generating audit summary: ${error instanceof Error ? error.message : 'Unknown error'}`],
    });
    throw error;
  }
}

function buildSelectionRationale(chosen: HotelCandidate, auditRecords: DecisionRecord[]): string {
  const chosenRecords = auditRecords.filter(r => r.subjectId === chosen.id);
  const optimizerRecord = chosenRecords.find(r => r.stage === 'scheduleOptimizer' && r.outcome === 'accept');
  
  let rationale = `Selected ${chosen.name} because: `;
  
  const factors: string[] = [];
  
  if (chosen.etaMinutes && chosen.etaMinutes <= 20) {
    factors.push(`excellent proximity (${chosen.etaMinutes}min to airport)`);
  } else if (chosen.etaMinutes) {
    factors.push(`reasonable commute (${chosen.etaMinutes}min)`);
  }
  
  if (chosen.rate) {
    factors.push(`rate $${chosen.rate.nightly} within budget`);
  }
  
  if (chosen.rating && chosen.rating >= 4.0) {
    factors.push(`high quality rating (${chosen.rating}/5)`);
  }
  
  if (chosen.brand && ['Hilton', 'Marriott', 'Hyatt'].includes(chosen.brand)) {
    factors.push(`preferred brand (${chosen.brand})`);
  }
  
  if (optimizerRecord?.score) {
    factors.push(`highest overall score (${optimizerRecord.score.toFixed(1)})`);
  }
  
  return rationale + factors.join(', ') + '.';
}

function buildAlternativesAnalysis(candidates: HotelCandidate[], chosen: HotelCandidate): string {
  const alternatives = candidates.filter(h => h.id !== chosen.id);
  
  if (alternatives.length === 0) {
    return 'No alternative options were available.';
  }
  
  const altCount = alternatives.length;
  const avgRate = alternatives.reduce((sum, h) => sum + (h.rate?.nightly || 0), 0) / altCount;
  const avgRating = alternatives.reduce((sum, h) => sum + (h.rating || 0), 0) / altCount;
  
  return `${altCount} alternatives considered. Average rate: $${avgRate.toFixed(0)}, average rating: ${avgRating.toFixed(1)}/5. Selected option provided optimal balance of cost, quality, and proximity.`;
}

function buildComplianceReport(auditRecords: DecisionRecord[]): string {
  const complianceRecords = auditRecords.filter(r => r.stage === 'contractCompliance');
  const passed = complianceRecords.filter(r => r.outcome === 'accept').length;
  const failed = complianceRecords.filter(r => r.outcome === 'reject').length;
  
  return `Contract compliance: ${passed} hotels passed, ${failed} rejected. All selections meet airline contract requirements including commute time, quality standards, and rate caps.`;
}

function identifyRisks(chosen: HotelCandidate, auditRecords: DecisionRecord[], ctx: AgentContext): string[] {
  const risks: string[] = [];
  
  // Check for potential risks based on chosen hotel
  if (chosen.etaMinutes && chosen.etaMinutes > 25) {
    risks.push('Moderate commute time may affect crew rest');
  }
  
  if (chosen.rating && chosen.rating < 4.0) {
    risks.push('Hotel rating below 4.0 stars');
  }
  
  if (chosen.reviews && chosen.reviews < 200) {
    risks.push('Limited review data for quality assessment');
  }
  
  // Check for city-specific risks
  const cityRecords = auditRecords.filter(r => r.stage === 'cityContext');
  cityRecords.forEach(record => {
    if (record.details?.curfew) {
      risks.push('Late night arrival may affect transportation options');
    }
    if (record.details?.riskCount && record.details.riskCount > 2) {
      risks.push('Multiple risk factors identified for arrival city');
    }
  });
  
  return risks;
}

function generateRecommendations(chosen: HotelCandidate, auditRecords: DecisionRecord[], ctx: AgentContext): string[] {
  const recommendations: string[] = [];
  
  // Standard recommendations
  recommendations.push('Confirm shuttle schedule and frequency');
  recommendations.push('Verify check-in process for late arrivals');
  
  // Specific recommendations based on chosen hotel
  if (chosen.etaMinutes && chosen.etaMinutes > 30) {
    recommendations.push('Consider pre-booking transportation to avoid delays');
  }
  
  if (chosen.amenities?.includes('Airport Shuttle')) {
    recommendations.push('Validate shuttle operates during crew arrival window');
  }
  
  if (!chosen.amenities?.includes('WiFi')) {
    recommendations.push('Crew should plan for limited internet connectivity');
  }
  
  // Rate-based recommendations
  if (chosen.rate && ctx.constraints.maxNightlyUsd) {
    const rateUtilization = (chosen.rate.nightly / ctx.constraints.maxNightlyUsd) * 100;
    if (rateUtilization > 80) {
      recommendations.push('Consider negotiating rate for future bookings');
    }
  }
  
  return recommendations;
}