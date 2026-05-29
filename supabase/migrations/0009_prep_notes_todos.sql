-- Phase: trip preparation — notes & to-dos (checklist)
--
-- Two trip-scoped child tables. Notes are free text; to-dos are checklist
-- items with title/description, optional assignee + due date, and a done flag.
-- Same access model as other child tables: view if you can view the trip,
-- write if you can edit it (enforced by RLS below).

create table if not exists public.trip_notes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_todos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  done boolean not null default false,
  done_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_trip_notes_trip on public.trip_notes(trip_id);
create index if not exists idx_trip_todos_trip on public.trip_todos(trip_id);
create index if not exists idx_trip_todos_assigned on public.trip_todos(assigned_to);

alter table public.trip_notes enable row level security;
alter table public.trip_todos enable row level security;

-- Trip-scoped: view if you can view the trip, write if you can edit it.
do $$
declare t text;
begin
  foreach t in array array['trip_notes','trip_todos'] loop
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
