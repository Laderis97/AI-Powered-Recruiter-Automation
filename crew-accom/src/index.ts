// src/index.ts

import * as dotenv from 'dotenv';
import { planLayover } from './orchestrator';
import { createContext } from './context';
import flightsData from './data/samples/flights.sample.json';
import constraintsData from './data/samples/constraints.sample.json';
import { CrewPairing, Constraints } from './data/types';

// Load environment variables
dotenv.config();

/**
 * Demo application for Crew Accommodations Planner
 * Demonstrates the multi-agent system in action
 */
async function demo() {
  console.log('🚁 Crew Accommodations Planner - Multi-Agent MVP');
  console.log('=' .repeat(60));
  
  try {
    // Load sample data
    const flights = flightsData as CrewPairing[];
    const constraints = constraintsData as Constraints;
    
    console.log(`\n📊 Loaded ${flights.length} sample pairings`);
    console.log('Constraints:', {
      maxCommute: `${constraints.maxCommuteMinutes}min`,
      minRating: `${constraints.minHotelRating}/5`,
      maxRate: `$${constraints.maxNightlyUsd}`,
      preferredBrands: constraints.preferredBrands?.join(', '),
    });
    
    // Process each pairing
    for (let i = 0; i < flights.length; i++) {
      const pairing = flights[i];
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🛫 Processing Pairing ${i + 1}/${flights.length}: ${pairing.id}`);
      console.log(`${'='.repeat(60)}`);
      
      // Create fresh context for each pairing
      const ctx = createContext(constraints);
      
      try {
        // Run the planning pipeline
        const result = await planLayover(pairing, ctx);
        
        // Display results
        console.log(`\n📋 PLANNING SUMMARY`);
        console.log(`${'─'.repeat(40)}`);
        console.log(`City: ${result.city}`);
        console.log(`Airport: ${result.arrAirport}`);
        console.log(`Candidates evaluated: ${result.candidates.length}`);
        
        if (result.chosen) {
          console.log(`\n🏆 SELECTED HOTEL`);
          console.log(`${'─'.repeat(40)}`);
          console.log(`Hotel: ${result.chosen.name}`);
          console.log(`Brand: ${result.chosen.brand || 'Independent'}`);
          console.log(`Rating: ${result.chosen.rating}/5 (${result.chosen.reviews} reviews)`);
          console.log(`Address: ${result.chosen.address}`);
          console.log(`Distance: ${result.chosen.distanceKm}km`);
          console.log(`Travel time: ${result.chosen.etaMinutes} minutes`);
          console.log(`Rate: $${result.chosen.rate?.nightly}/night + $${result.chosen.rate?.taxesFees || 0} taxes`);
          
          if (result.chosen.amenities && result.chosen.amenities.length > 0) {
            console.log(`Amenities: ${result.chosen.amenities.join(', ')}`);
          }
        } else {
          console.log(`\n❌ NO SUITABLE HOTEL FOUND`);
          console.log(`${'─'.repeat(40)}`);
          console.log('Consider adjusting constraints or expanding search area');
        }
        
        // Show audit summary
        console.log(`\n📈 AUDIT SUMMARY`);
        console.log(`${'─'.repeat(40)}`);
        console.log(`Total decisions: ${result.audit.length}`);
        
        const stageCount = result.audit.reduce((acc, record) => {
          acc[record.stage] = (acc[record.stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        Object.entries(stageCount).forEach(([stage, count]) => {
          console.log(`${stage}: ${count} decisions`);
        });
        
        const acceptCount = result.audit.filter(r => r.outcome === 'accept').length;
        const rejectCount = result.audit.filter(r => r.outcome === 'reject').length;
        const scoreCount = result.audit.filter(r => r.outcome === 'score').length;
        
        console.log(`Outcomes: ${acceptCount} accept, ${rejectCount} reject, ${scoreCount} score`);
        
      } catch (error) {
        console.error(`\n❌ Error processing pairing ${pairing.id}:`, error);
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 Demo completed successfully!');
    console.log(`${'='.repeat(60)}`);
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { demo, planLayover };