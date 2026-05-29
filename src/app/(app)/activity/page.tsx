import { createClient } from "@/lib/supabase/server";
import GlobalActivityFeed, {
  type GlobalActivityEntry,
} from "@/components/activity/GlobalActivityFeed";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Scope to trips I'm a member of. RLS would also expose public ("Follow-Me")
  // trips' activity to anyone, so we explicitly restrict to my trip ids.
  const { data: myMemberships } = await supabase
    .from("trip_members")
    .select("trip_id")
    .eq("user_id", user!.id);
  const tripIds = (myMemberships ?? []).map((m) => m.trip_id);

  const { data } = tripIds.length
    ? await supabase
        .from("trip_activity")
        .select("*, profiles(display_name, email), trips(name, cover_color)")
        .in("trip_id", tripIds)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const initial: GlobalActivityEntry[] = (data ?? []).map((a) => ({
    id: a.id,
    trip_id: a.trip_id,
    user_id: a.user_id,
    action: a.action,
    detail: (a.detail ?? {}) as GlobalActivityEntry["detail"],
    created_at: a.created_at,
    actorName: a.profiles?.display_name || a.profiles?.email || null,
    tripName: a.trips?.name ?? null,
    tripColor: a.trips?.cover_color ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feed</h1>
        <p className="text-sm text-[var(--muted)]">
          Alle Änderungen an deinen und mit dir geteilten Reisen – live
          aktualisiert.
        </p>
      </div>

      <GlobalActivityFeed initial={initial} tripIds={tripIds} />
    </div>
  );
}
