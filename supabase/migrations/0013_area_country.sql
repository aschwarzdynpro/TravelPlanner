-- Area country (ISO 3166-1 alpha-2) for better analytics ("costs per country").
--
-- Additive only. region stays as free-text detail; country_code is the
-- controlled value used for grouping. Nullable so existing areas are untouched.
alter table public.areas
  add column if not exists country_code text
    check (country_code is null or country_code ~ '^[A-Z]{2}$');
