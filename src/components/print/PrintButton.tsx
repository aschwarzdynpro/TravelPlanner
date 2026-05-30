"use client";

import { Printer } from "@/components/icons";

// Triggers the browser print dialog (where "Save as PDF" lives). Hidden from
// the printout itself via the .no-print utility.
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
    >
      <Printer className="h-4 w-4" strokeWidth={2} />
      Drucken / Als PDF speichern
    </button>
  );
}
