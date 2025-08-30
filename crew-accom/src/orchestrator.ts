// src/orchestrator.ts

import { AgentContext } from './context';
import { CrewPairing, PlanResult, HotelCandidate, DecisionRecord } from './data/types';

// Import all agents
import { flightIngest } from './agents/flightIngest';
import { cityContext } from './agents/cityContext';
import { hotelSourcing } from './agents/hotelSourcing';
import { geoDistance } from './agents/geoDistance';
import { contractCompliance } from './agents/contractCompliance';
import { scheduleOptimizer } from './agents/scheduleOptimizer';
import { preference } from './agents/preference';
import { rateNegotiation } from './agents/rateNegotiation';
import { auditExplainability } from './agents/audit';

/**
 * Main Orchestrator
 * Manages the multi-agent pipeline for crew accommodation planning
 */
export async function planLayover(
  pairing: CrewPairing,
  ctx: AgentContext
): Promise<PlanResult> {
  const audit: DecisionRecord[] = [];
  const push = (r: DecisionRecord) => {
    audit.push(r);
    ctx.log(r);
  };
  
  try {
    // Start orchestration audit
    push({
      stage: 'orchestrator',
      subjectId: pairing.id,
      outcome: 'accept',
      reasons: ['Starting layover planning pipeline'],
      details: {
        pairingId: pairing.id,
        crewCount: pairing.members.length,
        legCount: pairing.legs.length,
        startTime: ctx.nowUtc,
      },
    });
    
    console.log(`\n🛫 Starting layover planning for pairing ${pairing.id}`);
    console.log(`Crew: ${pairing.members.length} members, ${pairing.legs.length} legs`);
    
    // Step 1: Normalize and validate flight data
    console.log('\n📋 Step 1: Flight Ingest');
    const normalized = await flightIngest(pairing, ctx, push);
    
    // Step 2: Determine city context and risk factors  
    console.log('\n🏙️ Step 2: City Context Analysis');
    const city = await cityContext(normalized, ctx, push);
    
    // Step 3: Source candidate hotels
    console.log('\n🏨 Step 3: Hotel Sourcing');
    const sourced = await hotelSourcing(city, ctx, push);
    
    // Step 4: Calculate travel times and distances
    console.log('\n📍 Step 4: Geo Distance Calculation');
    const withTimes: HotelCandidate[] = await geoDistance(city, sourced, ctx, push);
    
    // Step 5: Apply contract compliance filters
    console.log('\n✅ Step 5: Contract Compliance Check');
    const compliant = await contractCompliance(withTimes, ctx, push);
    
    // Step 6: Apply preference scoring
    console.log('\n⭐ Step 6: Preference Analysis');
    const withPreferences = await preference(compliant, ctx, push);
    
    // Step 7: Analyze rate negotiation opportunities
    console.log('\n💰 Step 7: Rate Negotiation Analysis');
    const withNegotiation = await rateNegotiation(withPreferences, ctx, push);
    
    // Step 8: Select optimal hotel
    console.log('\n🎯 Step 8: Schedule Optimization');
    const chosen = await scheduleOptimizer(withNegotiation, ctx, push);
    
    // Create initial plan result
    const planResult: PlanResult = {
      city: city.city,
      arrAirport: city.arrAirport,
      candidates: withNegotiation,
      chosen,
      audit,
    };
    
    // Step 9: Generate audit summary and explanations
    console.log('\n📊 Step 9: Audit & Explainability');
    const auditSummary = await auditExplainability(planResult, audit, ctx, push);
    
    // Final orchestrator summary
    push({
      stage: 'orchestrator',
      subjectId: pairing.id,
      outcome: chosen ? 'accept' : 'reject',
      reasons: [
        'Completed layover planning pipeline',
        `Result: ${chosen ? `Selected ${chosen.name}` : 'No viable options'}`,
        `Total decisions: ${audit.length}`,
        `Processing time: ${Date.now() - new Date(ctx.nowUtc).getTime()}ms`,
      ],
      details: {
        pairingId: pairing.id,
        city: city.city,
        candidatesEvaluated: sourced.length,
        compliantOptions: compliant.length,
        selected: chosen ? {
          hotelId: chosen.id,
          hotelName: chosen.name,
          etaMinutes: chosen.etaMinutes,
          rate: chosen.rate?.nightly,
          rating: chosen.rating,
        } : null,
        auditSummary,
        endTime: new Date().toISOString(),
      },
    });
    
    console.log(`\n✅ Planning complete!`);
    if (chosen) {
      console.log(`Selected: ${chosen.name}`);
      console.log(`Location: ${chosen.address}`);
      console.log(`Travel time: ${chosen.etaMinutes} minutes`);
      console.log(`Rate: $${chosen.rate?.nightly}/night`);
      console.log(`Rating: ${chosen.rating}/5 (${chosen.reviews} reviews)`);
    } else {
      console.log(`❌ No suitable accommodation found`);
    }
    
    return planResult;
  } catch (error) {
    push({
      stage: 'orchestrator',
      subjectId: pairing.id,
      outcome: 'reject',
      reasons: [`Pipeline error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stage: 'orchestrator',
        timestamp: new Date().toISOString(),
      },
    });
    
    console.error(`\n❌ Pipeline failed:`, error);
    throw error;
  }
}