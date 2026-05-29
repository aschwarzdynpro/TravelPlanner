"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, Check } from "@/components/icons";
import Popover from "./Popover";

export type SelectOption = {
  value: string;
  label: string;
  leading?: ReactNode;
};

// Themed select to replace the native <select>. The dropdown is rendered in a
// portal (via Popover) so it never gets clipped by a scrolling modal. Writes
// the chosen value into a hidden input so it posts with a normal form.
export default function SelectMenu({
  name,
  options,
  defaultValue = "",
  placeholder = "Auswählen",
  onChange,
  className = "",
}: {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-colors hover:border-[var(--ring)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/30"
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selected?.leading}
          <span className={selected ? "" : "text-[var(--muted)]"}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      <Popover anchorRef={anchorRef} open={open} onClose={() => setOpen(false)}>
        <div
          role="listbox"
          className="max-h-60 overflow-auto rounded-lg border bg-[var(--surface)] p-1 shadow-lg"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setValue(o.value);
                  setOpen(false);
                  onChange?.(o.value);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                  active
                    ? "bg-[var(--primary)]/10 text-[var(--foreground)]"
                    : "hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                }`}
              >
                {o.leading}
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {active && <Check className="h-4 w-4 shrink-0" strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      </Popover>
    </div>
  );
}
