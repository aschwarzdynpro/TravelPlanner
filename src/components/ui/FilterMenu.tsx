"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type FilterOption = {
  value: string;
  label: string;
  leading?: ReactNode;
};

// A compact, modern dropdown filter rendered as a pill trigger + popover panel.
// Replaces native <select> for a nicer look with leading visuals (color dots,
// avatars) and a clear active state.
export default function FilterMenu({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  allLabel: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  const selected = options.find((o) => o.value === value);
  const active = Boolean(value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
          active
            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
            : "border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {active && selected?.leading}
        <span className="max-w-[12rem] truncate">
          {active ? selected?.label ?? label : label}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-64 overflow-auto rounded-xl border bg-[var(--surface)] p-1 shadow-lg"
        >
          <OptionRow
            label={allLabel}
            selected={!value}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          />
          {options.length > 0 && <div className="my-1 h-px bg-[var(--border)]" />}
          {options.map((o) => (
            <OptionRow
              key={o.value}
              label={o.label}
              leading={o.leading}
              selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OptionRow({
  label,
  leading,
  selected,
  onClick,
}: {
  label: string;
  leading?: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
        selected
          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
          : "hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      {leading}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {selected && (
        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4l2.8 2.79 6.8-6.79a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
