// src/services/maps.ts

import { TravelTime, IATA, HotelId } from '../data/types';

/**
 * Maps Service
 * Purpose: Interface with mapping APIs for real-time travel calculations
 * MVP uses haversine fallback; production would integrate Google Maps, HERE, etc.
 */

export interface MapsConfig {
  apiKey?: string;
  provider: 'google' | 'here' | 'mapbox' | 'offline';
}

export class MapsService {
  constructor(private config: MapsConfig) {}
  
  /**
   * Calculate travel time from airport to hotel
   * In MVP, this delegates to the geoDistance agent's haversine calculation
   * In production, this would call real mapping APIs
   */
  async getTravelTime(
    airportIata: IATA,
    hotelId: HotelId,
    hotelCoords: { lat: number; lon: number },
    departureTime: string
  ): Promise<TravelTime> {
    // MVP: Return a placeholder structure
    // In production, this would make actual API calls
    
    if (this.config.provider === 'offline' || !this.config.apiKey) {
      // Fallback to basic calculation (this is handled in geoDistance agent)
      return {
        hotelId,
        mode: 'drive',
        minutes: 30, // Placeholder
        distanceKm: 15, // Placeholder  
        window: {
          startUtc: departureTime,
          endUtc: new Date(new Date(departureTime).getTime() + 60 * 60 * 1000).toISOString(),
        },
      };
    }
    
    // TODO: Implement actual API calls for production
    throw new Error('Live mapping API integration not implemented in MVP');
  }
  
  /**
   * Get traffic-adjusted travel times for multiple routes
   */
  async getBulkTravelTimes(
    airportIata: IATA,
    hotels: Array<{ id: HotelId; lat: number; lon: number }>,
    departureTime: string
  ): Promise<TravelTime[]> {
    // MVP: Process individually
    const results: TravelTime[] = [];
    
    for (const hotel of hotels) {
      try {
        const travelTime = await this.getTravelTime(
          airportIata,
          hotel.id,
          { lat: hotel.lat, lon: hotel.lon },
          departureTime
        );
        results.push(travelTime);
      } catch (error) {
        console.warn(`Failed to get travel time for hotel ${hotel.id}:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * Check if service is available and configured
   */
  isAvailable(): boolean {
    return this.config.provider === 'offline' || !!this.config.apiKey;
  }
}