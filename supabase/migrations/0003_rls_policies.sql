-- Row Level Security. Members collaborate per trip; public ("Follow Me") trips
-- are readable by anyone via the share token.

alter table public.profiles       enable row level security;
alter table public.trips          enable row level security;
alter table public.trip_members   enable row level security;
alter table public.travelers      enable row level security;
alter table public.areas          enable row level security;
alter table public.accommodations enable row level security;
alter table public.flights        enable row level security;
alter table public.trip_activity  enable row level security;

-- PROFILES
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (true);
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- TRIPS (reference row columns directly so INSERT ... RETURNING works)
drop policy if exists trips_select on public.trips;
create policy trips_select on public.trips for select using (
  is_public or created_by = auth.uid() or public.is_trip_member(id)
);
drop policy if exists trips_insert on public.trips;
create policy trips_insert on public.trips for insert to authenticated
  with check (created_by = auth.uid());
drop policy if exists trips_update on public.trips;
create policy trips_update on public.trips for update to authenticated
  using (created_by = auth.uid() or public.is_trip_editor(id))
  with check (created_by = auth.uid() or public.is_trip_editor(id));
drop policy if exists trips_delete on public.trips;
create policy trips_delete on public.trips for delete to authenticated
  using (created_by = auth.uid());

-- TRIP_MEMBERS
drop policy if exists members_select on public.trip_members;
create policy members_select on public.trip_members for select
  using (public.can_view_trip(trip_id) or user_id = auth.uid());
drop policy if exists members_insert on public.trip_members;
create policy members_insert on public.trip_members for insert to authenticated
  with check (public.can_edit_trip(trip_id));
drop policy if exists members_update on public.trip_members;
create policy members_update on public.trip_members for update to authenticated
  using (public.can_edit_trip(trip_id) or user_id = auth.uid())
  with check (public.can_edit_trip(trip_id) or user_id = auth.uid());
drop policy if exists members_delete on public.trip_members;
create policy members_delete on public.trip_members for delete to authenticated
  using (public.can_edit_trip(trip_id) or user_id = auth.uid());

-- Trip-scoped child tables: view if you can view the trip, write if you can edit.
do $$
declare t text;
begin
  foreach t in array array['travelers','areas','accommodations','flights'] loop
    execute format('drop policy if exists %1$s_select on public.%1$s;', t);
    execute format('create policy %1$s_select on public.%1$s for select using (public.can_view_trip(trip_id));', t);
    execute format('drop policy if exists %1$s_insert on public.%1$s;', t);
    execute format('create policy %1$s_insert on public.%1$s for insert to authenticated with check (public.can_edit_trip(trip_id));', t);
    execute format('drop policy if exists %1$s_update on public.%1$s;', t);
    execute format('create policy %1$s_update on public.%1$s for update to authenticated using (public.can_edit_trip(trip_id)) with check (public.can_edit_trip(trip_id));', t);
    execute format('drop policy if exists %1$s_delete on public.%1$s;', t);
    execute format('create policy %1$s_delete on public.%1$s for delete to authenticated using (public.can_edit_trip(trip_id));', t);
  end loop;
end $$;

-- TRIP_ACTIVITY
drop policy if exists activity_select on public.trip_activity;
create policy activity_select on public.trip_activity for select using (public.can_view_trip(trip_id));
drop policy if exists activity_insert on public.trip_activity;
create policy activity_insert on public.trip_activity for insert to authenticated
  with check (public.can_edit_trip(trip_id) and user_id = auth.uid());
