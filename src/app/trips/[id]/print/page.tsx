import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BOARD_LEVELS, TRIP_KINDS } from "@/lib/constants";
import {
  formatDate,
  formatDateRange,
  formatDateTime,
  formatTime,
  formatCurrency,
  nightsBetween,
} from "@/lib/format";
import PrintButton from "@/components/print/PrintButton";
import { ArrowLeft, Download } from "@/components/icons";

export const dynamic = "force-dynamic";

// Standalone, print-friendly trip summary (outside the (app) shell — no
// sidebar/header). Light background + dark text regardless of app theme.
export default async function TripPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/trips/${id}/print`);

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!trip) notFound();

  const [
    { data: areas },
    { data: accommodations },
    { data: flights },
    { data: travelers },
    { data: notes },
    { data: todos },
  ] = await Promise.all([
    supabase.from("areas").select("*").eq("trip_id", id).order("sort_order").order("created_at"),
    supabase
      .from("accommodations")
      .select("*")
      .eq("trip_id", id)
      .order("check_in_date", { nullsFirst: false }),
    supabase
      .from("flights")
      .select("*")
      .eq("trip_id", id)
      .order("departure_time", { nullsFirst: false }),
    supabase.from("travelers").select("*").eq("trip_id", id).order("name"),
    supabase
      .from("trip_notes")
      .select("*")
      .eq("trip_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("trip_todos")
      .select("*")
      .eq("trip_id", id)
      .order("done")
      .order("due_date", { nullsFirst: false })
      .order("created_at"),
  ]);

  const accs = accommodations ?? [];
  const fls = flights ?? [];
  const trvs = travelers ?? [];
  const tds = todos ?? [];
  const note = (notes ?? [])[0] ?? null;

  const total =
    accs.reduce((s, a) => s + (a.cost ?? 0), 0) +
    fls.reduce((s, f) => s + (f.cost ?? 0), 0);

  const areaName = (areaId: string | null) =>
    areas?.find((a) => a.id === areaId)?.name ?? null;

  return (
    <main className="print-page mx-auto max-w-3xl bg-white px-6 py-8 text-zinc-900">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print mb-6 flex items-center justify-between gap-3">
        <Link
          href={`/trips/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Zurück zur Reise
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`/trips/${id}/calendar`}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            Kalender (.ics)
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Header */}
      <header className="mb-6 border-b border-zinc-300 pb-4">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          {TRIP_KINDS[trip.kind] ?? trip.kind}
        </div>
        <h1 className="mt-1 text-2xl font-bold">{trip.name}</h1>
        <div className="mt-1 text-sm text-zinc-600">
          {trip.destination && <span>{trip.destination} · </span>}
          {formatDateRange(trip.start_date, trip.end_date)}
        </div>
        {trip.description && (
          <p className="mt-2 max-w-2xl text-sm text-zinc-700">{trip.description}</p>
        )}
        <div className="mt-2 text-sm">
          <span className="font-medium">Gesamtkosten:</span>{" "}
          {formatCurrency(total)}
          {trip.budget != null && (
            <>
              {" "}
              · <span className="font-medium">Budget:</span>{" "}
              {formatCurrency(trip.budget, trip.budget_currency)}
            </>
          )}
        </div>
      </header>

      {/* Flights */}
      {fls.length > 0 && (
        <section className="print-section mb-6">
          <h2 className="mb-2 text-base font-semibold">Flüge</h2>
          <div className="space-y-2">
            {fls.map((f) => (
              <div
                key={f.id}
                className="print-card rounded border border-zinc-200 p-3 text-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-medium">
                    {f.departure_airport || "—"} → {f.arrival_airport || "—"}
                    {(f.airline || f.flight_number) && (
                      <span className="ml-2 font-normal text-zinc-500">
                        {[f.airline, f.flight_number].filter(Boolean).join(" ")}
                      </span>
                    )}
                  </div>
                  {f.cost != null && (
                    <div className="text-zinc-600">
                      {formatCurrency(f.cost, f.currency)}
                    </div>
                  )}
                </div>
                <div className="mt-1 text-zinc-600">
                  Abflug: {formatDateTime(f.departure_time)} · Ankunft:{" "}
                  {formatDateTime(f.arrival_time)}
                </div>
                {f.booking_reference && (
                  <div className="text-zinc-500">
                    Buchung: {f.booking_reference}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Accommodations */}
      {accs.length > 0 && (
        <section className="print-section mb-6">
          <h2 className="mb-2 text-base font-semibold">Unterkünfte</h2>
          <div className="space-y-2">
            {accs.map((a) => {
              const nights = nightsBetween(a.check_in_date, a.check_out_date);
              const area = areaName(a.area_id);
              return (
                <div
                  key={a.id}
                  className="print-card rounded border border-zinc-200 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-medium">
                      {a.name}
                      {area && (
                        <span className="ml-2 font-normal text-zinc-500">
                          {area}
                        </span>
                      )}
                    </div>
                    {a.cost != null && (
                      <div className="text-zinc-600">
                        {formatCurrency(a.cost, a.currency)}
                      </div>
                    )}
                  </div>
                  {a.address && (
                    <div className="text-zinc-600">{a.address}</div>
                  )}
                  <div className="mt-1 text-zinc-600">
                    Check-in: {formatDate(a.check_in_date)}
                    {a.check_in_time && ` ${formatTime(a.check_in_time)}`} ·
                    Check-out: {formatDate(a.check_out_date)}
                    {a.check_out_time && ` ${formatTime(a.check_out_time)}`}
                    {nights ? ` · ${nights} ${nights === 1 ? "Nacht" : "Nächte"}` : ""}
                  </div>
                  <div className="text-zinc-500">
                    {BOARD_LEVELS[a.board_level] ?? a.board_level}
                    {a.cancellation_deadline &&
                      ` · kostenlos stornierbar bis ${formatDate(a.cancellation_deadline)}`}
                    {a.booking_reference && ` · Buchung: ${a.booking_reference}`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Travelers */}
      {trvs.length > 0 && (
        <section className="print-section mb-6">
          <h2 className="mb-2 text-base font-semibold">Mitreisende</h2>
          <ul className="space-y-1 text-sm">
            {trvs.map((t) => (
              <li key={t.id} className="text-zinc-700">
                {t.name}
                {(t.email || t.phone) && (
                  <span className="text-zinc-500">
                    {" "}
                    — {[t.email, t.phone].filter(Boolean).join(", ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* To-dos */}
      {tds.length > 0 && (
        <section className="print-section mb-6">
          <h2 className="mb-2 text-base font-semibold">Checkliste</h2>
          <ul className="space-y-1 text-sm">
            {tds.map((t) => (
              <li key={t.id} className="flex items-baseline gap-2 text-zinc-700">
                <span className="text-zinc-400">{t.done ? "[x]" : "[ ]"}</span>
                <span className={t.done ? "text-zinc-400 line-through" : ""}>
                  {t.title}
                  {t.due_date && (
                    <span className="text-zinc-500">
                      {" "}
                      (fällig {formatDate(t.due_date)})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Notes */}
      {note?.content?.trim() && (
        <section className="print-section mb-6">
          <h2 className="mb-2 text-base font-semibold">Notizen</h2>
          <div
            className="richtext text-sm text-zinc-700"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </section>
      )}

      <footer className="mt-8 border-t border-zinc-300 pt-3 text-xs text-zinc-400">
        Erstellt mit TravelPlanner
      </footer>
    </main>
  );
}
