"use client";

import { useState } from "react";
import { Monitor, Sun, Moon, type LucideIcon } from "@/components/icons";
import { updateTheme } from "@/app/(app)/account/actions";

type Theme = "system" | "light" | "dark";

const OPTIONS: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Hell", icon: Sun },
  { value: "dark", label: "Dunkel", icon: Moon },
];

// Apply the theme to <html>: explicit choices set data-theme, "system" removes
// it so the prefers-color-scheme media query takes over again.
function applyTheme(theme: Theme) {
  const el = document.documentElement;
  if (theme === "light" || theme === "dark") {
    el.dataset.theme = theme;
  } else {
    delete el.dataset.theme;
  }
}

export default function ThemeToggle({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {
      // ignore storage failures (e.g. private mode)
    }
    // Persist to the profile (no-op when signed out).
    void updateTheme(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Erscheinungsbild"
      className="inline-grid grid-cols-3 gap-1 rounded-lg border bg-[var(--surface)] p-1"
    >
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(o.value)}
            className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
