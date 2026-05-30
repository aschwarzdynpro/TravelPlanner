-- Make share_level a real boundary across ALL read paths, not just the RPC.
--
-- Problem: previously `is_public` granted any non-member (anon via REST, or any
-- logged-in user via REST / the in-app detail, print and calendar pages) full
-- direct read of a public trip and its children — bypassing share_level, which
-- was only applied inside get_shared_trip. This migration removes the blanket
-- public read: non-members can read a public trip ONLY through the
-- SECURITY DEFINER get_shared_trip RPC (which masks per level). Owners/members
-- are unaffected. Additive/idempotent; no data is modified.

-- 1) Participant = owner or active member (NO is_public). Used by the child /
--    members / activity SELECT policies so "public" no longer implies access.
--    can_view_trip (which still includes is_public) is kept for follows_insert,
--    so users can still follow public trips they aren't members of.
create or replace function public.is_trip_participant(_trip_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.trips t where t.id = _trip_id and t.created_by = auth.uid()
  ) or public.is_trip_member(_trip_id);
$$;

-- 2) trips: drop the is_public read branch. References the row's own column
--    (created_by) directly and is_trip_member (queries trip_members only), so
--    INSERT ... RETURNING still works (see CLAUDE.md RLS note).
drop policy if exists trips_select on public.trips;
create policy trips_select on public.trips for select using (
  created_by = auth.uid() or public.is_trip_member(id)
);

-- 3) Child tables: members/owners only. Public consumption goes through the RPC.
do $$
declare t text;
begin
  foreach t in array array['travelers','areas','accommodations','flights'] loop
    execute format('drop policy if exists %1$s_select on public.%1$s;', t);
    execute format('create policy %1$s_select on public.%1$s for select using (public.is_trip_participant(trip_id));', t);
  end loop;
end $$;

-- 4) Members + activity: members/owners only (members may always see their own row).
drop policy if exists members_select on public.trip_members;
create policy members_select on public.trip_members for select
  using (public.is_trip_participant(trip_id) or user_id = auth.uid());

drop policy if exists activity_select on public.trip_activity;
create policy activity_select on public.trip_activity for select
  using (public.is_trip_participant(trip_id));

-- 5) Defense in depth: anon never needs direct table reads anymore (the public
--    Follow page uses RPCs). RLS already denies anon, but revoke the grants too.
--    SECURITY DEFINER functions run as owner and are unaffected.
revoke select on public.trips, public.areas, public.accommodations,
  public.flights, public.travelers, public.trip_members,
  public.trip_activity, public.trip_follows from anon;

-- 6) get_shared_trip: expose the trip id + created_by so the Follow page can
--    drive the follow button without a direct trips read (which non-members no
--    longer have). Both are unguessable uuids, not sensitive.
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
  show_details boolean;
  show_costs boolean;
  result jsonb;
begin
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
      'id', t.id,
      'created_by', t.created_by,
      'name', t.name,
      'kind', t.kind,
      'destination', t.destination,
      'description', t.description,
      'start_date', t.start_date,
      'end_date', t.end_date,
      'cover_color', t.cover_color,
      'share_level', lvl,
      'budget', case when show_costs then t.budget else null end,
      'budget_currency', case when show_costs then t.budget_currency else null end
    ),
    'areas', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'name', a.name, 'region', a.region, 'description', a.description,
        'latitude', a.latitude, 'longitude', a.longitude,
        'arrival_date', a.arrival_date, 'departure_date', a.departure_date, 'sort_order', a.sort_order
      ) order by a.sort_order, a.created_at)
      from public.areas a where a.trip_id = t.id
    ), '[]'::jsonb),
    'accommodations', case when show_details then coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ac.id, 'area_id', ac.area_id, 'name', ac.name, 'address', ac.address,
        'latitude', ac.latitude, 'longitude', ac.longitude,
        'check_in_date', ac.check_in_date, 'check_out_date', ac.check_out_date,
        'check_in_time', ac.check_in_time, 'check_out_time', ac.check_out_time,
        'board_level', ac.board_level,
        'cost', case when show_costs then ac.cost else null end,
        'price_per_night', case when show_costs then ac.price_per_night else null end,
        'currency', case when show_costs then ac.currency else null end
      ) order by ac.check_in_date nulls last)
      from public.accommodations ac where ac.trip_id = t.id
    ), '[]'::jsonb) else '[]'::jsonb end,
    'flights', case when show_details then coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id, 'airline', f.airline, 'flight_number', f.flight_number,
        'departure_airport', f.departure_airport, 'arrival_airport', f.arrival_airport,
        'departure_time', f.departure_time, 'arrival_time', f.arrival_time,
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

-- 7) Followed-trips list for the "Follow-Up Reisen" page. Non-members no longer
--    see public trips via RLS, so this definer function returns the caller's
--    own follows that are still public, with only safe display columns.
create or replace function public.get_followed_trips()
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id,
    'name', t.name,
    'kind', t.kind,
    'destination', t.destination,
    'start_date', t.start_date,
    'end_date', t.end_date,
    'cover_color', t.cover_color,
    'share_token', t.share_token
  ) order by f.created_at desc), '[]'::jsonb)
  from public.trip_follows f
  join public.trips t on t.id = f.trip_id
  where f.user_id = auth.uid() and t.is_public = true;
$$;

grant execute on function public.get_followed_trips() to authenticated;