-- Birth date for travelers, used to derive age (e.g. for booking child prices).
--
-- Additive only. Nullable so existing travelers are untouched. A loose upper
-- bound guards against obvious typos; lower bound is just "not in the future".
alter table public.travelers
  add column if not exists birth_date date
    check (birth_date is null or (birth_date > '1900-01-01' and birth_date <= now()::date));
