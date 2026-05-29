import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NewTripButton from "@/components/NewTripButton";
import { TRIP_KINDS } from "@/lib/constants";
import { formatCurrency, formatDateRange } from "@/lib/format";

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

  const { data: memberships } = await supabase
    .from("trip_members")
    .select("role, status, trips(*)")
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
          <div className="text-5xl">🗺️</div>
          <h2 className="text-lg font-semibold">{emptyTitle}</h2>
          <p className="max-w-sm text-sm text-[var(--muted)]">{emptyText}</p>
          {showNewButton && <NewTripButton />}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map(({ trip, role }) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="card group overflow-hidden transition hover:shadow-md"
            >
              <div className="h-2" style={{ backgroundColor: trip.cover_color ?? "#2563eb" }} />
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight group-hover:text-[var(--primary)]">
                    {trip.name}
                  </h3>
                  <span className="chip shrink-0 bg-black/5 dark:bg-white/10">
                    {TRIP_KINDS[trip.kind] ?? trip.kind}
                  </span>
                </div>
                {trip.destination && (
                  <p className="text-sm text-[var(--muted)]">📍 {trip.destination}</p>
                )}
                <p className="mt-1 text-sm text-[var(--muted)]">
                  🗓️ {formatDateRange(trip.start_date, trip.end_date)}
                </p>
                <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-[var(--muted)]">
                    👥 {membersByTrip.get(trip.id) ?? 1}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(costByTrip.get(trip.id) ?? 0)}
                  </span>
                </div>
                {role === "owner" && (
                  <span className="mt-2 inline-block text-xs text-[var(--muted)]">
                    ⭐ Du bist Eigentümer
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
