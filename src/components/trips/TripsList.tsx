import { createClient } from "@/lib/supabase/server";
import NewTripButton from "@/components/NewTripButton";
import { Luggage } from "@/components/icons";
import TripsBrowser, { type TripItem } from "./TripsBrowser";

type Scope = "owned" | "shared";

export default async function TripsList({
  scope,
  title,
  subtitle,
  emptyTitle,
  emptyText,
  showNewButton = false,
}: {
  scope: Scope;
  title: string;
  subtitle?: string;
  emptyTitle: string;
  emptyText: string;
  showNewButton?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // IMPORTANT: filter to MY membership rows. The members_select policy allows
  // reading membership rows of any *viewable* trip (incl. public Follow-Me
  // trips), so without this filter a user would see other people's trips here.
  const { data: memberships } = await supabase
    .from("trip_members")
    .select("role, status, trips(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const all = (memberships ?? [])
    .map((m) => ({ role: m.role, status: m.status, trip: m.trips }))
    .filter((m): m is { role: string; status: string; trip: NonNullable<typeof m.trip> } =>
      Boolean(m.trip),
    );

  const trips =
    scope === "owned"
      ? all.filter((m) => m.role === "owner")
      : all.filter((m) => m.role !== "owner" && m.status === "active");

  const tripIds = trips.map((t) => t.trip.id);

  // Aggregate costs + member counts across the listed trips in batched queries.
  const costByTrip = new Map<string, number>();
  const membersByTrip = new Map<string, number>();

  if (tripIds.length) {
    const [{ data: accs }, { data: fls }, { data: mems }] = await Promise.all([
      supabase.from("accommodations").select("trip_id, cost").in("trip_id", tripIds),
      supabase.from("flights").select("trip_id, cost").in("trip_id", tripIds),
      supabase
        .from("trip_members")
        .select("trip_id")
        .in("trip_id", tripIds)
        .eq("status", "active"),
    ]);
    for (const row of [...(accs ?? []), ...(fls ?? [])]) {
      if (row.cost)
        costByTrip.set(row.trip_id, (costByTrip.get(row.trip_id) ?? 0) + row.cost);
    }
    for (const m of mems ?? [])
      membersByTrip.set(m.trip_id, (membersByTrip.get(m.trip_id) ?? 0) + 1);
  }

  const items: TripItem[] = trips.map(({ trip, role }) => ({
    trip,
    role,
    members: membersByTrip.get(trip.id) ?? 1,
    cost: costByTrip.get(trip.id) ?? 0,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-[var(--muted)]">
            {subtitle ?? `${trips.length} ${trips.length === 1 ? "Eintrag" : "Einträge"}`}
          </p>
        </div>
        {showNewButton && <NewTripButton />}
      </div>

      {trips.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Luggage className="h-10 w-10 text-[var(--muted)]" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold">{emptyTitle}</h2>
          <p className="max-w-sm text-sm text-[var(--muted)]">{emptyText}</p>
          {showNewButton && <NewTripButton />}
        </div>
      ) : (
        <TripsBrowser items={items} />
      )}
    </div>
  );
}
