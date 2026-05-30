import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { tripMetrics, costByCountry, usedCurrencies } from "@/lib/analytics";
import { TrendingUp, MapPin, TriangleAlert, ArrowRight } from "@/components/icons";

export const dynamic = "force-dynamic";

// Global insights across all trips the user owns. Owned-only so the numbers
// reflect the user's own spending, not trips they were merely invited to.
export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("trip_members")
    .select("role, trips(id, name, share_token, budget, budget_currency)")
    .eq("user_id", user!.id)
    .eq("role", "owner");

  const trips = (memberships ?? [])
    .map((m) => m.trips)
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const tripIds = trips.map((t) => t.id);

  // Pull all priced children + areas for the owned trips in batched queries.
  type Acc = {
    trip_id: string;
    cost: number | null;
    currency: string;
    area_id: string | null;
    check_in_date: string | null;
    check_out_date: string | null;
  };
  type Fl = { trip_id: string; cost: number | null; currency: string };
  type Ar = { id: string; trip_id: string; country_code: string | null };

  let accs: Acc[] = [];
  let flights: Fl[] = [];
  let areas: Ar[] = [];
  if (tripIds.length) {
    const [a, f, ar] = await Promise.all([
      supabase
        .from("accommodations")
        .select("trip_id, cost, currency, area_id, check_in_date, check_out_date")
        .in("trip_id", tripIds),
      supabase.from("flights").select("trip_id, cost, currency").in("trip_id", tripIds),
      supabase.from("areas").select("id, trip_id, country_code").in("trip_id", tripIds),
    ]);
    accs = (a.data as Acc[]) ?? [];
    flights = (f.data as Fl[]) ?? [];
    areas = (ar.data as Ar[]) ?? [];
  }

  const overall = tripMetrics(accs, flights);
  const byCountry = costByCountry(accs, areas);
  const currencies = usedCurrencies(accs, flights);
  const tripCount = trips.length;
  const avgPerTrip = tripCount ? overall.total / tripCount : 0;

  // Per-trip totals for the ranking list.
  const perTrip = trips
    .map((t) => {
      const ta = accs.filter((x) => x.trip_id === t.id);
      const tf = flights.filter((x) => x.trip_id === t.id);
      return { trip: t, total: ta.reduce((s, x) => s + (x.cost ?? 0), 0) + tf.reduce((s, x) => s + (x.cost ?? 0), 0) };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auswertungen</h1>
        <p className="text-sm text-[var(--muted)]">
          Über alle Reisen, die dir gehören
        </p>
      </div>

      {tripCount === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <TrendingUp className="h-10 w-10 text-[var(--muted)]" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold">Noch keine Daten</h2>
          <p className="max-w-md text-sm text-[var(--muted)]">
            Sobald du Reisen mit Kosten anlegst, erscheinen hier Gesamtausgaben,
            Durchschnittswerte und eine Aufschlüsselung pro Land.
          </p>
        </div>
      ) : (
        <>
          {currencies.length > 1 && (
            <p className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>
                Mehrere Währungen im Einsatz ({currencies.join(", ")}). Die Summen
                addieren die Beträge ohne Umrechnung und sind daher nur ein grober
                Anhaltspunkt.
              </span>
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Gesamtausgaben" value={formatCurrency(overall.total)} />
            <Stat label="Reisen" value={String(tripCount)} hint={`Ø ${formatCurrency(avgPerTrip)} / Reise`} />
            <Stat
              label="Ø pro Nacht"
              value={overall.nights > 0 ? formatCurrency(overall.avgPerNight) : "—"}
              hint={overall.nights > 0 ? `${overall.nights} Nächte gesamt` : undefined}
            />
            <Stat
              label="Ø pro Flug"
              value={overall.flightCount > 0 ? formatCurrency(overall.avgPerFlight) : "—"}
              hint={overall.flightCount > 0 ? `${overall.flightCount} Flüge` : undefined}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Spend per trip */}
            <div className="card p-5">
              <h3 className="mb-4 font-semibold">Ausgaben pro Reise</h3>
              <div className="space-y-3">
                {perTrip.map(({ trip, total }) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="group block"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate group-hover:underline">{trip.name}</span>
                      <span className="shrink-0 font-medium">{formatCurrency(total)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-[var(--primary)]"
                        style={{
                          width: `${overall.total > 0 ? Math.round((total / overall.total) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Cost per country */}
            <div className="card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4" strokeWidth={2} />
                Unterkunftskosten pro Land
              </h3>
              {byCountry.length === 0 || overall.accTotal === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  Noch keine Unterkunftskosten erfasst.
                </p>
              ) : (
                <div className="space-y-3">
                  {byCountry.map((c) => (
                    <div key={c.code ?? "none"}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>
                          {c.name}
                          {c.nights > 0 && (
                            <span className="ml-1.5 text-xs text-[var(--muted)]">
                              · Ø {formatCurrency(c.cost / c.nights)} / Nacht
                            </span>
                          )}
                        </span>
                        <span className="font-medium">{formatCurrency(c.cost)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-[var(--primary)]"
                          style={{
                            width: `${overall.accTotal > 0 ? Math.round((c.cost / overall.accTotal) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Link
            href="/trips"
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            Zu meinen Reisen
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-[var(--muted)]">{hint}</div>}
    </div>
  );
}
