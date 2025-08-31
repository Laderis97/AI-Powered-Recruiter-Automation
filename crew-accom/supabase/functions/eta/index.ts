// Supabase Edge Function for ETA calculation
// POST { pairingId, airportIata, hotelIds:[], window:{startUtc,endUtc}, mode }
// Returns [{hotelId, minutes, distanceKm}]

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ETARequest {
  pairingId: string;
  airportIata: string;
  hotelIds: string[];
  window: {
    startUtc: string;
    endUtc: string;
  };
  mode: 'drive' | 'transit' | 'shuttle' | 'walk';
}

interface ETAResponse {
  hotelId: string;
  minutes: number;
  distanceKm: number;
  confidence: number;
  provider: string;
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

    const { pairingId, airportIata, hotelIds, window, mode }: ETARequest = await req.json()

    // Validate input
    if (!pairingId || !airportIata || !hotelIds || hotelIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get airport coordinates
    const { data: airport, error: airportError } = await supabase
      .from('airports')
      .select('lat, lon, tz')
      .eq('iata', airportIata)
      .single()

    if (airportError || !airport) {
      return new Response(
        JSON.stringify({ error: `Airport ${airportIata} not found` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get hotel coordinates
    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('id, lat, lon, name')
      .in('id', hotelIds)

    if (hotelsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch hotel coordinates' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: ETAResponse[] = []
    const departureTime = new Date(window.startUtc)

    // Calculate ETA for each hotel
    for (const hotel of hotels) {
      try {
        // Check cache first
        const { data: cached } = await supabase
          .from('travel_times')
          .select('minutes, distance_km, confidence')
          .eq('pairing_id', pairingId)
          .eq('hotel_id', hotel.id)
          .eq('mode', mode)
          .eq('window_start', window.startUtc)
          .single()

        if (cached) {
          results.push({
            hotelId: hotel.id,
            minutes: cached.minutes,
            distanceKm: cached.distance_km,
            confidence: cached.confidence,
            provider: 'cache'
          })
          continue
        }

        // Calculate using database function
        const { data: travelMetrics, error: metricsError } = await supabase
          .rpc('calculate_travel_metrics', {
            p_hotel_id: hotel.id,
            p_airport_iata: airportIata,
            p_departure_time: window.startUtc
          })

        if (metricsError || !travelMetrics || travelMetrics.length === 0) {
          console.error(`Failed to calculate metrics for hotel ${hotel.id}:`, metricsError)
          continue
        }

        const metrics = travelMetrics[0]

        // Store in cache
        await supabase
          .from('travel_times')
          .insert({
            pairing_id: pairingId,
            hotel_id: hotel.id,
            airport_iata: airportIata,
            mode,
            minutes: metrics.eta_minutes,
            distance_km: metrics.distance_km,
            window_start: window.startUtc,
            window_end: window.endUtc,
            confidence: metrics.confidence,
            provider: 'haversine'
          })

        results.push({
          hotelId: hotel.id,
          minutes: metrics.eta_minutes,
          distanceKm: metrics.distance_km,
          confidence: metrics.confidence,
          provider: 'calculated'
        })

      } catch (error) {
        console.error(`Error calculating ETA for hotel ${hotel.id}:`, error)
        // Continue with next hotel
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        metadata: {
          airport: airportIata,
          mode,
          window,
          processedHotels: results.length,
          requestedHotels: hotelIds.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('ETA calculation error:', error)
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