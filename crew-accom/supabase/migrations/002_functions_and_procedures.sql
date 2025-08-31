-- Stored procedures and functions for Crew Accommodations Planner

-- Function to get viable hotels for a pairing under active constraints
create or replace function public.get_viable_hotels(p_pairing_id uuid)
returns table (
  hotel_id uuid,
  hotel_name text,
  brand text,
  rating numeric,
  reviews int,
  eta_minutes int,
  distance_km numeric,
  nightly numeric,
  total_cost numeric,
  score numeric,
  compliance_status text
) 
language sql 
security definer 
as $$
with pairing_info as (
  select p.airline_id, l.arr_iata
  from pairings p
  join legs l on l.pairing_id = p.id
  where p.id = p_pairing_id
  order by l.leg_order desc
  limit 1
),
active_constraints as (
  select cc.*
  from contract_constraints cc
  join pairing_info pi on pi.airline_id = cc.airline_id
  where cc.active = true
  limit 1
),
airport_info as (
  select a.*
  from airports a
  join pairing_info pi on pi.arr_iata = a.iata
),
current_rates as (
  select distinct on (hr.hotel_id) 
    hr.hotel_id,
    hr.nightly,
    hr.taxes_fees,
    hr.currency
  from hotel_rates hr
  where current_date between hr.valid_from and hr.valid_to
    and hr.rate_type = 'corporate' -- Prefer corporate rates
  
  union all
  
  select distinct on (hr.hotel_id)
    hr.hotel_id,
    hr.nightly,
    hr.taxes_fees,
    hr.currency
  from hotel_rates hr
  where current_date between hr.valid_from and hr.valid_to
    and hr.rate_type = 'standard'
    and not exists (
      select 1 from hotel_rates hr2 
      where hr2.hotel_id = hr.hotel_id 
      and hr2.rate_type = 'corporate'
      and current_date between hr2.valid_from and hr2.valid_to
    )
)
select 
  h.id as hotel_id,
  h.name as hotel_name,
  h.brand,
  h.rating,
  h.reviews,
  coalesce(tt.minutes, 999) as eta_minutes,
  coalesce(tt.distance_km, 999.0) as distance_km,
  coalesce(cr.nightly, 999.0) as nightly,
  coalesce(cr.nightly + cr.taxes_fees, 999.0) as total_cost,
  
  -- Calculate score using the same algorithm as the schedule optimizer
  (100 - coalesce(tt.minutes, 100)) + 
  coalesce(h.rating, 0) * 10 - 
  coalesce(cr.nightly, 200) / 10 +
  case 
    when h.brand = any(coalesce(ac.preferred_brands, array[]::text[])) then 5 
    else 0 
  end as score,
  
  -- Compliance status
  case
    when h.is_blacklisted then 'blacklisted'
    when ac.max_commute_minutes is not null and coalesce(tt.minutes, 999) > ac.max_commute_minutes then 'commute_too_long'
    when ac.min_hotel_rating is not null and coalesce(h.rating, 0) < ac.min_hotel_rating then 'rating_too_low'
    when ac.max_nightly_usd is not null and coalesce(cr.nightly, 999) > ac.max_nightly_usd then 'rate_too_high'
    when ac.min_reviews is not null and coalesce(h.reviews, 0) < ac.min_reviews then 'insufficient_reviews'
    else 'compliant'
  end as compliance_status

from hotels h
join pairing_info pi on pi.airline_id = h.airline_id
cross join active_constraints ac
left join travel_times tt on tt.hotel_id = h.id and tt.pairing_id = p_pairing_id and tt.mode = 'drive'
left join current_rates cr on cr.hotel_id = h.id
join airport_info ai on true -- Cross join to get airport coordinates

where not h.is_blacklisted
  and h.city = ai.city -- Filter by arrival city

order by score desc nulls last;
$$;

-- Function to calculate haversine distance
create or replace function public.haversine_distance(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
returns double precision
language sql
immutable
as $$
select 
  6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * 
    power(sin(radians(lon2 - lon1) / 2), 2)
  ));
$$;

-- Function to estimate travel time based on distance and time of day
create or replace function public.estimate_travel_time(
  distance_km double precision,
  departure_time timestamptz default now()
)
returns int
language plpgsql
immutable
as $$
declare
  base_speed double precision := 30.0; -- km/h
  hour_of_day int;
  day_of_week int;
  adjusted_speed double precision;
  travel_hours double precision;
begin
  -- Get hour and day for traffic calculations
  hour_of_day := extract(hour from departure_time at time zone 'UTC');
  day_of_week := extract(dow from departure_time);
  
  adjusted_speed := base_speed;
  
  -- Rush hour adjustments
  if (hour_of_day between 7 and 9) or (hour_of_day between 16 and 19) then
    adjusted_speed := base_speed * 0.67; -- 33% slower in rush hour
  elsif hour_of_day between 22 and 23 or hour_of_day between 0 and 6 then
    adjusted_speed := base_speed * 1.5; -- 50% faster late night
  end if;
  
  -- Weekend adjustment (less traffic)
  if day_of_week in (0, 6) then
    adjusted_speed := adjusted_speed * 1.2;
  end if;
  
  travel_hours := distance_km / adjusted_speed;
  
  return round(travel_hours * 60)::int; -- Convert to minutes
