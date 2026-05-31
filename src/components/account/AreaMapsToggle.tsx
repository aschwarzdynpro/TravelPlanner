"use client";

import { useState, useTransition } from "react";
import { setShowAreaMaps } from "@/app/(app)/account/actions";

// Persisted on/off switch for embedded area-map previews on the trip workspace.
export default function AreaMapsToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(() => setShowAreaMaps(next));
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Kartenvorschauen bei Gegenden anzeigen"
      disabled={pending}
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition disabled:opacity-60 ${
        on ? "bg-[var(--primary)]" : "bg-black/20 dark:bg-white/20"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}
