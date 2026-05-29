import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NewTripButton from "@/components/NewTripButton";
import { TRIP_KINDS } from "@/lib/constants";
import { formatCurrency, formatDateRange, daysUntil } from "@/lib/format";
import { MapPin, CalendarDays, Users, Crown, Luggage, ChevronRight } from "@/components/icons";
import type { Tables } from "@/lib/database.types";

type Scope = "owned" | "shared";
type Trip = Tables<"trips">;

function TripCard({
  trip,
  role,
  members,
  cost,
}: {
  trip: Trip;
  role: string;
  members: number;
  cost: number;
}) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="card group overflow-hidden transition hover:shadow-md"
    >
      <div className="h-2" style={{ backgroundColor: trip.cover_color ?? "#18181b" }} />
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight group-hover:text-[var(--muted)]">
            {trip.name}
          </h3>
          <span className="chip shrink-0 bg-black/5 dark:bg-white/10">
            {TRIP_KINDS[trip.kind] ?? trip.kind}
          </span>
        </div>
        {trip.destination && (
          <p className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {trip.destination}
          </p>
        )}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted)]">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          {formatDateRange(trip.start_date, trip.end_date)}
        </p>
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
          <span className="flex items-center gap-1.5 text-[var(--muted)]">
            <Users className="h-3.5 w-3.5" strokeWidth={2} />
            {members}
          </span>
          <span className="font-semibold">{formatCurrency(cost)}</span>
        </div>
        {role === "owner" && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--muted)]">
            <Crown className="h-3 w-3" strokeWidth={2} />
            Du bist Eigentümer
          </span>
        )}
      </div>
    </Link>
  );
}

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

  // A trip is "past" once its effective end (end_date, else start_date) is
  // before today. Trips without any date count as current/upcoming.
  const isPast = (t: Trip) => {
    const ref = t.end_date ?? t.start_date;
    return ref != null && (daysUntil(ref) ?? 0) < 0;
  };
  const upcoming = trips.filter((t) => !isPast(t.trip));
  const past = trips.filter((t) => isPast(t.trip));

  const grid = (items: typeof trips) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ trip, role }) => (
        <TripCard
          key={trip.id}
          trip={trip}
          role={role}
          members={membersByTrip.get(trip.id) ?? 1}
          cost={costByTrip.get(trip.id) ?? 0}
        />
      ))}
    </div>
  );

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
        <div className="space-y-6">
          {upcoming.length > 0 ? (
            grid(upcoming)
          ) : (
            <div className="card px-6 py-10 text-center text-sm text-[var(--muted)]">
              Keine anstehenden Reisen. Vergangene findest du unten.
            </div>
          )}

          {past.length > 0 && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-2 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
                <ChevronRight
                  className="h-4 w-4 transition-transform group-open:rotate-90"
                  strokeWidth={2}
                />
                Vergangene Reisen ({past.length})
              </summary>
              <div className="mt-3">{grid(past)}</div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
