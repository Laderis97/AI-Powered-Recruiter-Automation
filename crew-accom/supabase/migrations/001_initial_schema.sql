-- Initial database schema for Crew Accommodations Planner
-- Multi-tenant setup with airline-based tenancy

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Tenancy (airline)
create table public.airlines (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Core flight objects
create table public.crews (
  id uuid primary key default gen_random_uuid(),
  airline_id uuid references airlines(id) on delete cascade,
  name text,
  members jsonb default '[]'::jsonb, -- Store crew member details
  created_at timestamptz default now()
);

create table public.pairings (
  id uuid primary key default gen_random_uuid(),
  airline_id uuid references airlines(id) on delete cascade,
  crew_id uuid references crews(id) on delete set null,
  external_id text, -- Original pairing ID from airline systems
  duty_start timestamptz,
  duty_end timestamptz,
  status text default 'planning' check (status in ('planning', 'confirmed', 'completed', 'cancelled')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table public.legs (
  id uuid primary key default gen_random_uuid(),
  pairing_id uuid references pairings(id) on delete cascade,
  carrier text not null,
  flight_no text not null,
  dep_iata text not null,
  arr_iata text not null,
  dep_utc timestamptz not null,
  arr_utc timestamptz not null,
  equipment text,
  leg_order int not null, -- Order within pairing
  created_at timestamptz default now()
);

-- Geo + hotels
create table public.airports (
  iata text primary key,
  name text not null,
  city text not null,
  country text,
  lat double precision not null,
  lon double precision not null,
  tz text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  airline_id uuid references airlines(id) on delete cascade,
  external_id text, -- ID from hotel booking system
  name text not null,
  brand text,
  address text not null,
  city text not null,
  lat double precision not null,
  lon double precision not null,
  rating numeric check (rating >= 0 and rating <= 5),
  reviews int default 0,
  amenities text[] default array[]::text[],
  is_blacklisted boolean default false,
  is_preferred boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.hotel_rates (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references hotels(id) on delete cascade,
  currency text default 'USD' check (currency in ('USD', 'EUR', 'GBP', 'CAD')),
  nightly numeric not null check (nightly >= 0),
  taxes_fees numeric default 0 check (taxes_fees >= 0),
  valid_from date not null,
  valid_to date not null,
  rate_type text default 'standard' check (rate_type in ('standard', 'corporate', 'government', 'crew')),
  created_at timestamptz default now(),
  
  -- Ensure no overlapping rates for same hotel and type
  constraint no_overlapping_rates exclude using gist (
    hotel_id with =,
    rate_type with =,
    daterange(valid_from, valid_to, '[]') with &&
  )
);

-- Constraints/contracts (per airline; can be versioned)
create table public.contract_constraints (
  id uuid primary key default gen_random_uuid(),
  airline_id uuid references airlines(id) on delete cascade,
  name text not null,
  version int default 1,
  
  -- Distance and time constraints
  max_commute_minutes int check (max_commute_minutes > 0),
  min_rest_hours int check (min_rest_hours > 0),
  
  -- Quality constraints
  min_hotel_rating numeric check (min_hotel_rating >= 0 and min_hotel_rating <= 5),
  min_reviews int check (min_reviews >= 0),
  
  -- Cost constraints
  max_nightly_usd numeric check (max_nightly_usd > 0),
  
  -- Preference constraints
  preferred_brands text[] default array[]::text[],
  blacklisted_hotels uuid[] default array[]::uuid[],
  
  -- Operational constraints
  same_hotel_for_crew boolean default true,
  allow_shared_rooms boolean default false,
  
  -- Status and metadata
  active boolean default true,
  effective_date date default current_date,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  
  -- Ensure only one active constraint set per airline
  constraint one_active_per_airline exclude using gist (
    airline_id with =,
    active with =
  ) where (active = true)
);

-- Computed distances/ETAs (cache)
create table public.travel_times (
  id uuid primary key default gen_random_uuid(),
  pairing_id uuid references pairings(id) on delete cascade,
  hotel_id uuid references hotels(id) on delete cascade,
  airport_iata text references airports(iata),
  mode text not null check (mode in ('drive','transit','shuttle','walk')),
  minutes int not null check (minutes >= 0),
  distance_km numeric not null check (distance_km >= 0),
  window_start timestamptz not null,
  window_end timestamptz not null,
  traffic_factor numeric default 1.0, -- Traffic multiplier
  confidence numeric default 0.8 check (confidence >= 0 and confidence <= 1),
  provider text default 'haversine', -- maps, google, here, etc.
  created_at timestamptz default now(),
  
  -- Unique constraint for caching
  constraint unique_travel_time unique (pairing_id, hotel_id, mode, window_start)
);

-- Decisions/audit
create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  pairing_id uuid references pairings(id) on delete cascade,
  stage text not null,
  subject_type text, -- 'hotel', 'pairing', 'constraint', etc.
  subject_id text, -- hotel_id, pairing_id, etc.
  outcome text not null check (outcome in ('accept','reject','score')),
  score numeric,
  reasons text[] not null default array[]::text[],
  details jsonb default '{}'::jsonb,
  agent_version text default '0.1.0',
  created_at timestamptz default now()
);

-- Hotel selections and bookings
create table public.hotel_selections (
  id uuid primary key default gen_random_uuid(),
  pairing_id uuid references pairings(id) on delete cascade,
  hotel_id uuid references hotels(id) on delete cascade,
  selected_at timestamptz default now(),
  selection_score numeric,
  selection_reason text,
  
  -- Booking details
  booking_status text default 'planned' check (booking_status in ('planned', 'held', 'confirmed', 'cancelled')),
  confirmation_number text,
  total_cost numeric,
  check_in timestamptz,
  check_out timestamptz,
  
  -- Room details
  room_count int default 1 check (room_count > 0),
  room_type text,
  special_requests text,
  
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- One selection per pairing
  constraint one_selection_per_pairing unique (pairing_id)
);

-- Preferences (brand weights etc.)
create table public.preferences (
  id uuid primary key default gen_random_uuid(),
  airline_id uuid references airlines(id) on delete cascade,
  preference_type text not null check (preference_type in ('brand', 'amenity', 'location', 'cost')),
  
  -- Flexible preference storage
  brand_weights jsonb default '{}'::jsonb, -- {"Hilton":8,"Marriott":7}
  amenity_weights jsonb default '{}'::jsonb, -- {"WiFi":8,"Pool":4}
  location_weights jsonb default '{}'::jsonb, -- {"proximity":0.4,"cost":0.3}
  
  -- Crew role specific preferences
  crew_role text check (crew_role in ('Captain', 'FirstOfficer', 'FA', 'all')),
  seniority_min int,
  seniority_max int,
  
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Analytics and performance tracking
create table public.planning_metrics (
  id uuid primary key default gen_random_uuid(),
  pairing_id uuid references pairings(id) on delete cascade,
  
  -- Performance metrics
  processing_time_ms int not null,
  agents_executed text[] not null,
  decisions_count int not null,
  candidates_evaluated int not null,
  compliant_options int not null,
  
  -- Quality metrics
  selection_score numeric,
  cost_efficiency numeric, -- Selected rate vs average rate
  time_efficiency numeric, -- Selected ETA vs average ETA
  
  -- Outcome
  success boolean not null,
  failure_reason text,
  
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_pairings_airline on pairings(airline_id);
create index idx_pairings_status on pairings(status);
create index idx_legs_pairing on legs(pairing_id, leg_order);
create index idx_hotels_city on hotels(city);
create index idx_hotels_brand on hotels(brand);
create index idx_hotel_rates_valid on hotel_rates(hotel_id, valid_from, valid_to);
create index idx_travel_times_lookup on travel_times(pairing_id, hotel_id, mode);
create index idx_decisions_pairing on decisions(pairing_id, stage);
create index idx_decisions_subject on decisions(subject_type, subject_id);
create index idx_preferences_airline on preferences(airline_id, active);

-- Full text search indexes
create index idx_hotels_search on hotels using gin(to_tsvector('english', name || ' ' || address || ' ' || coalesce(brand, '')));

-- Functions and triggers for updated_at
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger set_timestamp_airlines before update on airlines for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp_hotels before update on hotels for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp_hotel_selections before update on hotel_selections for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp_preferences before update on preferences for each row execute procedure trigger_set_timestamp();

-- Row Level Security (RLS) setup
alter table airlines enable row level security;
alter table crews enable row level security;
alter table pairings enable row level security;
alter table legs enable row level security;
alter table hotels enable row level security;
alter table hotel_rates enable row level security;
alter table contract_constraints enable row level security;
alter table travel_times enable row level security;
alter table decisions enable row level security;
alter table hotel_selections enable row level security;
alter table preferences enable row level security;
alter table planning_metrics enable row level security;

-- RLS Policies (tenant isolation by airline_id)
-- Note: In production, you'd set up proper auth with JWT claims

-- Airlines - users can only see their own airline
create policy "airline_isolation" on public.airlines for all
  using (auth.jwt() ->> 'airline_id' = id::text)
  with check (auth.jwt() ->> 'airline_id' = id::text);

-- Crews - users can only see crews from their airline
create policy "crews_isolation" on public.crews for all
  using (auth.jwt() ->> 'airline_id' = airline_id::text)
  with check (auth.jwt() ->> 'airline_id' = airline_id::text);

-- Pairings - users can only see pairings from their airline
create policy "pairings_isolation" on public.pairings for all
  using (auth.jwt() ->> 'airline_id' = airline_id::text)
  with check (auth.jwt() ->> 'airline_id' = airline_id::text);

-- Legs - users can only see legs from their airline's pairings
create policy "legs_isolation" on public.legs for all
  using (exists (
    select 1 from pairings p 
    where p.id = pairing_id 
    and auth.jwt() ->> 'airline_id' = p.airline_id::text
  ));

-- Hotels - users can only see hotels available to their airline
create policy "hotels_isolation" on public.hotels for all
  using (auth.jwt() ->> 'airline_id' = airline_id::text)
  with check (auth.jwt() ->> 'airline_id' = airline_id::text);

-- Hotel rates - follow hotel access rules
create policy "hotel_rates_isolation" on public.hotel_rates for all
  using (exists (
    select 1 from hotels h 
    where h.id = hotel_id 
    and auth.jwt() ->> 'airline_id' = h.airline_id::text
  ));

-- Contract constraints - airline specific
create policy "constraints_isolation" on public.contract_constraints for all
  using (auth.jwt() ->> 'airline_id' = airline_id::text)
  with check (auth.jwt() ->> 'airline_id' = airline_id::text);

-- Travel times - follow pairing access rules
create policy "travel_times_isolation" on public.travel_times for all
  using (exists (
    select 1 from pairings p 
    where p.id = pairing_id 
    and auth.jwt() ->> 'airline_id' = p.airline_id::text
  ));

-- Decisions - follow pairing access rules
create policy "decisions_isolation" on public.decisions for all
  using (exists (
    select 1 from pairings p 
    where p.id = pairing_id 
    and auth.jwt() ->> 'airline_id' = p.airline_id::text
  ));

-- Hotel selections - follow pairing access rules
create policy "selections_isolation" on public.hotel_selections for all
  using (exists (
    select 1 from pairings p 
    where p.id = pairing_id 
    and auth.jwt() ->> 'airline_id' = p.airline_id::text
  ));

-- Preferences - airline specific
create policy "preferences_isolation" on public.preferences for all
  using (auth.jwt() ->> 'airline_id' = airline_id::text)
  with check (auth.jwt() ->> 'airline_id' = airline_id::text);

-- Planning metrics - follow pairing access rules
create policy "metrics_isolation" on public.planning_metrics for all
  using (exists (
    select 1 from pairings p 
    where p.id = pairing_id 
    and auth.jwt() ->> 'airline_id' = p.airline_id::text
  ));

-- Public read access to airports (shared reference data)
create policy "airports_public_read" on public.airports for select
  using (true);

-- Service role policies (bypass RLS for admin operations)
create policy "service_role_full_access" on public.airlines for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Apply service role policy to all tables
do $$
declare
  tbl text;
begin
  for tbl in 
    select table_name 
    from information_schema.tables 
    where table_schema = 'public' 
    and table_name not in ('airports') -- airports already has public read
  loop
    execute format('
      create policy "service_role_full_access_%s" on public.%I for all
        using (auth.jwt() ->> ''role'' = ''service_role'')
        with check (auth.jwt() ->> ''role'' = ''service_role'')
    ', tbl, tbl);
  end loop;
end;
$$;