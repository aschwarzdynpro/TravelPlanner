-- Freemium foundation: per-user plan + tamper guard.
--
-- Adds a plan to profiles ('free' default, 'pro' for entitled users) and an
-- optional expiry. There is no checkout yet, so 'pro' is set out-of-band
-- (service role / future Stripe webhook), never by the client.
--
-- SECURITY: the existing profiles policies let a user insert and update their
-- own row (any column). Without a guard a client could set plan='pro' — on
-- UPDATE, or by INSERTing a fresh row (signup uses ON CONFLICT DO NOTHING, so
-- a missing row could be self-inserted) — and bypass the paywall. The trigger
-- below forces plan/plan_until for the `authenticated` role on BOTH insert and
-- update, while leaving the service role (and the SECURITY DEFINER signup
-- function, which runs as owner) free to set them.

alter table public.profiles
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'pro')),
  add column if not exists plan_until timestamptz;

create or replace function public.guard_profile_plan()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Only restrict end-user (authenticated) writes; the service role and the
  -- SECURITY DEFINER signup function run with auth.role() <> 'authenticated'.
  if auth.role() = 'authenticated' then
    if tg_op = 'INSERT' then
      new.plan := 'free';
      new.plan_until := null;
    elsif new.plan is distinct from old.plan
          or new.plan_until is distinct from old.plan_until then
      new.plan := old.plan;
      new.plan_until := old.plan_until;
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists guard_profile_plan on public.profiles;
create trigger guard_profile_plan
  before insert or update on public.profiles
  for each row execute function public.guard_profile_plan();
