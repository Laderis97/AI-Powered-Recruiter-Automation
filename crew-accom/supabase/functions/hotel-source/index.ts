// Supabase Edge Function for hotel sourcing
// POST { city, checkIn, checkOut, constraints, airlineId }
// Returns [{ hotel, rates, availability }]

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HotelSourceRequest {
  city: string;
  checkIn: string;
  checkOut: string;
  airlineId: string;
  constraints?: {
    maxNightlyUsd?: number;
    minHotelRating?: number;
    preferredBrands?: string[];
    minReviews?: number;
  };
}

interface HotelSourceResponse {
  hotel: {
    id: string;
    name: string;
    brand: string;
    address: string;
    rating: number;
    reviews: number;
    amenities: string[];
    coordinates: { lat: number; lon: number };
  };
  rate: {
    nightly: number;
    taxesFees: number;
    currency: string;
    rateType: string;
  };
  availability: {
    available: boolean;
    roomsLeft?: number;
    restrictions?: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { city, checkIn, checkOut, airlineId, constraints }: HotelSourceRequest = await req.json()

    // Validate input
    if (!city || !checkIn || !checkOut || !airlineId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: city, checkIn, checkOut, airlineId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate dates
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    if (checkInDate >= checkOutDate) {
      return new Response(
        JSON.stringify({ error: 'Check-in date must be before check-out date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build hotel query with constraints
    let hotelQuery = supabase
      .from('hotels')
      .select(`
        id,
        name,
        brand,
        address,
        lat,
        lon,
        rating,
        reviews,
        amenities,
        hotel_rates (
          nightly,
          taxes_fees,
          currency,
          rate_type
        )
      `)
      .eq('airline_id', airlineId)
      .ilike('city', `%${city}%`)
      .eq('is_blacklisted', false)

    // Apply constraint filters
    if (constraints?.minHotelRating) {
      hotelQuery = hotelQuery.gte('rating', constraints.minHotelRating)
    }

    if (constraints?.minReviews) {
      hotelQuery = hotelQuery.gte('reviews', constraints.minReviews)
    }

    if (constraints?.preferredBrands && constraints.preferredBrands.length > 0) {
      hotelQuery = hotelQuery.in('brand', constraints.preferredBrands)
    }

    const { data: hotels, error: hotelsError } = await hotelQuery

    if (hotelsError) {
      console.error('Hotel query error:', hotelsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch hotels', details: hotelsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process hotels and format response
    const results: HotelSourceResponse[] = []

    for (const hotel of hotels || []) {
      // Find applicable rate for the date range
      const applicableRates = hotel.hotel_rates.filter((rate: any) => {
        return checkInDate >= new Date(rate.valid_from) && 
               checkOutDate <= new Date(rate.valid_to)
      })

      // Prefer corporate rates, fall back to standard
      const corporateRate = applicableRates.find((r: any) => r.rate_type === 'corporate')
      const standardRate = applicableRates.find((r: any) => r.rate_type === 'standard')
      const bestRate = corporateRate || standardRate

      if (!bestRate) {
        continue // Skip hotels without valid rates
      }

      // Apply rate constraint
      if (constraints?.maxNightlyUsd && bestRate.nightly > constraints.maxNightlyUsd) {
        continue
      }

      // In MVP, we assume availability (in production, this would check real inventory)
      const availability = {
        available: true,
        roomsLeft: Math.floor(Math.random() * 10) + 1, // Simulate available rooms
        restrictions: []
      }

      // Add potential restrictions based on timing
      const daysBetween = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysBetween > 7) {
        availability.restrictions?.push('Extended stay - advance booking required')
      }

      const hotelData: HotelSourceResponse = {
        hotel: {
          id: hotel.id,
          name: hotel.name,
          brand: hotel.brand || 'Independent',
          address: hotel.address,
          rating: hotel.rating || 0,
          reviews: hotel.reviews || 0,
          amenities: hotel.amenities || [],
          coordinates: {
            lat: hotel.lat,
            lon: hotel.lon
          }
        },
        rate: {
          nightly: bestRate.nightly,
          taxesFees: bestRate.taxes_fees || 0,
          currency: bestRate.currency,
          rateType: bestRate.rate_type
        },
        availability
      }

      results.push(hotelData)
    }

    // Sort by rating and brand preference
    results.sort((a, b) => {
      const aScore = (a.hotel.rating || 0) * 10 + (constraints?.preferredBrands?.includes(a.hotel.brand) ? 5 : 0)
      const bScore = (b.hotel.rating || 0) * 10 + (constraints?.preferredBrands?.includes(b.hotel.brand) ? 5 : 0)
      return bScore - aScore
    })

    return new Response(
      JSON.stringify({
        success: true,
        hotels: results,
        metadata: {
          city,
          dateRange: { checkIn, checkOut },
          hotelsFound: results.length,
          constraints: constraints || {},
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Hotel sourcing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})