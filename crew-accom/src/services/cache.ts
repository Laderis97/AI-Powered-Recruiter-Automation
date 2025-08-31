// src/services/cache.ts

/**
 * Cache Service
 * Purpose: Provide caching for expensive operations like distance calculations and rate lookups
 * MVP uses in-memory Map; production would use Redis or similar
 */

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 60 * 60 * 1000; // 1 hour default
  
  constructor(private config: { defaultTTL?: number } = {}) {
    if (config.defaultTTL) {
      this.defaultTTL = config.defaultTTL;
    }
    
    // Start cleanup interval
    this.startCleanupInterval();
  }
  
  /**
   * Store a value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    
    this.cache.set(key, entry);
  }
  
  /**
   * Retrieve a value from cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value as T;
  }
  
  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
  
  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[]; hitRate?: number } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
  
  /**
   * Generate a cache key for distance calculations
   */
  static distanceKey(airportIata: string, hotelId: string): string {
    return `distance:${airportIata}:${hotelId}`;
  }
  
  /**
   * Generate a cache key for hotel rates
   */
  static rateKey(hotelId: string, checkIn: string, checkOut: string): string {
    return `rate:${hotelId}:${checkIn}:${checkOut}`;
  }
  
  /**
   * Generate a cache key for hotel details
   */
  static hotelKey(hotelId: string): string {
    return `hotel:${hotelId}`;
  }
  
  /**
   * Start background cleanup of expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }
  
  /**
   * Remove all expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }
}