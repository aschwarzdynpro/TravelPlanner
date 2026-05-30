"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search, X } from "@/components/icons";
import Popover from "./Popover";
import { countryOptions, countryName } from "@/lib/countries";

// Searchable country picker. Posts the ISO alpha-2 code via a hidden input so
// it works inside the plain server-action forms. `value`/`onChange` make it
// controllable (used to auto-fill the country from a geocoding result).
export default function CountrySelect({
  name,
  value,
  defaultValue = "",
  onChange,
  placeholder = "Land wählen",
}: {
  name: string;
  // Controlled value (ISO code). If omitted, the component manages its own.
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  placeholder?: string;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const code = value ?? internal;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLButtonElement>(null);

  const options = useMemo(() => countryOptions("de"), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.name.toLowerCase().includes(q) || o.code.toLowerCase() === q,
    );
  }, [options, query]);

  function choose(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={code} />
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-colors hover:border-[var(--ring)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/30"
      >
        <span className={`truncate ${code ? "" : "text-[var(--muted)]"}`}>
          {code ? countryName(code, "de") : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {code && (
            <X
              className="h-3.5 w-3.5 text-[var(--muted)] hover:text-[var(--foreground)]"
              strokeWidth={2}
              onClick={(e) => {
                e.stopPropagation();
                choose("");
              }}
            />
          )}
          <ChevronDown
            className={`h-4 w-4 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </span>
      </button>

      <Popover anchorRef={anchorRef} open={open} onClose={() => setOpen(false)}>
        <div className="w-full rounded-lg border bg-[var(--surface)] shadow-lg">
          <div className="flex items-center gap-2 border-b px-2.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-[var(--muted)]" strokeWidth={2} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Land suchen…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div role="listbox" className="max-h-56 overflow-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-2.5 py-2 text-sm text-[var(--muted)]">
                Kein Treffer.
              </p>
            ) : (
              filtered.map((o) => {
                const active = o.code === code;
                return (
                  <button
                    key={o.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(o.code)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                      active
                        ? "bg-[var(--primary)]/10 text-[var(--foreground)]"
                        : "hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{o.name}</span>
                    <span className="shrink-0 text-xs text-[var(--muted)]">
                      {o.code}
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0" strokeWidth={2} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </Popover>
    </div>
  );
}
