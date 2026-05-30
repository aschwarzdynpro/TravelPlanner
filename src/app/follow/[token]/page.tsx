import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BOARD_LEVELS, TRIP_KINDS } from "@/lib/constants";
import {
  formatDate,
  formatDateRange,
  formatDateTime,
  formatTime,
  formatCurrency,
} from "@/lib/format";
import TripMap, { type MapMarker } from "@/components/map/TripMap";
import { Share2, MapIcon, Plane, Hotel, MapPin } from "@/components/icons";
import FollowButton from "@/components/trip/FollowButton";

export const dynamic = "force-dynamic";

// Shape returned by the get_shared_trip RPC (already masked per share level).
type SharedArea = {
  id: string;
  name: string;
  region: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  arrival_date: string | null;
  departure_date: string | null;
  sort_order: number;
};
type SharedStay = {
  id: string;
  area_id: string | null;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  check_in_date: string | null;
  check_out_date: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  board_level: string;
  cost: number | null;
  price_per_night: number | null;
  currency: string | null;
};
type SharedFlight = {
  id: string;
  airline: string | null;
  flight_number: string | null;
  departure_airport: string | null;
  arrival_airport: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  cost: number | null;
  currency: string | null;
};
type SharedTrip = {
  trip: {
    id: string;
    created_by: string;
    name: string;
    kind: string;
    destination: string | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    cover_color: string | null;
    share_level: "basic" | "plus" | "full";
    budget: number | null;
    budget_currency: string | null;
  };
  areas: SharedArea[];
  accommodations: SharedStay[];
  flights: SharedFlight[];
};

export default async function FollowPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // The RPC returns ONLY what the share level allows, and only for a public
  // trip — so narrower levels can't be bypassed via the API.
  const { data: shared } = await supabase.rpc("get_shared_trip", {
    p_token: token,
  });
  if (!shared) notFound();

  const data = shared as unknown as SharedTrip;
  const { trip, areas, accommodations, flights } = data;
  const showCosts = trip.share_level === "full";

  // The trip id comes from the RPC (non-members can no longer read the trips
  // row directly). The follow/membership lookups below are scoped to the
  // current user by RLS.
  const tripId = trip.id;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isFollowing = false;
  let isMember = false;
  if (user) {
    const [{ data: follow }, { data: membership }] = await Promise.all([
      supabase
        .from("trip_follows")
        .select("id")
        .eq("trip_id", tripId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("trip_members")
        .select("id")
        .eq("trip_id", tripId)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    isFollowing = Boolean(follow);
    isMember = Boolean(membership) || trip.created_by === user.id;
  }

  const accByArea = (areaId: string | null) =>
    accommodations.filter((a) => a.area_id === areaId);

  const mapMarkers: MapMarker[] = [];
  for (const area of areas) {
    if (area.latitude != null && area.longitude != null) {
      mapMarkers.push({
        id: `area-${area.id}`,
        latitude: area.latitude,
        longitude: area.longitude,
        title: area.name,
        subtitle: area.region ?? undefined,
      });
    }
  }
  for (const a of accommodations) {
    if (a.latitude != null && a.longitude != null) {
      mapMarkers.push({
        id: `acc-${a.id}`,
        latitude: a.latitude,
        longitude: a.longitude,
        title: a.name,
        subtitle: a.address ?? undefined,
      });
    }
  }

  return (
    <div className="min-h-screen">
      <div
        className="px-4 py-10 text-white"
        style={{ backgroundColor: trip.cover_color ?? "#18181b" }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
            Follow Me · {TRIP_KINDS[trip.kind] ?? trip.kind}
          </div>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
          <p className="mt-1 opacity-90">
            {trip.destination && `${trip.destination} · `}
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
          {trip.description && (
            <p className="mt-3 max-w-2xl opacity-90">{trip.description}</p>
          )}
          {user && !isMember && (
            <div className="mt-4">
              <FollowButton tripId={tripId} initialFollowing={isFollowing} />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Budget (full only) */}
        {showCosts && trip.budget != null && (
          <section className="card p-4">
            <span className="text-sm text-[var(--muted)]">Budget: </span>
            <span className="font-semibold">
              {formatCurrency(trip.budget, trip.budget_currency ?? "EUR")}
            </span>
          </section>
        )}

        {/* Map */}
        {mapMarkers.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <MapIcon className="h-5 w-5" strokeWidth={2} />
              Karte
            </h2>
            <TripMap
              markers={mapMarkers}
              className="h-[360px] w-full overflow-hidden rounded-xl border"
            />
          </section>
        )}

        {/* Flights */}
        {flights.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Plane className="h-5 w-5" strokeWidth={2} />
              Flüge
            </h2>
            <div className="space-y-2">
              {flights.map((f) => (
                <div
                  key={f.id}
                  className="card flex flex-wrap items-center gap-3 p-4"
                >
                  <div className="text-lg font-medium">
                    {f.departure_airport || "—"} → {f.arrival_airport || "—"}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    {[f.airline, f.flight_number].filter(Boolean).join(" ")}
                  </div>
                  <div className="ml-auto text-right text-sm">
                    <div>{formatDateTime(f.departure_time)}</div>
                    {showCosts && f.cost != null && (
                      <div className="text-[var(--muted)]">
                        {formatCurrency(f.cost, f.currency ?? "EUR")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Areas + accommodations */}
        {areas.map((area) => (
          <section key={area.id}>
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5" strokeWidth={2} />
              {area.name}
            </h2>
            {(area.region || area.arrival_date) && (
              <p className="mb-3 text-sm text-[var(--muted)]">
                {area.region}
                {area.region && area.arrival_date && " · "}
                {(area.arrival_date || area.departure_date) &&
                  `${formatDate(area.arrival_date)} – ${formatDate(area.departure_date)}`}
              </p>
            )}
            {accByArea(area.id).length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {accByArea(area.id).map((a) => (
                  <PublicStay key={a.id} a={a} showCosts={showCosts} />
                ))}
              </div>
            )}
          </section>
        ))}

        {accByArea(null).length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Hotel className="h-5 w-5" strokeWidth={2} />
              Unterkünfte
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {accByArea(null).map((a) => (
                <PublicStay key={a.id} a={a} showCosts={showCosts} />
              ))}
            </div>
          </section>
        )}

        <p className="pt-6 text-center text-xs text-[var(--muted)]">
          Geteilt mit TravelPlanner · schreibgeschützte Ansicht
        </p>
      </div>
    </div>
  );
}

function PublicStay({ a, showCosts }: { a: SharedStay; showCosts: boolean }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{a.name}</h3>
        {showCosts && a.cost != null && (
          <span className="shrink-0 text-sm font-medium">
            {formatCurrency(a.cost, a.currency ?? "EUR")}
          </span>
        )}
      </div>
      {a.address && (
        <p className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          {a.address}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>
          Check-in: {formatDate(a.check_in_date)}
          {a.check_in_time && ` ${formatTime(a.check_in_time)}`}
        </span>
        <span>
          Check-out: {formatDate(a.check_out_date)}
          {a.check_out_time && ` ${formatTime(a.check_out_time)}`}
        </span>
      </div>
      <span className="mt-2 inline-block chip bg-black/5 text-[var(--muted)] dark:bg-white/10">
        {BOARD_LEVELS[a.board_level] ?? a.board_level}
      </span>
    </div>
  );
}
