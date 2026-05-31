-- Payment tracking on accommodations: whether the stay is already paid, and an
-- optional payment due date. Additive + nullable so existing rows are untouched.
alter table public.accommodations
  add column if not exists is_paid boolean not null default false,
  add column if not exists payment_due_date date;
