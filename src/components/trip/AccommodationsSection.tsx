"use client";

import type { WorkspaceData, Accommodation, Traveler } from "./types";
import { BOARD_LEVELS } from "@/lib/constants";
import {
  formatCurrency,
  formatDate,
  formatTime,
  daysUntil,
  nightsBetween,
  ageOn,
} from "@/lib/format";
import { countryName } from "@/lib/countries";
import { featureMeta } from "@/lib/entitlements";
import AreaFormButton from "./AreaFormButton";
import AccommodationFormButton from "./AccommodationFormButton";
import DeleteButton from "@/components/DeleteButton";
import ProBadge from "@/components/billing/ProBadge";
import UpgradeNotice from "@/components/billing/UpgradeNotice";
import { deleteArea, deleteAccommodation } from "@/app/(app)/trips/[id]/actions";
import {
  mapsSearchUrl,
  mapsDirectionsUrl,
  placeMapUrl,
  mapEmbedUrl,
  bookingSearchUrl,
} from "@/lib/links";
import {
  MapPin,
  RouteIcon,
  ExternalLink,
  ArrowUpRight,
  Hotel,
  StickyNote,
  Plus,
  Pencil,
  Trash2,
  Star,
  Sparkles,
} from "@/components/icons";

function AccommodationCard({
  acc,
  areas,
  travelers,
  tripId,
  canEdit,
  isPro,
}: {
  acc: Accommodation;
  areas: WorkspaceData["areas"];
  travelers: Traveler[];
  tripId: string;
  canEdit: boolean;
  isPro: boolean;
}) {
  const left = daysUntil(acc.cancellation_deadline);
  const mapQuery = acc.address || acc.name;
  const nights = nightsBetween(acc.check_in_date, acc.check_out_date);

  // Split travelers into adults/children by their age at check-in, so the
  // Booking search can prefill child ages (which affect pricing). Travelers
  // without a birth date count as adults.
  const childAges = travelers
    .map((t) => ageOn(t.birth_date, acc.check_in_date))
    .filter((a): a is number => a != null && a < 18);
  const adults = Math.max(1, travelers.length - childAges.length);
  const bookingUrl = bookingSearchUrl({
    query: acc.address || acc.name,
    checkIn: acc.check_in_date,
    checkOut: acc.check_out_date,
    adults,
    childAges,
  });
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
              className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              {acc.address}
            </a>
          )}
        </div>
        <div className="text-right">
          <div className="font-semibold">
            {formatCurrency(acc.cost, acc.currency)}
          </div>
          {acc.price_per_night != null && (
            <div className="text-xs text-[var(--muted)]">
              {formatCurrency(acc.price_per_night, acc.currency)}/Nacht
              {nights ? ` · ${nights} ${nights === 1 ? "Nacht" : "Nächte"}` : ""}
            </div>
          )}
          <span className="chip bg-black/5 text-[var(--muted)] dark:bg-white/10">
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

      {acc.notes && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-[var(--muted)]">
          <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{acc.notes}</span>
        </p>
      )}

      <HotelRating isPro={isPro} />

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
          className="inline-flex items-center gap-1 font-medium hover:underline"
        >
          <RouteIcon className="h-3.5 w-3.5" strokeWidth={2} />
          Route
        </a>
        {bookingUrl && (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium hover:underline"
            title="Auf Booking.com suchen (Datum & Gäste vorausgefüllt)"
          >
            <Hotel className="h-3.5 w-3.5" strokeWidth={2} />
            Auf Booking suchen
          </a>
        )}
        {acc.booking_url && (
          <a
            href={acc.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
            Buchung öffnen
          </a>
        )}
        {canEdit && (
          <div className="ml-auto flex items-center gap-1.5">
            <AccommodationFormButton
              tripId={tripId}
              areas={areas}
              accommodation={acc}
              label={<Pencil className="h-4 w-4" strokeWidth={2} />}
              title="Unterkunft bearbeiten"
              className="icon-btn"
            />
            <DeleteButton
              action={deleteAccommodation}
              id={acc.id}
              tripId={tripId}
              label={<Trash2 className="h-4 w-4" strokeWidth={2} />}
              title="Unterkunft löschen"
              className="icon-btn icon-btn-danger"
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
  travelers,
  canEdit,
  isPro,
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
        <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-[var(--muted)]">
          <Hotel className="h-8 w-8" strokeWidth={1.5} />
          Noch keine Unterkünfte. Lege zuerst eine Gegend an oder füge direkt
          eine Unterkunft hinzu.
        </div>
      )}

      {areas.map((area) => {
        const accs = byArea(area.id);
        const areaTotal = accs.reduce((s, a) => s + (a.cost ?? 0), 0);
        const areaQuery = [area.name, area.region].filter(Boolean).join(", ");
        const areaMapUrl = placeMapUrl({
          latitude: area.latitude,
          longitude: area.longitude,
          query: areaQuery,
        });
        const areaEmbedUrl = mapEmbedUrl({
          latitude: area.latitude,
          longitude: area.longitude,
          query: areaQuery,
        });
        return (
          <div key={area.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-black/[0.02] px-4 py-3 dark:bg-white/[0.02]">
              <div>
                <h3 className="flex flex-wrap items-center gap-2 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
                    {area.name}
                  </span>
                  {(area.region || area.country_code) && (
                    <span className="text-sm font-normal text-[var(--muted)]">
                      {[area.region, area.country_code && countryName(area.country_code)]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}
                  {areaMapUrl && (
                    <a
                      href={areaMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-normal hover:underline"
                    >
                      Karte
                      <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
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
                <div className="flex items-center gap-1.5">
                  <AccommodationFormButton
                    tripId={trip.id}
                    areas={areas}
                    defaultAreaId={area.id}
                    label={<Plus className="h-4 w-4" strokeWidth={2} />}
                    title="Unterkunft in dieser Gegend hinzufügen"
                    className="icon-btn"
                  />
                  <AreaFormButton
                    tripId={trip.id}
                    area={area}
                    label={<Pencil className="h-4 w-4" strokeWidth={2} />}
                    title="Gegend bearbeiten"
                    className="icon-btn"
                  />
                  <DeleteButton
                    action={deleteArea}
                    id={area.id}
                    tripId={trip.id}
                    label={<Trash2 className="h-4 w-4" strokeWidth={2} />}
                    title="Gegend löschen"
                    className="icon-btn icon-btn-danger"
                    confirmText={`Gegend „${area.name}" löschen? Unterkünfte bleiben erhalten (ohne Gegend).`}
                  />
                </div>
              )}
            </div>
            {areaEmbedUrl && (
              <iframe
                src={areaEmbedUrl}
                title={`Karte: ${area.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-48 w-full border-0 border-b"
              />
            )}
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
                    travelers={travelers}
                    tripId={trip.id}
                    canEdit={canEdit}
                    isPro={isPro}
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
                travelers={travelers}
                tripId={trip.id}
                canEdit={canEdit}
                isPro={isPro}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Pro feature: hotel category & rating. The live data source (Google Places)
// isn't wired yet, so this only gates + previews. Free users get an upgrade
// hint; Pro users see a "coming soon" placeholder. Enforcement that actually
// matters will live server-side once a data source is added.
function HotelRating({ isPro }: { isPro: boolean }) {
  const meta = featureMeta("hotel.ratings");

  if (!isPro) {
    return (
      <div className="mt-3">
        <UpgradeNotice title={meta.title} description={meta.description} />
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-dashed p-3">
      <span className="flex items-center gap-2 text-sm">
        <Star className="h-4 w-4 text-[var(--muted)]" strokeWidth={2} />
        <span className="font-medium">{meta.title}</span>
        <ProBadge />
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        kommt bald
      </span>
    </div>
  );
}
