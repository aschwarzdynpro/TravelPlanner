"use client";

import { useEffect, useRef, useState } from "react";
import type { GeocodeResult } from "@/app/api/geocode/route";
import { Search } from "@/components/icons";

// Latitude/longitude inputs with a "find coordinates" helper that queries the
// Nominatim proxy. Used inside the area & accommodation server-action forms;
// the values post as plain form fields (name=latitude / name=longitude).
export default function CoordinateFields({
  defaultLatitude,
  defaultLongitude,
  // Free-text the geocoder should search when the button is clicked, derived
  // from sibling fields (e.g. address or name). Provided via a getter so it
  // reads the latest input values at click time.
  getQuery,
  // Notified with the full geocoding result when a place is picked, so callers
  // can auto-fill related fields (e.g. country).
  onResult,
}: {
  defaultLatitude?: number | null;
  defaultLongitude?: number | null;
  getQuery: () => string;
  onResult?: (r: GeocodeResult) => void;
}) {
  const [lat, setLat] = useState(defaultLatitude?.toString() ?? "");
  const [lng, setLng] = useState(defaultLongitude?.toString() ?? "");
  const [results, setResults] = useState<GeocodeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Close the suggestions dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setResults(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function search() {
    const q = getQuery().trim();
    setError(null);
    if (!q) {
      setError("Bitte zuerst Name oder Adresse eingeben.");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Fehler");
      const found: GeocodeResult[] = data.results ?? [];
      if (found.length === 0) {
        setError("Keine Treffer gefunden.");
      } else if (found.length === 1) {
        pick(found[0]);
      } else {
        setResults(found);
      }
    } catch {
      setError("Geocoding fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  function pick(r: GeocodeResult) {
    setLat(r.latitude.toFixed(6));
    setLng(r.longitude.toFixed(6));
    setResults(null);
    setError(null);
    onResult?.(r);
  }

  function clear() {
    setLat("");
    setLng("");
    setResults(null);
    setError(null);
  }

  return (
    <div className="rounded-lg border border-dashed p-3" ref={boxRef}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--muted)]">
          Koordinaten (für die Karte)
        </span>
        <div className="flex items-center gap-2">
          {(lat || lng) && (
            <button
              type="button"
              onClick={clear}
              className="text-xs text-[var(--muted)] hover:underline"
            >
              Leeren
            </button>
          )}
          <button
            type="button"
            onClick={search}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-medium hover:underline disabled:opacity-50"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={2} />
            {loading ? "Suche…" : "Koordinaten suchen"}
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Breitengrad</label>
            <input
              name="latitude"
              type="number"
              step="any"
              className="input"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="z. B. 42.6507"
            />
          </div>
          <div>
            <label className="label">Längengrad</label>
            <input
              name="longitude"
              type="number"
              step="any"
              className="input"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="z. B. 18.0944"
            />
          </div>
        </div>

        {results && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border bg-[var(--surface)] shadow-lg">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
