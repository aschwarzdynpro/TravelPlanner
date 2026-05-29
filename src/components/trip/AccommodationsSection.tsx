"use client";

import type { WorkspaceData, Accommodation } from "./types";
import { BOARD_LEVELS } from "@/lib/constants";
import {
  formatCurrency,
  formatDate,
  formatTime,
  daysUntil,
} from "@/lib/format";
import AreaFormButton from "./AreaFormButton";
import AccommodationFormButton from "./AccommodationFormButton";
import DeleteButton from "@/components/DeleteButton";
import { deleteArea, deleteAccommodation } from "@/app/(app)/trips/[id]/actions";
import { mapsSearchUrl, mapsDirectionsUrl, placeMapUrl } from "@/lib/links";

function AccommodationCard({
  acc,
  areas,
  tripId,
  canEdit,
}: {
  acc: Accommodation;
  areas: WorkspaceData["areas"];
  tripId: string;
  canEdit: boolean;
}) {
  const left = daysUntil(acc.cancellation_deadline);
  const mapQuery = acc.address || acc.name;
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold">{acc.name}</h4>
          {acc.address && (
            <a
              href={mapsSearchUrl(acc.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--muted)] hover:text-[var(--primary)] hover:underline"
            >
              📍 {acc.address}
            </a>
          )}
        </div>
        <div className="text-right">
          <div className="font-semibold">
            {formatCurrency(acc.cost, acc.currency)}
          </div>
          <span className="chip bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {BOARD_LEVELS[acc.board_level] ?? acc.board_level}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
          <div className="text-xs text-[var(--muted)]">Check-in</div>
          <div className="font-medium">{formatDate(acc.check_in_date)}</div>
          {acc.check_in_time && (
            <div className="text-xs text-[var(--muted)]">
              ab {formatTime(acc.check_in_time)} Uhr
            </div>
          )}
        </div>
        <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
          <div className="text-xs text-[var(--muted)]">Check-out</div>
          <div className="font-medium">{formatDate(acc.check_out_date)}</div>
          {acc.check_out_time && (
            <div className="text-xs text-[var(--muted)]">
              bis {formatTime(acc.check_out_time)} Uhr
            </div>
          )}
        </div>
      </div>

      {(acc.cancellation_deadline || acc.cancellation_policy) && (
        <div className="mt-3 rounded-lg border border-dashed p-2 text-sm">
          <div className="text-xs font-semibold text-[var(--muted)]">
            Stornierung
          </div>
          {acc.cancellation_deadline && (
            <div>
              Kostenlos bis {formatDate(acc.cancellation_deadline)}
              {left !== null && left >= 0 && (
                <span
                  className={`ml-2 chip ${
                    left <= 3
                      ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  noch {left} {left === 1 ? "Tag" : "Tage"}
                </span>
              )}
              {left !== null && left < 0 && (
                <span className="ml-2 chip bg-black/5 text-[var(--muted)] dark:bg-white/10">
                  abgelaufen
                </span>
              )}
            </div>
          )}
          {acc.cancellation_policy && (
            <p className="mt-0.5 text-[var(--muted)]">{acc.cancellation_policy}</p>
          )}
        </div>
      )}

      {acc.notes && <p className="mt-2 text-sm text-[var(--muted)]">📝 {acc.notes}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3 text-xs">
        {acc.booking_reference && (
          <span className="text-[var(--muted)]">
            Buchung: {acc.booking_reference}
          </span>
        )}
        <a
          href={mapsDirectionsUrl(mapQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--primary)] hover:underline"
        >
          🗺️ Route ↗
        </a>
        {acc.booking_url && (
          <a
            href={acc.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] hover:underline"
          >
            Buchung öffnen ↗
          </a>
        )}
        {canEdit && (
          <div className="ml-auto flex items-center gap-3">
            <AccommodationFormButton
              tripId={tripId}
              areas={areas}
              accommodation={acc}
              label="Bearbeiten"
              className="text-xs text-[var(--primary)] hover:underline"
            />
            <DeleteButton
              action={deleteAccommodation}
              id={acc.id}
              tripId={tripId}
              confirmText={`„${acc.name}" löschen?`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccommodationsSection({
  trip,
  areas,
  accommodations,
  canEdit,
}: WorkspaceData) {
  const byArea = (areaId: string | null) =>
    accommodations.filter((a) => a.area_id === areaId);
  const orphans = byArea(null);

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <AreaFormButton tripId={trip.id} label="+ Gegend" className="btn-ghost" />
          <AccommodationFormButton
            tripId={trip.id}
            areas={areas}
            label="+ Unterkunft"
            className="btn-primary"
          />
        </div>
      )}

      {areas.length === 0 && accommodations.length === 0 && (
        <div className="card px-6 py-12 text-center text-sm text-[var(--muted)]">
          🏨 Noch keine Unterkünfte. Lege zuerst eine Gegend an oder füge direkt
          eine Unterkunft hinzu.
        </div>
      )}

      {areas.map((area) => {
        const accs = byArea(area.id);
        const areaTotal = accs.reduce((s, a) => s + (a.cost ?? 0), 0);
        const areaMapUrl = placeMapUrl({
          latitude: area.latitude,
          longitude: area.longitude,
          query: [area.name, area.region].filter(Boolean).join(", "),
        });
        return (
          <div key={area.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-black/[0.02] px-4 py-3 dark:bg-white/[0.02]">
              <div>
                <h3 className="font-semibold">
                  🗺️ {area.name}
                  {area.region && (
                    <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                      {area.region}
                    </span>
                  )}
                  {areaMapUrl && (
                    <a
                      href={areaMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs font-normal text-[var(--primary)] hover:underline"
                    >
                      Karte ↗
                    </a>
                  )}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {accs.length} {accs.length === 1 ? "Unterkunft" : "Unterkünfte"}
                  {(area.arrival_date || area.departure_date) && (
                    <>
                      {" · "}
                      {formatDate(area.arrival_date)} – {formatDate(area.departure_date)}
                    </>
                  )}
                  {" · "}
                  {formatCurrency(areaTotal)}
                </p>
                {area.description && (
                  <p className="mt-1 text-xs text-[var(--muted)]">{area.description}</p>
                )}
              </div>
              {canEdit && (
                <div className="flex items-center gap-3 text-xs">
                  <AccommodationFormButton
                    tripId={trip.id}
                    areas={areas}
                    defaultAreaId={area.id}
                    label="+ Unterkunft"
                    className="text-[var(--primary)] hover:underline"
                  />
                  <AreaFormButton
                    tripId={trip.id}
                    area={area}
                    label="Bearbeiten"
                    className="text-[var(--primary)] hover:underline"
                  />
                  <DeleteButton
                    action={deleteArea}
                    id={area.id}
                    tripId={trip.id}
                    confirmText={`Gegend „${area.name}" löschen? Unterkünfte bleiben erhalten (ohne Gegend).`}
                  />
                </div>
              )}
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-2">
              {accs.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  Noch keine Unterkunft in dieser Gegend.
                </p>
              ) : (
                accs.map((acc) => (
                  <AccommodationCard
                    key={acc.id}
                    acc={acc}
                    areas={areas}
                    tripId={trip.id}
                    canEdit={canEdit}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}

      {orphans.length > 0 && (
        <div className="card overflow-hidden">
          <div className="border-b bg-black/[0.02] px-4 py-3 dark:bg-white/[0.02]">
            <h3 className="font-semibold text-[var(--muted)]">Ohne Gegend</h3>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {orphans.map((acc) => (
              <AccommodationCard
                key={acc.id}
                acc={acc}
                areas={areas}
                tripId={trip.id}
                canEdit={canEdit}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
