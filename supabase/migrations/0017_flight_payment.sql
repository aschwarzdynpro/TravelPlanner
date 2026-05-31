-- Payment tracking on flights, mirroring accommodations: whether it's already
-- paid + an optional payment due date. Additive + nullable; existing rows
-- default to unpaid.
alter table public.flights
  add column if not exists is_paid boolean not null default false,
  add column if not exists payment_due_date date;
