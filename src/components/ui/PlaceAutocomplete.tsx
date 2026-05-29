"use client";

import { useEffect, useRef, useState } from "react";
import type { GeocodeResult } from "@/app/api/geocode/route";
import { Search, Loader2, MapPin } from "@/components/icons";
import Popover from "./Popover";

// Debounced place search (hotels, addresses, POIs) over the geocode proxy.
// On pick it calls onSelect with name/address/coordinates so a form can
// autofill several fields at once. Standalone — it owns its own input.
export default function PlaceAutocomplete({
  defaultValue = "",
  placeholder = "Hotel oder Ort suchen …",
  onSelect,
}: {
  defaultValue?: string;
  placeholder?: string;
  onSelect: (r: GeocodeResult) => void;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const anchorRef = useRef<HTMLInputElement>(null);

  // Debounced search whenever the typed query changes. All state updates happen
  // inside async callbacks (timer / fetch), never synchronously in the effect.
  useEffect(() => {
    const q = query.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (q.length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(res.ok ? (data.results ?? []) : []);
        setOpen(true);
      } catch {
        // aborted or failed — ignore
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
          strokeWidth={2}
        />
        <input
          ref={anchorRef}
          className="input pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--muted)]"
            strokeWidth={2}
          />
        )}
      </div>

      <Popover anchorRef={anchorRef} open={open && results.length > 0} onClose={() => setOpen(false)}>
        <ul className="max-h-72 overflow-auto rounded-lg border bg-[var(--surface)] p-1 shadow-lg">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r);
                  setQuery(r.name);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted)]" strokeWidth={2} />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="block truncate text-xs text-[var(--muted)]">
                    {r.label}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  );
}
