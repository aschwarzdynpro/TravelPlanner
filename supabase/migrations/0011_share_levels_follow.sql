-- Sharing levels + real "following".
--
-- Additive only. Adds a per-trip share level, a follows table, and a
-- SECURITY DEFINER function that returns ONLY the fields allowed by the level
-- for a public trip — so the level is a real boundary, not just UI.

-- 1) Share level on trips. Default 'full' preserves the existing Follow-Me
--    behaviour (shows everything) until the owner narrows it.
alter table public.trips
  add column if not exists share_level text not null default 'full'
    check (share_level in ('basic', 'plus', 'full'));

-- 2) Follows: who follows which trip. Read-only access stays governed by the
--    trip's is_public flag (enforced where the data is read).
create table if not exists public.trip_follows (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (trip_id, user_id)
);

create index if not exists idx_trip_follows_user on public.trip_follows(user_id);

alter table public.trip_follows enable row level security;

drop policy if exists follows_select on public.trip_follows;
create policy follows_select on public.trip_follows for select
  using (user_id = auth.uid());

drop policy if exists follows_insert on public.trip_follows;
create policy follows_insert on public.trip_follows for insert to authenticated
  with check (user_id = auth.uid() and public.can_view_trip(trip_id));

drop policy if exists follows_delete on public.trip_follows;
create policy follows_delete on public.trip_follows for delete to authenticated
  using (user_id = auth.uid());

-- 3) Shared-trip reader. SECURITY DEFINER so it can read the trip's data, but
--    it ONLY ever returns a public trip and ONLY the fields the share level
--    permits. This is what the public Follow page calls (via RPC) instead of
--    reading the child tables directly, so narrower levels can't be bypassed
--    through the open REST API.
create or replace function public.get_shared_trip(p_token text)
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  t public.trips;
  lvl text;
  show_details boolean;   -- accommodations + flights (plus, full)
  show_costs boolean;     -- costs/budget (full only)
  result jsonb;
begin
  -- share_token is a uuid column; the token arrives as text, so cast to compare.
  select * into t from public.trips
  where share_token::text = p_token and is_public = true;
  if not found then
    return null;
  end if;

  lvl := t.share_level;
  show_details := lvl in ('plus', 'full');
  show_costs := lvl = 'full';

  result := jsonb_build_object(
    'trip', jsonb_build_object(
      'name', t.name,
      'kind', t.kind,
      'destination', t.destination,
      'description', t.description,
      'start_date', t.start_date,
      'end_date', t.end_date,
      'cover_color', t.cover_color,
      'share_level', lvl,
      -- budget only at 'full'
      'budget', case when show_costs then t.budget else null end,
      'budget_currency', case when show_costs then t.budget_currency else null end
    ),
    'areas', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id,
        'name', a.name,
        'region', a.region,
        'description', a.description,
        'latitude', a.latitude,
        'longitude', a.longitude,
        'arrival_date', a.arrival_date,
        'departure_date', a.departure_date,
        'sort_order', a.sort_order
      ) order by a.sort_order, a.created_at)
      from public.areas a where a.trip_id = t.id
    ), '[]'::jsonb),
    'accommodations', case when show_details then coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ac.id,
        'area_id', ac.area_id,
        'name', ac.name,
        'address', ac.address,
        'latitude', ac.latitude,
        'longitude', ac.longitude,
        'check_in_date', ac.check_in_date,
        'check_out_date', ac.check_out_date,
        'check_in_time', ac.check_in_time,
        'check_out_time', ac.check_out_time,
        'board_level', ac.board_level,
        -- costs only at 'full'
        'cost', case when show_costs then ac.cost else null end,
        'price_per_night', case when show_costs then ac.price_per_night else null end,
        'currency', case when show_costs then ac.currency else null end
      ) order by ac.check_in_date nulls last)
      from public.accommodations ac where ac.trip_id = t.id
    ), '[]'::jsonb) else '[]'::jsonb end,
    'flights', case when show_details then coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id,
        'airline', f.airline,
        'flight_number', f.flight_number,
        'departure_airport', f.departure_airport,
        'arrival_airport', f.arrival_airport,
        'departure_time', f.departure_time,
        'arrival_time', f.arrival_time,
        -- cost only at 'full'
        'cost', case when show_costs then f.cost else null end,
        'currency', case when show_costs then f.currency else null end
      ) order by f.departure_time nulls last)
      from public.flights f where f.trip_id = t.id
    ), '[]'::jsonb) else '[]'::jsonb end
  );

  return result;
end;
$$;

grant execute on function public.get_shared_trip(text) to anon, authenticated;
