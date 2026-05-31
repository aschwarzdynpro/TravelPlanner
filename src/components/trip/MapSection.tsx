"use client";

import type { WorkspaceData } from "./types";
import TripMap, { type MapMarker } from "@/components/map/TripMap";
import { formatCurrency, formatDate } from "@/lib/format";

export default function MapSection({ areas, accommodations }: WorkspaceData) {
  const markers: MapMarker[] = [];

  for (const area of areas) {
    if (area.latitude != null && area.longitude != null) {
      markers.push({
        id: `area-${area.id}`,
        latitude: area.latitude,
        longitude: area.longitude,
        title: area.name,
        subtitle: area.region ?? undefined,
        kind: "area",
      });
    }
  }

  // Number hotel pins in itinerary order (accommodations are sorted by
  // check-in date upstream), so the map reads 1 → 2 → 3 along the trip.
  let hotelNo = 0;
  for (const acc of accommodations) {
    if (acc.latitude != null && acc.longitude != null) {
      hotelNo++;
      // Compact "price · check-in–check-out" line for the popup.
      const price =
        acc.cost != null ? formatCurrency(acc.cost, acc.currency) : null;
      const dates =
        acc.check_in_date || acc.check_out_date
          ? `${formatDate(acc.check_in_date)} – ${formatDate(acc.check_out_date)}`
          : null;
      const detail = [price, dates].filter(Boolean).join(" · ") || undefined;
      markers.push({
        id: `acc-${acc.id}`,
        latitude: acc.latitude,
        longitude: acc.longitude,
        title: `${hotelNo}. ${acc.name}`,
        subtitle: acc.address ?? undefined,
        kind: "hotel",
        index: hotelNo,
        detail,
      });
    }
  }

  const areaPins = markers.filter((m) => m.kind === "area").length;
  const hotelPins = markers.filter((m) => m.kind === "hotel").length;
  const withoutCoords =
    areas.filter((a) => a.latitude == null || a.longitude == null).length +
    accommodations.filter((a) => a.latitude == null || a.longitude == null)
      .length;

  return (
    <div className="space-y-3">
      <TripMap markers={markers} className="h-[460px] w-full overflow-hidden rounded-xl border" />

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
            {areaPins} {areaPins === 1 ? "Gegend" : "Gegenden"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e11d48]" />
            {hotelPins} {hotelPins === 1 ? "Unterkunft" : "Unterkünfte"}
          </span>
        </div>
        {withoutCoords > 0 && (
          <span>
            {withoutCoords} Eintrag/Einträge ohne Koordinaten. Hinterlege beim
            Bearbeiten Koordinaten („Koordinaten suchen“), damit sie erscheinen.
          </span>
        )}
      </div>
    </div>
  );
}
