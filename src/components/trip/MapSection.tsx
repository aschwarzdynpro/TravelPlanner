"use client";

import type { WorkspaceData } from "./types";
import TripMap, { type MapMarker } from "@/components/map/TripMap";

export default function MapSection({ areas, accommodations }: WorkspaceData) {
  const markers: MapMarker[] = [];

  for (const area of areas) {
    if (area.latitude != null && area.longitude != null) {
      markers.push({
        id: `area-${area.id}`,
        latitude: area.latitude,
        longitude: area.longitude,
        title: `🗺️ ${area.name}`,
        subtitle: area.region ?? undefined,
      });
    }
  }

  for (const acc of accommodations) {
    if (acc.latitude != null && acc.longitude != null) {
      markers.push({
        id: `acc-${acc.id}`,
        latitude: acc.latitude,
        longitude: acc.longitude,
        title: `🏨 ${acc.name}`,
        subtitle: acc.address ?? undefined,
      });
    }
  }

  const withoutCoords =
    areas.filter((a) => a.latitude == null || a.longitude == null).length +
    accommodations.filter((a) => a.latitude == null || a.longitude == null)
      .length;

  return (
    <div className="space-y-3">
      <TripMap markers={markers} className="h-[460px] w-full overflow-hidden rounded-xl border" />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <span>
          {markers.length}{" "}
          {markers.length === 1 ? "Ort auf der Karte" : "Orte auf der Karte"}
        </span>
        {withoutCoords > 0 && (
          <span>
            {withoutCoords} Eintrag/Einträge ohne Koordinaten. Hinterlege beim
            Bearbeiten Koordinaten („📍 Koordinaten suchen“), damit sie erscheinen.
          </span>
        )}
      </div>
    </div>
  );
}
