"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/format";
import { CalendarDays, ChevronRight, X } from "@/components/icons";

// Themed date picker replacing the native <input type="date"> (which renders
// OS-styled with a locale-fixed mm/dd/yyyy format). Stores an ISO date
// (YYYY-MM-DD) in a hidden input so it posts via FormData like before.

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function toISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function DatePicker({
  name,
  defaultValue = "",
  placeholder = "Datum wählen",
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue); // ISO string or ""
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  // Month currently shown in the calendar.
  const [view, setView] = useState(() => {
    const base = defaultValue ? new Date(defaultValue) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const ref = useRef<HTMLDivElement>(null);

  // Open upward when there isn't enough room below the trigger (the modal
  // scroll container would otherwise clip the calendar).
  function toggle() {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 360);
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Build the day grid for the viewed month (Monday-first, 6 weeks).
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7; // Mon=0 … Sun=6
  const start = new Date(year, month, 1 - offset);
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const todayISO = toISO(new Date());

  return (
    <div className="relative" ref={ref}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-2 rounded-lg border bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-colors hover:border-[var(--ring)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/30"
      >
        <span className={value ? "" : "text-[var(--muted)]"}>
          {value ? formatDate(value) : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {value && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Datum löschen"
              onClick={(e) => {
                e.stopPropagation();
                setValue("");
              }}
              className="rounded p-0.5 text-[var(--muted)] hover:bg-black/[0.06] hover:text-[var(--foreground)] dark:hover:bg-white/[0.08]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          )}
          <CalendarDays className="h-4 w-4 text-[var(--muted)]" strokeWidth={2} />
        </span>
      </button>

      {open && (
        <div
          className={`absolute z-30 w-72 rounded-xl border bg-[var(--surface)] p-3 shadow-lg ${
            dropUp ? "bottom-full mb-1" : "mt-1"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Voriger Monat"
              onClick={() => setView(new Date(year, month - 1, 1))}
              className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] transition-colors hover:bg-black/[0.06] hover:text-[var(--foreground)] dark:hover:bg-white/[0.08]"
            >
              <ChevronRight className="h-4 w-4 rotate-180" strokeWidth={2} />
            </button>
            <div className="text-sm font-medium">
              {MONTHS[month]} {year}
            </div>
            <button
              type="button"
              aria-label="Nächster Monat"
              onClick={() => setView(new Date(year, month + 1, 1))}
              className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] transition-colors hover:bg-black/[0.06] hover:text-[var(--foreground)] dark:hover:bg-white/[0.08]"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-[var(--muted)]">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d) => {
              const iso = toISO(d);
              const inMonth = d.getMonth() === month;
              const selected = iso === value;
              const isToday = iso === todayISO;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setValue(iso);
                    setOpen(false);
                  }}
                  className={`grid h-8 place-items-center rounded-md text-sm transition-colors ${
                    selected
                      ? "bg-[var(--primary)] font-medium text-[var(--primary-foreground)]"
                      : inMonth
                        ? "hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                        : "text-[var(--muted)]/50 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                  } ${isToday && !selected ? "ring-1 ring-inset ring-[var(--ring)]" : ""}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t pt-2">
            <button
              type="button"
              onClick={() => {
                setValue(todayISO);
                setOpen(false);
              }}
              className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
            >
              Heute
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  setOpen(false);
                }}
                className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
              >
                Löschen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
