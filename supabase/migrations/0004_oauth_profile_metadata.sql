-- Populate profile name/avatar from OAuth metadata (Google/Apple provide
-- full_name/name/avatar_url/picture) in addition to our email-signup field.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (id) do nothing;

  update public.trip_members
  set user_id = new.id, status = 'active'
  where invited_email is not null
    and lower(invited_email) = lower(new.email)
    and user_id is null;
  return new;
end; $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
