-- User display preference: whether embedded area map previews are shown on the
-- trip workspace. Additive, defaults to true so behaviour is unchanged.
alter table public.profiles
  add column if not exists show_area_maps boolean not null default true;
