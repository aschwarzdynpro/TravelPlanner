"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import type { Trip } from "./types";
import { reTravel } from "@/app/(app)/trips/actions";

export default function ReTravelButton({
  trip,
  className = "btn-ghost",
}: {
  trip: Trip;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        🔁 Re-Travel
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Reise erneut planen">
        <form action={reTravel} className="space-y-4">
          <input type="hidden" name="source_id" value={trip.id} />
          <p className="text-sm text-[var(--muted)]">
            Erstellt eine neue Reise als Kopie von <strong>{trip.name}</strong> –
            inklusive Gegenden, Unterkünften, Flügen und Mitreisenden. Termine und
            Buchungsnummern werden zurückgesetzt, damit du frisch planen kannst.
          </p>
          <div>
            <label className="label">Name der neuen Reise</label>
            <input
              name="name"
              className="input"
              defaultValue={`${trip.name} (${new Date().getFullYear() + 1})`}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </button>
            <button type="submit" className="btn-primary">
              Kopie erstellen
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
