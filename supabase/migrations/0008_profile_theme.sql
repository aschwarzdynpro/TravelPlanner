-- Design: per-user theme preference
--
-- Stores the chosen color scheme on the profile so it follows the user across
-- devices. Allowed values: 'system' (default, follow OS), 'light', 'dark'.
-- Signed-out / pre-migration rows default to 'system'.

alter table public.profiles
  add column if not exists theme text not null default 'system';
