-- Phase 2: map support for accommodations
--
-- Areas already carry latitude/longitude; accommodations only had a free-text
-- address. Add optional coordinates so individual stays can be pinned on the
-- map. Filled via the geocoding helper or manual entry; nothing is required.

alter table public.accommodations
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
