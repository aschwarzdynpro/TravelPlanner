-- Admin role + global app settings (first use: a feature flag for the
-- "Drucken / PDF" button).
--
-- SECURITY:
--  * profiles.is_admin is server-controlled. The existing profiles policies let
--    a user update their own row, so without a guard a client could self-grant
--    admin. The guard trigger below freezes is_admin for the `authenticated`
--    role (force false on insert, keep old value on update); only the service
--    role / SECURITY DEFINER paths may set it. Mirrors guard_profile_plan.
--  * app_settings is world-readable (the client needs to know whether a flag is
--    on) but writable only by admins, enforced both by RLS and by the trigger
--    using a SECURITY DEFINER is_admin() helper (avoids RLS recursion).

-- 1) Admin flag on profiles, frozen against client tampering.
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.guard_profile_is_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    if tg_op = 'INSERT' then
      new.is_admin := false;
    elsif new.is_admin is distinct from old.is_admin then
      new.is_admin := old.is_admin;
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists guard_profile_is_admin on public.profiles;
create trigger guard_profile_is_admin
  before insert or update on public.profiles
  for each row execute function public.guard_profile_is_admin();

-- Helper: is the current user an admin? SECURITY DEFINER so policies can call
-- it without recursing into profiles' own RLS.
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin
  );
$$;
grant execute on function public.is_admin() to authenticated;

-- 2) Global key/value settings. Readable by everyone; writable only by admins.
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.app_settings enable row level security;

drop policy if exists app_settings_select on public.app_settings;
create policy app_settings_select on public.app_settings for select using (true);

drop policy if exists app_settings_write on public.app_settings;
create policy app_settings_write on public.app_settings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seed the first flag: print/PDF button hidden by default.
insert into public.app_settings (key, value)
  values ('show_print_pdf', 'false'::jsonb)
  on conflict (key) do nothing;
