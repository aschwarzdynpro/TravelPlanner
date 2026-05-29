-- Phase 1: budgeting & per-night pricing
--
-- Adds a per-trip budget (with its own currency, independent of item
-- currencies) and an optional per-night price on accommodations. The existing
-- `accommodations.cost` stays the source of truth for totals; `price_per_night`
-- is a convenience input that the app multiplies by the number of nights to
-- fill `cost` when no total is given.

alter table public.trips
  add column if not exists budget numeric(12,2),
  add column if not exists budget_currency text not null default 'EUR';

alter table public.accommodations
  add column if not exists price_per_night numeric(12,2);
