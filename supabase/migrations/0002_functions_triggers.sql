-- Access-check helpers + triggers.
--
-- IMPORTANT: the trips SELECT/UPDATE policies must reference the row's own
-- columns directly (created_by, is_public) so they work on INSERT ... RETURNING
-- rows. Membership checks therefore use helpers that ONLY query trip_members
-- (never trips), to avoid the statement-snapshot problem where a self-query
-- cannot see the row currently being inserted.

create or replace function public.is_trip_member(_trip_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.trip_members m
    where m.trip_id = _trip_id and m.user_id = auth.uid() and m.status = 'active'
  );
$$;

create or replace function public.is_trip_editor(_trip_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.trip_members m
    where m.trip_id = _trip_id and m.user_id = auth.uid()
      and m.status = 'active' and m.role in ('owner','editor')
  );
$$;

-- Used by child-table policies (they reference trips, which is already committed
-- by the time children are inserted, so re-querying trips here is safe).
create or replace function public.can_view_trip(_trip_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.trips t
    where t.id = _trip_id and (
      t.is_public
      or t.created_by = auth.uid()
      or exists (
        select 1 from public.trip_members m
        where m.trip_id = t.id and m.user_id = auth.uid() and m.status = 'active'
      )
    )
  );
$$;

create or replace function public.can_edit_trip(_trip_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.trips t
    where t.id = _trip_id and (
      t.created_by = auth.uid()
      or exists (
        select 1 from public.trip_members m
        where m.trip_id = t.id and m.user_id = auth.uid()
          and m.status = 'active' and m.role in ('owner','editor')
      )
    )
  );
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_trips_updated_at on public.trips;
create trigger trg_trips_updated_at before update on public.trips
  for each row execute function public.set_updated_at();
drop trigger if exists trg_accommodations_updated_at on public.accommodations;
create trigger trg_accommodations_updated_at before update on public.accommodations
  for each row execute function public.set_updated_at();
drop trigger if exists trg_flights_updated_at on public.flights;
create trigger trg_flights_updated_at before update on public.flights
  for each row execute function public.set_updated_at();

-- Create a profile and claim pending email invites on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  update public.trip_members
  set user_id = new.id, status = 'active'
  where invited_email is not null
    and lower(invited_email) = lower(new.email)
    and user_id is null;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Auto-add the creator as owner member when a trip is created.
create or replace function public.handle_new_trip()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.trip_members (trip_id, user_id, role, status)
  values (new.id, new.created_by, 'owner', 'active')
  on conflict (trip_id, user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_trip_created on public.trips;
create trigger on_trip_created
  after insert on public.trips for each row execute function public.handle_new_trip();

-- Claim invites matching the current user's email (called by the app on login).
create or replace function public.claim_invites()
returns integer language plpgsql security definer set search_path = public as $$
declare claimed integer;
begin
  update public.trip_members tm
  set user_id = auth.uid(), status = 'active'
  from auth.users u
  where u.id = auth.uid()
    and tm.user_id is null
    and tm.invited_email is not null
    and lower(tm.invited_email) = lower(u.email);
  get diagnostics claimed = row_count;
  return claimed;
end; $$;

-- Trigger-only functions must not be callable through the REST API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_new_trip() from public, anon, authenticated;
revoke execute on function public.set_updated_at()  from public, anon, authenticated;
revoke execute on function public.claim_invites()   from public, anon;
