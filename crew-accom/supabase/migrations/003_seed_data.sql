-- Seed data for Crew Accommodations Planner

-- Insert sample airline
insert into public.airlines (id, code, name) values 
  ('550e8400-e29b-41d4-a716-446655440000', 'VQ', 'Virgin Atlantic'),
  ('550e8400-e29b-41d4-a716-446655440001', 'AA', 'American Airlines')
on conflict (code) do nothing;

-- Insert airports
insert into public.airports (iata, name, city, country, lat, lon, tz) values
  ('SEA', 'Seattle-Tacoma International Airport', 'Seattle', 'USA', 47.4502, -122.3088, 'America/Los_Angeles'),
  ('SFO', 'San Francisco International Airport', 'San Francisco', 'USA', 37.6213, -122.3790, 'America/Los_Angeles'),
  ('DFW', 'Dallas/Fort Worth International Airport', 'Dallas', 'USA', 32.8968, -97.0380, 'America/Chicago'),
  ('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 40.6413, -73.7781, 'America/New_York'),
  ('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA', 33.9428, -118.4081, 'America/Los_Angeles')
on conflict (iata) do nothing;

-- Insert sample hotels for Virgin Atlantic
insert into public.hotels (id, airline_id, name, brand, address, city, lat, lon, rating, reviews, amenities) values
  (
    '550e8400-e29b-41d4-a716-446655440100',
    '550e8400-e29b-41d4-a716-446655440000',
    'Hilton Seattle Airport',
    'Hilton',
    '17620 International Blvd, SEA Demo Ave',
    'Seattle',
    47.4489,
    -122.3094,
    4.2,
    1250,
    array['WiFi', 'Fitness Center', 'Airport Shuttle', 'Business Center']
  ),
  (
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440000',
    'Marriott Seattle Airport',
    'Marriott',
    '3201 S 176th St, SEA Demo Blvd',
    'Seattle',
    47.4600,
    -122.3300,
    4.0,
    890,
    array['WiFi', 'Pool', 'Airport Shuttle', 'Restaurant']
  ),
  (
    '550e8400-e29b-41d4-a716-446655440102',
    '550e8400-e29b-41d4-a716-446655440000',
    'Hyatt House Seattle Airport',
    'Hyatt',
    '18418 International Blvd, SEA Premium Way',
    'Seattle',
    47.4450,
    -122.3080,
    4.3,
    450,
    array['WiFi', 'Kitchenette', 'Airport Shuttle', 'Fitness Center', 'Pool']
  ),
  (
    '550e8400-e29b-41d4-a716-446655440103',
    '550e8400-e29b-41d4-a716-446655440000',
    'Hilton JFK Airport',
    'Hilton',
    '144-02 135th Ave, JFK Airport Area, New York',
    'New York',
    40.6413,
    -73.7781,
    4.1,
    980,
    array['WiFi', 'Airport Shuttle', 'Fitness Center', 'Restaurant', 'Business Center']
  )
on conflict (id) do nothing;

-- Insert sample hotels for American Airlines
insert into public.hotels (id, airline_id, name, brand, address, city, lat, lon, rating, reviews, amenities) values
  (
    '550e8400-e29b-41d4-a716-446655440200',
    '550e8400-e29b-41d4-a716-446655440001',
    'DoubleTree DFW Airport',
    'Hilton',
    '4441 W John Carpenter Fwy, DFW Area',
    'Dallas',
    32.8968,
    -97.0380,
    3.9,
    680,
    array['WiFi', 'Airport Shuttle', 'Restaurant', 'Fitness Center']
  ),
  (
    '550e8400-e29b-41d4-a716-446655440201',
    '550e8400-e29b-41d4-a716-446655440001',
    'Grand Hyatt DFW',
    'Hyatt',
    '2337 S International Pkwy, DFW Terminal Area',
    'Dallas',
    32.8975,
    -97.0420,
    4.5,
    1100,
    array['WiFi', 'Spa', 'Multiple Restaurants', 'Fitness Center', 'Pool', 'Airport Connector']
  )
on conflict (id) do nothing;

-- Insert hotel rates
insert into public.hotel_rates (hotel_id, currency, nightly, taxes_fees, valid_from, valid_to, rate_type) values
  -- Virgin Atlantic hotel rates
  ('550e8400-e29b-41d4-a716-446655440100', 'USD', 199, 25, '2025-01-01', '2025-12-31', 'corporate'),
  ('550e8400-e29b-41d4-a716-446655440101', 'USD', 189, 22, '2025-01-01', '2025-12-31', 'corporate'),
  ('550e8400-e29b-41d4-a716-446655440102', 'USD', 215, 28, '2025-01-01', '2025-12-31', 'corporate'),
  ('550e8400-e29b-41d4-a716-446655440103', 'USD', 210, 30, '2025-01-01', '2025-12-31', 'corporate'),
  
  -- American Airlines hotel rates
  ('550e8400-e29b-41d4-a716-446655440200', 'USD', 169, 20, '2025-01-01', '2025-12-31', 'corporate'),
  ('550e8400-e29b-41d4-a716-446655440201', 'USD', 279, 35, '2025-01-01', '2025-12-31', 'corporate')
on conflict do nothing;

-- Insert contract constraints for Virgin Atlantic
insert into public.contract_constraints (
  id,
  airline_id,
  name,
  version,
  max_commute_minutes,
  min_hotel_rating,
  max_nightly_usd,
  preferred_brands,
  min_rest_hours,
  min_reviews,
  same_hotel_for_crew,
  active,
  effective_date
) values (
  '550e8400-e29b-41d4-a716-446655440300',
  '550e8400-e29b-41d4-a716-446655440000',
  'Virgin Atlantic Standard Contract',
  1,
  30,
  3.8,
  220,
  array['Hilton', 'Marriott', 'Hyatt'],
  10,
  100,
  true,
  true,
  '2025-01-01'
) on conflict do nothing;

-- Insert contract constraints for American Airlines  
insert into public.contract_constraints (
  id,
  airline_id,
  name,
  version,
  max_commute_minutes,
  min_hotel_rating,
  max_nightly_usd,
  preferred_brands,
  min_rest_hours,
  min_reviews,
  same_hotel_for_crew,
  active,
  effective_date
) values (
  '550e8400-e29b-41d4-a716-446655440301',
  '550e8400-e29b-41d4-a716-446655440001',
  'American Airlines Standard Contract',
  1,
  45,
  3.5,
  250,
  array['Hilton', 'Marriott', 'Hyatt', 'Sheraton'],
  8,
  50,
  true,
  true,
  '2025-01-01'
) on conflict do nothing;

-- Insert sample preferences for Virgin Atlantic
insert into public.preferences (
  airline_id,
  preference_type,
  brand_weights,
  amenity_weights,
  crew_role,
  active
) values 
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'brand',
    '{"Hilton": 8, "Marriott": 7, "Hyatt": 9, "Sheraton": 6, "Independent": 3}'::jsonb,
    '{}'::jsonb,
    'all',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'amenity',
    '{}'::jsonb,
    '{"Airport Shuttle": 10, "WiFi": 8, "Fitness Center": 5, "Pool": 4, "Restaurant": 6, "Business Center": 7}'::jsonb,
    'all',
    true
  )
on conflict do nothing;

-- Grant necessary permissions for API access
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;

-- Create indexes on commonly queried fields
create index if not exists idx_hotels_airline_city on public.hotels(airline_id, city);
create index if not exists idx_hotel_rates_lookup on public.hotel_rates(hotel_id, rate_type, valid_from, valid_to);
create index if not exists idx_travel_times_cache on public.travel_times(hotel_id, airport_iata, mode);

-- Add some helpful comments
comment on table public.airlines is 'Airlines using the crew accommodation system';
comment on table public.pairings is 'Flight crew duty pairings requiring accommodation';
comment on table public.hotels is 'Available hotels with rates and amenities';
comment on table public.decisions is 'Audit trail of all planning decisions made by agents';
comment on table public.planning_metrics is 'Performance and quality metrics for planning sessions';

-- Create a sample user for testing (in production, this would be handled by auth)
-- Note: This is for development only
insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '550e8400-e29b-41d4-a716-446655440999',
  'demo@virgin.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  '{"airline_id": "550e8400-e29b-41d4-a716-446655440000", "role": "planner"}'::jsonb,
  '{"name": "Demo User", "airline": "Virgin Atlantic"}'::jsonb,
  now(),
  now()
) on conflict (email) do nothing;