-- Phase 4: enable realtime for the activity feed
--
-- trip_activity already exists with RLS (select via can_view_trip, insert via
-- can_edit_trip). To stream new entries to clients, add the table to the
-- supabase_realtime publication. Realtime still enforces the existing RLS
-- select policy per subscriber. Guarded so re-running is a no-op.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'trip_activity'
  ) then
    alter publication supabase_realtime add table public.trip_activity;
  end if;
end $$;
