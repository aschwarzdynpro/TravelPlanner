import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BOARD_LEVELS, TRIP_KINDS } from "@/lib/constants";
import {
  formatDate,
  formatDateRange,
  formatDateTime,
  formatTime,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FollowPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("share_token", token)
    .eq("is_public", true)
    .maybeSingle();

  if (!trip) notFound();

  const [{ data: areas }, { data: accommodations }, { data: flights }] =
    await Promise.all([
      supabase.from("areas").select("*").eq("trip_id", trip.id).order("sort_order"),
      supabase
        .from("accommodations")
        .select("*")
        .eq("trip_id", trip.id)
        .order("check_in_date", { nullsFirst: false }),
      supabase
        .from("flights")
        .select("*")
        .eq("trip_id", trip.id)
        .order("departure_time", { nullsFirst: false }),
    ]);

  const accByArea = (areaId: string | null) =>
    (accommodations ?? []).filter((a) => a.area_id === areaId);

  return (
    <div className="min-h-screen">
      <div
        className="px-4 py-10 text-white"
        style={{ backgroundColor: trip.cover_color ?? "#2563eb" }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            📡 Follow Me · {TRIP_KINDS[trip.kind] ?? trip.kind}
          </div>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
          <p className="mt-1 opacity-90">
            {trip.destination && `${trip.destination} · `}
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
          {trip.description && (
            <p className="mt-3 max-w-2xl opacity-90">{trip.description}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Flights */}
        {(flights ?? []).length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">✈️ Flüge</h2>
            <div className="space-y-2">
              {(flights ?? []).map((f) => (
                <div key={f.id} className="card flex flex-wrap items-center gap-3 p-4">
                  <div className="text-lg font-medium">
                    {f.departure_airport || "—"} → {f.arrival_airport || "—"}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    {f.airline} {f.flight_number}
                  </div>
                  <div className="ml-auto text-right text-sm">
                    <div>{formatDateTime(f.departure_time)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Areas + accommodations */}
        {(areas ?? []).map((area) => (
          <section key={area.id}>
            <h2 className="mb-1 text-lg font-semibold">🗺️ {area.name}</h2>
            {(area.region || area.arrival_date) && (
              <p className="mb-3 text-sm text-[var(--muted)]">
                {area.region}
                {area.region && area.arrival_date && " · "}
                {(area.arrival_date || area.departure_date) &&
                  `${formatDate(area.arrival_date)} – ${formatDate(area.departure_date)}`}
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {accByArea(area.id).map((a) => (
                <PublicStay key={a.id} a={a} />
              ))}
            </div>
          </section>
        ))}

        {accByArea(null).length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">🏨 Unterkünfte</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {accByArea(null).map((a) => (
                <PublicStay key={a.id} a={a} />
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

function PublicStay({
  a,
}: {
  a: {
    name: string;
    address: string | null;
    check_in_date: string | null;
    check_out_date: string | null;
    check_in_time: string | null;
    check_out_time: string | null;
    board_level: string;
  };
}) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold">{a.name}</h3>
      {a.address && <p className="text-sm text-[var(--muted)]">📍 {a.address}</p>}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>
          🛬 {formatDate(a.check_in_date)}
          {a.check_in_time && ` ${formatTime(a.check_in_time)}`}
        </span>
        <span>
          🛫 {formatDate(a.check_out_date)}
          {a.check_out_time && ` ${formatTime(a.check_out_time)}`}
        </span>
      </div>
      <span className="mt-2 inline-block chip bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        {BOARD_LEVELS[a.board_level] ?? a.board_level}
      </span>
    </div>
  );
}
