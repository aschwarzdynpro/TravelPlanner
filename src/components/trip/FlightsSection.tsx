"use client";

import type { WorkspaceData } from "./types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import FlightFormButton from "./FlightFormButton";
import DeleteButton from "@/components/DeleteButton";
import { deleteFlight } from "@/app/(app)/trips/[id]/actions";
import { flightTrackUrl } from "@/lib/links";

export default function FlightsSection({
  trip,
  flights,
  canEdit,
}: WorkspaceData) {
  return (
    <div className="space-y-4">
      {canEdit && (
        <FlightFormButton tripId={trip.id} label="+ Flug" className="btn-primary" />
      )}

      {flights.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-[var(--muted)]">
          ✈️ Noch keine Flüge eingetragen.
        </div>
      ) : (
        <div className="space-y-3">
          {flights.map((f) => {
            const trackUrl = flightTrackUrl(f.flight_number);
            return (
            <div key={f.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold">
                    {f.airline || "Flug"}{" "}
                    {f.flight_number && (
                      <span className="text-[var(--muted)]">· {f.flight_number}</span>
                    )}
                  </h4>
                  <div className="mt-1 flex items-center gap-2 text-lg font-medium">
                    <span>{f.departure_airport || "—"}</span>
                    <span className="text-[var(--muted)]">→</span>
                    <span>{f.arrival_airport || "—"}</span>
                  </div>
                </div>
                <div className="text-right font-semibold">
                  {formatCurrency(f.cost, f.currency)}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
                  <div className="text-xs text-[var(--muted)]">Abflug</div>
                  <div className="font-medium">{formatDateTime(f.departure_time)}</div>
                </div>
                <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
                  <div className="text-xs text-[var(--muted)]">Ankunft</div>
                  <div className="font-medium">{formatDateTime(f.arrival_time)}</div>
                </div>
              </div>

              {f.cancellation_policy && (
                <div className="mt-3 rounded-lg border border-dashed p-2 text-sm">
                  <div className="text-xs font-semibold text-[var(--muted)]">
                    Stornierung
                  </div>
                  <p className="text-[var(--muted)]">{f.cancellation_policy}</p>
                </div>
              )}

              {f.notes && (
                <p className="mt-2 text-sm text-[var(--muted)]">📝 {f.notes}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3 text-xs">
                {f.booking_reference && (
                  <span className="text-[var(--muted)]">
                    Buchung: {f.booking_reference}
                  </span>
                )}
                {trackUrl && (
                  <a
                    href={trackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline"
                  >
                    🛫 Flug verfolgen ↗
                  </a>
                )}
                {f.booking_url && (
                  <a
                    href={f.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline"
                  >
                    Buchung öffnen ↗
                  </a>
                )}
                {canEdit && (
                  <div className="ml-auto flex items-center gap-3">
                    <FlightFormButton
                      tripId={trip.id}
                      flight={f}
                      label="Bearbeiten"
                      className="text-xs text-[var(--primary)] hover:underline"
                    />
                    <DeleteButton
                      action={deleteFlight}
                      id={f.id}
                      tripId={trip.id}
                      confirmText="Diesen Flug löschen?"
                    />
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