end;
$$;

-- Function to get active constraints for an airline
create or replace function public.get_active_constraints(p_airline_id uuid)
returns contract_constraints
language sql
security definer
as $$
select cc.*
from contract_constraints cc
where cc.airline_id = p_airline_id
  and cc.active = true
order by cc.effective_date desc
limit 1;
$$;

-- Function to calculate distance and travel time for a hotel-airport pair
create or replace function public.calculate_travel_metrics(
  p_hotel_id uuid,
  p_airport_iata text,
  p_departure_time timestamptz default now()
)
returns table (
  distance_km double precision,
  eta_minutes int,
  confidence double precision
)
language plpgsql
security definer
as $$
declare
  hotel_coords record;
  airport_coords record;
  calculated_distance double precision;
  calculated_eta int;
begin
  -- Get hotel coordinates
  select h.lat, h.lon into hotel_coords
  from hotels h
  where h.id = p_hotel_id;
  
  if not found then
    raise exception 'Hotel not found: %', p_hotel_id;
  end if;
  
  -- Get airport coordinates
  select a.lat, a.lon into airport_coords
  from airports a
  where a.iata = p_airport_iata;
  
  if not found then
    raise exception 'Airport not found: %', p_airport_iata;
  end if;
  
  -- Calculate haversine distance
  calculated_distance := haversine_distance(
    hotel_coords.lat, hotel_coords.lon,
    airport_coords.lat, airport_coords.lon
  );
  
  -- Estimate travel time
  calculated_eta := estimate_travel_time(calculated_distance, p_departure_time);
  
  return query select 
    calculated_distance,
    calculated_eta,
    0.8::double precision; -- MVP confidence level
end;
$$;

-- Function to create a planning session with audit
create or replace function public.create_planning_session(
  p_pairing_id uuid,
  p_start_time timestamptz default now()
)
returns uuid
language plpgsql
security definer
as $$
declare
  session_id uuid;
begin
  session_id := gen_random_uuid();
  
  -- Insert initial planning metric record
  insert into planning_metrics (
    id,
    pairing_id,
    processing_time_ms,
    agents_executed,
    decisions_count,
    candidates_evaluated,
    compliant_options,
    success,
    metadata
  ) values (
    session_id,
    p_pairing_id,
    0, -- Will be updated when planning completes
    array[]::text[],
    0,
    0,
    0,
    false,
    jsonb_build_object('session_started', p_start_time)
  );
  
  return session_id;
end;
$$;

-- Function to update planning session results
create or replace function public.complete_planning_session(
  p_session_id uuid,
  p_processing_time_ms int,
  p_agents_executed text[],
  p_decisions_count int,
  p_candidates_evaluated int,
  p_compliant_options int,
  p_success boolean,
  p_selection_score numeric default null,
  p_failure_reason text default null
)
returns void
language sql
security definer
as $$
update planning_metrics
set 
  processing_time_ms = p_processing_time_ms,
  agents_executed = p_agents_executed,
  decisions_count = p_decisions_count,
  candidates_evaluated = p_candidates_evaluated,
  compliant_options = p_compliant_options,
  selection_score = p_selection_score,
  success = p_success,
  failure_reason = p_failure_reason,
  metadata = metadata || jsonb_build_object('completed_at', now())
where id = p_session_id;
$$;

-- Helpful views for analytics

-- View for planning success rates by airline
create view public.planning_success_rates as
select 
  a.name as airline_name,
  a.code as airline_code,
  count(*) as total_plannings,
  count(*) filter (where pm.success) as successful_plannings,
  round(
    (count(*) filter (where pm.success)::decimal / count(*)) * 100, 
    2
  ) as success_rate_percent,
  avg(pm.processing_time_ms) as avg_processing_time_ms,
  avg(pm.candidates_evaluated) as avg_candidates_evaluated,
  avg(pm.selection_score) filter (where pm.success) as avg_selection_score
from airlines a
join pairings p on p.airline_id = a.id
join planning_metrics pm on pm.pairing_id = p.id
group by a.id, a.name, a.code
order by success_rate_percent desc;

-- View for hotel utilization
create view public.hotel_utilization as
select 
  h.name as hotel_name,
  h.brand,
  h.city,
  count(hs.id) as times_selected,
  avg(hs.selection_score) as avg_selection_score,
  avg(hs.total_cost) as avg_total_cost,
  h.rating,
  h.reviews
from hotels h
left join hotel_selections hs on hs.hotel_id = h.id
group by h.id, h.name, h.brand, h.city, h.rating, h.reviews
order by times_selected desc;

-- View for decision analysis by stage
create view public.decision_analysis as
select 
  d.stage,
  d.outcome,
  count(*) as decision_count,
  avg(d.score) filter (where d.score is not null) as avg_score,
  array_agg(distinct d.subject_type) filter (where d.subject_type is not null) as subject_types
from decisions d
group by d.stage, d.outcome
order by d.stage, d.outcome;