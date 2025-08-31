// src/agents/flightIngest.ts

import { CrewPairing, DecisionRecord } from '../data/types';
import { AgentContext } from '../context';
import { CrewPairingSchema } from '../data/schemas';

/**
 * Flight Ingest Agent
 * Purpose: Normalize flights & crew pairings
 * Validates input data and ensures consistency
 */
export async function flightIngest(
  pairing: CrewPairing,
  ctx: AgentContext,
  push: (r: DecisionRecord) => void
): Promise<CrewPairing> {
  try {
    // Validate input data structure
    const validated = CrewPairingSchema.parse(pairing);
    
    // Check for basic data completeness
    const reasons: string[] = [];
    
    if (validated.legs.length === 0) {
      push({
        stage: 'flightIngest',
        subjectId: validated.id,
        outcome: 'reject',
        reasons: ['No flight legs provided'],
      });
      throw new Error('Invalid pairing: no flight legs');
    }
    
    if (validated.members.length === 0) {
      push({
        stage: 'flightIngest',
        subjectId: validated.id,
        outcome: 'reject',
        reasons: ['No crew members provided'],
      });
      throw new Error('Invalid pairing: no crew members');
    }
    
    // Validate flight leg continuity
    for (let i = 1; i < validated.legs.length; i++) {
      const prevLeg = validated.legs[i - 1];
      const currentLeg = validated.legs[i];
      
      if (prevLeg.arrIata !== currentLeg.depIata) {
        reasons.push(`Gap between legs: ${prevLeg.arrIata} → ${currentLeg.depIata}`);
      }
      
      if (new Date(prevLeg.arrUtc) >= new Date(currentLeg.depUtc)) {
        reasons.push(`Invalid timing: leg ${i} departs before leg ${i-1} arrives`);
      }
    }
    
    // Calculate total duty time
    const dutyStart = new Date(validated.legs[0].depUtc);
    const dutyEnd = new Date(validated.legs[validated.legs.length - 1].arrUtc);
    const dutyHours = (dutyEnd.getTime() - dutyStart.getTime()) / (1000 * 60 * 60);
    
    reasons.push(`Normalized pairing ${validated.id}`);
    reasons.push(`${validated.legs.length} legs, ${validated.members.length} crew`);
    reasons.push(`Duty time: ${dutyHours.toFixed(1)} hours`);
    
    if (reasons.some(r => r.includes('Gap') || r.includes('Invalid'))) {
      push({
        stage: 'flightIngest',
        subjectId: validated.id,
        outcome: 'reject',
        reasons,
        details: { dutyHours, legs: validated.legs.length },
      });
      throw new Error('Invalid pairing structure');
    }
    
    push({
      stage: 'flightIngest',
      subjectId: validated.id,
      outcome: 'accept',
      reasons,
      details: { dutyHours, legs: validated.legs.length, crew: validated.members.length },
    });
    
    return validated;
  } catch (error) {
    push({
      stage: 'flightIngest',
      subjectId: pairing.id,
      outcome: 'reject',
      reasons: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    });
    throw error;
  }
}