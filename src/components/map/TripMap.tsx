"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "./LeafletMap";

export type { MapMarker } from "./LeafletMap";

// Leaflet touches `window` on import, so load it client-only.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-black/[0.03] text-sm text-[var(--muted)] dark:bg-white/5">
      Karte wird geladen…
    </div>
  ),
});

export default function TripMap({
  markers,
  className = "h-[420px] w-full overflow-hidden rounded-xl border",
  emptyHint,
}: {
  markers: MapMarker[];
  className?: string;
  emptyHint?: string;
}) {
  if (markers.length === 0) {
    return (
      <div
        className={`grid place-items-center bg-black/[0.03] text-center text-sm text-[var(--muted)] dark:bg-white/5 ${className}`}
      >
        <div className="max-w-xs px-6">
          🗺️{" "}
          {emptyHint ??
            "Noch keine Koordinaten hinterlegt. Hinterlege bei einer Gegend oder Unterkunft Koordinaten, damit sie hier erscheint."}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <LeafletMap markers={markers} />
    </div>
  );
}
