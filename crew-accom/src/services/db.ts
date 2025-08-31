// src/services/db.ts

import { CrewPairing, Hotel, Airport, DecisionRecord, Constraints } from '../data/types';

/**
 * Database Service
 * Purpose: Data persistence layer
 * MVP uses in-memory storage; production would use Supabase/PostgreSQL
 */

export class DatabaseService {
  private pairings = new Map<string, CrewPairing>();
  private hotels = new Map<string, Hotel>();
  private airports = new Map<string, Airport>();
  private decisions = new Map<string, DecisionRecord[]>();
  private constraints = new Map<string, Constraints>();
  
  constructor() {
    console.log('🗄️ DatabaseService initialized (in-memory MVP)');
  }
  
  // === CREW PAIRINGS ===
  
  async savePairing(pairing: CrewPairing): Promise<void> {
    this.pairings.set(pairing.id, pairing);
  }
  
  async getPairing(id: string): Promise<CrewPairing | null> {
    return this.pairings.get(id) || null;
  }
  
  async getAllPairings(): Promise<CrewPairing[]> {
    return Array.from(this.pairings.values());
  }
  
  // === HOTELS ===
  
  async saveHotel(hotel: Hotel): Promise<void> {
    this.hotels.set(hotel.id, hotel);
  }
  
  async getHotel(id: string): Promise<Hotel | null> {
    return this.hotels.get(id) || null;
  }
  
  async getHotelsByCity(city: string): Promise<Hotel[]> {
    return Array.from(this.hotels.values()).filter(
      hotel => hotel.address.toLowerCase().includes(city.toLowerCase())
    );
  }
  
  async getAllHotels(): Promise<Hotel[]> {
    return Array.from(this.hotels.values());
  }
  
  // === AIRPORTS ===
  
  async saveAirport(airport: Airport): Promise<void> {
    this.airports.set(airport.iata, airport);
  }
  
  async getAirport(iata: string): Promise<Airport | null> {
    return this.airports.get(iata) || null;
  }
  
  async getAllAirports(): Promise<Airport[]> {
    return Array.from(this.airports.values());
  }
  
  // === DECISION AUDIT ===
  
  async saveDecisions(pairingId: string, decisions: DecisionRecord[]): Promise<void> {
    this.decisions.set(pairingId, decisions);
  }
  
  async getDecisions(pairingId: string): Promise<DecisionRecord[]> {
    return this.decisions.get(pairingId) || [];
  }
  
  async getAllDecisions(): Promise<Record<string, DecisionRecord[]>> {
    const result: Record<string, DecisionRecord[]> = {};
    for (const [id, decisions] of this.decisions.entries()) {
      result[id] = decisions;
    }
    return result;
  }
  
  // === CONSTRAINTS ===
  
  async saveConstraints(airlineId: string, constraints: Constraints): Promise<void> {
    this.constraints.set(airlineId, constraints);
  }
  
  async getConstraints(airlineId: string): Promise<Constraints | null> {
    return this.constraints.get(airlineId) || null;
  }
  
  // === BULK OPERATIONS ===
  
  async bulkLoadHotels(hotels: Hotel[]): Promise<void> {
    for (const hotel of hotels) {
      await this.saveHotel(hotel);
    }
    console.log(`📦 Bulk loaded ${hotels.length} hotels`);
  }
  
  async bulkLoadAirports(airports: Airport[]): Promise<void> {
    for (const airport of airports) {
      await this.saveAirport(airport);
    }
    console.log(`📦 Bulk loaded ${airports.length} airports`);
  }
  
  // === ANALYTICS ===
  
  async getProcessingStats(): Promise<{
    totalPairings: number;
    totalDecisions: number;
    avgDecisionsPerPairing: number;
    topStages: Array<{ stage: string; count: number }>;
  }> {
    const totalPairings = this.pairings.size;
    const allDecisions = Array.from(this.decisions.values()).flat();
    const totalDecisions = allDecisions.length;
    
    // Count decisions by stage
    const stageCount = allDecisions.reduce((acc, decision) => {
      acc[decision.stage] = (acc[decision.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topStages = Object.entries(stageCount)
      .map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalPairings,
      totalDecisions,
      avgDecisionsPerPairing: totalPairings > 0 ? totalDecisions / totalPairings : 0,
      topStages,
    };
  }
  
  /**
   * Clear all data (useful for testing)
   */
  async clearAll(): Promise<void> {
    this.pairings.clear();
    this.hotels.clear();
    this.airports.clear();
    this.decisions.clear();
    this.constraints.clear();
    console.log('🧹 Database cleared');
  }
  
  /**
   * Export all data for backup/analysis
   */
  async exportData(): Promise<{
    pairings: CrewPairing[];
    hotels: Hotel[];
    airports: Airport[];
    decisions: Record<string, DecisionRecord[]>;
    constraints: Record<string, Constraints>;
    exportedAt: string;
  }> {
    return {
      pairings: Array.from(this.pairings.values()),
      hotels: Array.from(this.hotels.values()),
      airports: Array.from(this.airports.values()),
      decisions: Object.fromEntries(this.decisions.entries()),
      constraints: Object.fromEntries(this.constraints.entries()),
      exportedAt: new Date().toISOString(),
    };
  }
}