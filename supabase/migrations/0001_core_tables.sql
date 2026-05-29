-- Core schema for TravelPlanner: trips/events, areas, accommodations, flights,
-- travelers, members (collaboration) and an activity feed.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  kind text not null default 'trip' check (kind in ('trip','event')),
  destination text,
  start_date date,
  end_date date,
  cover_color text default '#2563eb',
  is_public boolean not null default false,
  share_token uuid not null default gen_random_uuid(),
  source_trip_id uuid references public.trips(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  invited_email text,
  role text not null default 'editor' check (role in ('owner','editor','viewer')),
  status text not null default 'active' check (status in ('active','invited')),
  created_at timestamptz not null default now(),
  unique (trip_id, user_id)
);

create table if not exists public.travelers (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  linked_user_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  region text,
  description text,
  latitude numeric,
  longitude numeric,
  arrival_date date,
  departure_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  area_id uuid references public.areas(id) on delete set null,
  name text not null,
  address text,
  check_in_date date,
  check_out_date date,
  check_in_time time,
  check_out_time time,
  board_level text not null default 'none'
    check (board_level in ('none','self_catering','breakfast','half_board','full_board','all_inclusive')),
  cost numeric(12,2),
  currency text not null default 'EUR',
  cancellation_policy text,
  cancellation_deadline date,
  booking_reference text,
  booking_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  airline text,
  flight_number text,
  departure_airport text,
  arrival_airport text,
  departure_time timestamptz,
  arrival_time timestamptz,
  cost numeric(12,2),
  currency text not null default 'EUR',
  cancellation_policy text,
  booking_reference text,
  booking_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_activity (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_trip_members_trip on public.trip_members(trip_id);
create index if not exists idx_trip_members_user on public.trip_members(user_id);
create index if not exists idx_travelers_trip on public.travelers(trip_id);
create index if not exists idx_areas_trip on public.areas(trip_id);
create index if not exists idx_accommodations_trip on public.accommodations(trip_id);
create index if not exists idx_accommodations_area on public.accommodations(area_id);
create index if not exists idx_flights_trip on public.flights(trip_id);
create index if not exists idx_activity_trip on public.trip_activity(trip_id);
create index if not exists idx_trips_share_token on public.trips(share_token);
