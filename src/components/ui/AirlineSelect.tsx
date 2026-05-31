"use client";

import { useMemo, useRef, useState } from "react";
import { Plane, Check } from "@/components/icons";
import Popover from "./Popover";
import { AIRLINES, airlineByName } from "@/lib/airlines";

// Airline combobox: a free-text input (posts under `name`) with a searchable
// suggestion list of curated airlines. Picking a suggestion fills the field and
// reports its IATA code via onPickCode (used to prefill the flight-number).
export default function AirlineSelect({
  name,
  value: controlled,
  defaultValue = "",
  onChange,
  onPickCode,
  placeholder = "Fluggesellschaft",
}: {
  name: string;
  // Controlled value. If omitted, the component manages its own.
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onPickCode?: (iata: string) => void;
  placeholder?: string;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;
  const setValue = (v: string) => {
    if (controlled === undefined) setInternal(v);
    onChange?.(v);
  };
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return AIRLINES;
    return AIRLINES.filter(
      (a) => a.name.toLowerCase().includes(q) || a.iata.toLowerCase() === q,
    );
  }, [value]);

  const currentCode = airlineByName(value)?.iata ?? null;

  return (
    <div className="relative min-w-0">
      <input
        ref={anchorRef}
        name={name}
        value={value}
        autoComplete="off"
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="input"
      />
      <Popover anchorRef={anchorRef} open={open && filtered.length > 0} onClose={() => setOpen(false)}>
        <div role="listbox" className="max-h-56 overflow-auto rounded-lg border bg-[var(--surface)] p-1 shadow-lg">
          {filtered.map((a) => {
            const active = a.iata === currentCode;
            return (
              <button
                key={a.iata}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setValue(a.name);
                  onPickCode?.(a.iata);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                  active
                    ? "bg-[var(--primary)]/10 text-[var(--foreground)]"
                    : "hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                }`}
              >
                <Plane className="h-4 w-4 shrink-0 text-[var(--muted)]" strokeWidth={2} />
                <span className="min-w-0 flex-1 truncate">{a.name}</span>
                <span className="shrink-0 text-xs text-[var(--muted)]">{a.iata}</span>
                {active && <Check className="h-4 w-4 shrink-0" strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      </Popover>
    </div>
  );
}
