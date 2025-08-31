// src/services/supabase.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CrewPairing, Hotel, HotelCandidate, DecisionRecord, Constraints } from '../data/types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export class SupabaseService {
  private client: SupabaseClient;
  private adminClient?: SupabaseClient;

  constructor(config: SupabaseConfig) {
    // Public client for authenticated requests
    this.client = createClient(config.url, config.anonKey);
    
    // Admin client for service operations (bypasses RLS)
    if (config.serviceRoleKey) {
      this.adminClient = createClient(config.url, config.serviceRoleKey);
    }
  }

  /**
   * Get viable hotels for a pairing using the database function
   */
  async getViableHotels(pairingId: string): Promise<HotelCandidate[]> {
    const { data, error } = await this.client
      .rpc('get_viable_hotels', { p_pairing_id: pairingId });

    if (error) {
      throw new Error(`Failed to get viable hotels: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.hotel_id,
      name: row.hotel_name,
      brand: row.brand,
      rating: row.rating,
      reviews: row.reviews,
      lat: 0, // Would be populated from hotel details
      lon: 0,
      address: '', // Would be populated from hotel details
      distanceKm: row.distance_km,
      etaMinutes: row.eta_minutes,
      rate: {
        hotelId: row.hotel_id,
        currency: 'USD',
        nightly: row.nightly,
        taxesFees: 0,
      },
    }));
  }

  /**
   * Save a crew pairing to the database
   */
  async savePairing(pairing: CrewPairing, airlineId: string): Promise<string> {
    // Insert pairing
    const { data: pairingData, error: pairingError } = await this.client
      .from('pairings')
      .insert({
        airline_id: airlineId,
        external_id: pairing.id,
        duty_start: pairing.legs[0]?.depUtc,
        duty_end: pairing.legs[pairing.legs.length - 1]?.arrUtc,
        status: 'planning',
        metadata: {
          originalPairing: pairing,
        },
      })
      .select('id')
      .single();

    if (pairingError) {
      throw new Error(`Failed to save pairing: ${pairingError.message}`);
    }

    const dbPairingId = pairingData.id;

    // Insert legs
    const legsData = pairing.legs.map((leg, index) => ({
      pairing_id: dbPairingId,
      carrier: leg.carrier,
      flight_no: leg.flightNo,
      dep_iata: leg.depIata,
      arr_iata: leg.arrIata,
      dep_utc: leg.depUtc,
      arr_utc: leg.arrUtc,
      equipment: leg.equipment,
      leg_order: index + 1,
    }));

    const { error: legsError } = await this.client
      .from('legs')
      .insert(legsData);

    if (legsError) {
      throw new Error(`Failed to save legs: ${legsError.message}`);
    }

    return dbPairingId;
  }

  /**
   * Save decision records for audit trail
   */
  async saveDecisions(pairingId: string, decisions: DecisionRecord[]): Promise<void> {
    const decisionsData = decisions.map(decision => ({
      pairing_id: pairingId,
      stage: decision.stage,
      subject_type: decision.subjectId ? 'hotel' : 'system',
      subject_id: decision.subjectId,
      outcome: decision.outcome,
      score: decision.score,
      reasons: decision.reasons,
      details: decision.details || {},
    }));

    const { error } = await this.client
      .from('decisions')
      .insert(decisionsData);

    if (error) {
      throw new Error(`Failed to save decisions: ${error.message}`);
    }
  }

  /**
   * Save hotel selection result
   */
  async saveHotelSelection(
    pairingId: string,
    hotelId: string,
    score: number,
    reason: string,
    checkIn: string,
    checkOut: string,
    totalCost: number
  ): Promise<void> {
    const { error } = await this.client
      .from('hotel_selections')
      .insert({
        pairing_id: pairingId,
        hotel_id: hotelId,
        selection_score: score,
        selection_reason: reason,
        check_in: checkIn,
        check_out: checkOut,
        total_cost: totalCost,
        booking_status: 'planned',
      });

    if (error) {
      throw new Error(`Failed to save hotel selection: ${error.message}`);
    }
  }

  /**
   * Get active constraints for an airline
   */
  async getActiveConstraints(airlineId: string): Promise<Constraints | null> {
    const { data, error } = await this.client
      .rpc('get_active_constraints', { p_airline_id: airlineId });

    if (error) {
      console.warn(`Failed to get constraints: ${error.message}`);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      maxCommuteMinutes: data.max_commute_minutes,
      minHotelRating: data.min_hotel_rating,
      maxNightlyUsd: data.max_nightly_usd,
      preferredBrands: data.preferred_brands || [],
      blacklistHotels: data.blacklisted_hotels || [],
      minRestHours: data.min_rest_hours,
      sameHotelForCrew: data.same_hotel_for_crew,
      minReviews: data.min_reviews,
    };
  }

  /**
   * Create a planning session and return session ID
   */
  async createPlanningSession(pairingId: string): Promise<string> {
    const { data, error } = await this.client
      .rpc('create_planning_session', { p_pairing_id: pairingId });

    if (error) {
      throw new Error(`Failed to create planning session: ${error.message}`);
    }

    return data;
  }

  /**
   * Complete a planning session with results
   */
  async completePlanningSession(
    sessionId: string,
    metrics: {
      processingTimeMs: number;
      agentsExecuted: string[];
      decisionsCount: number;
      candidatesEvaluated: number;
      compliantOptions: number;
      success: boolean;
      selectionScore?: number;
      failureReason?: string;
    }
  ): Promise<void> {
    const { error } = await this.client
      .rpc('complete_planning_session', {
        p_session_id: sessionId,
        p_processing_time_ms: metrics.processingTimeMs,
        p_agents_executed: metrics.agentsExecuted,
        p_decisions_count: metrics.decisionsCount,
        p_candidates_evaluated: metrics.candidatesEvaluated,
        p_compliant_options: metrics.compliantOptions,
        p_success: metrics.success,
        p_selection_score: metrics.selectionScore,
        p_failure_reason: metrics.failureReason,
      });

    if (error) {
      throw new Error(`Failed to complete planning session: ${error.message}`);
    }
  }

  /**
   * Get planning analytics for an airline
   */
  async getPlanningAnalytics(airlineId: string): Promise<{
    totalPlannings: number;
    successRate: number;
    avgProcessingTime: number;
    topPerformingAgents: string[];
  }> {
    const { data, error } = await this.client
      .from('planning_success_rates')
      .select('*')
      .eq('airline_code', airlineId) // Assuming airline_code matches ID for simplicity
      .single();

    if (error || !data) {
      return {
        totalPlannings: 0,
        successRate: 0,
        avgProcessingTime: 0,
        topPerformingAgents: [],
      };
    }

    return {
      totalPlannings: data.total_plannings,
      successRate: data.success_rate_percent,
      avgProcessingTime: data.avg_processing_time_ms,
      topPerformingAgents: [], // Would be calculated from decisions table
    };
  }

  /**
   * Call ETA edge function
   */
  async calculateETAs(
    pairingId: string,
    airportIata: string,
    hotelIds: string[],
    window: { startUtc: string; endUtc: string },
    mode: 'drive' | 'transit' | 'shuttle' | 'walk' = 'drive'
  ): Promise<Array<{ hotelId: string; minutes: number; distanceKm: number }>> {
    const { data, error } = await this.client.functions.invoke('eta', {
      body: {
        pairingId,
        airportIata,
        hotelIds,
        window,
        mode,
      },
    });

    if (error) {
      throw new Error(`ETA calculation failed: ${error.message}`);
    }

    return data.results || [];
  }

  /**
   * Call hotel sourcing edge function
   */
  async sourceHotels(
    city: string,
    checkIn: string,
    checkOut: string,
    airlineId: string,
    constraints?: Partial<Constraints>
  ): Promise<HotelCandidate[]> {
    const { data, error } = await this.client.functions.invoke('hotel-source', {
      body: {
        city,
        checkIn,
        checkOut,
        airlineId,
        constraints,
      },
    });

    if (error) {
      throw new Error(`Hotel sourcing failed: ${error.message}`);
    }

    return data.hotels || [];
  }

  /**
   * Health check for Supabase connection
   */
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    
    try {
      const { error } = await this.client
        .from('airlines')
        .select('count')
        .limit(1);

      const latency = Date.now() - start;

      return {
        status: error ? 'error' : 'healthy',
        latency,
      };
    } catch (error) {
      return {
        status: 'error',
        latency: Date.now() - start,
      };
    }
  }

  /**
   * Get client for direct usage
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Get admin client for service operations
   */
  getAdminClient(): SupabaseClient {
    if (!this.adminClient) {
      throw new Error('Admin client not configured - service role key required');
    }
    return this.adminClient;
  }
}

// Factory function to create Supabase service from environment
export function createSupabaseService(): SupabaseService {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase configuration missing: SUPABASE_URL and SUPABASE_ANON_KEY required');
  }

  return new SupabaseService({
    url,
    anonKey,
    serviceRoleKey,
  });
}