"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import type { Traveler } from "./types";
import { saveTraveler } from "@/app/(app)/trips/[id]/actions";

export default function TravelerFormButton({
  tripId,
  traveler,
  label,
  className = "btn-primary",
}: {
  tripId: string;
  traveler?: Traveler;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = traveler;

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t ? "Mitreisende:n bearbeiten" : "Mitreisende:n hinzufügen"}
      >
        <form action={saveTraveler} className="space-y-4">
          <input type="hidden" name="trip_id" value={tripId} />
          {t && <input type="hidden" name="id" value={t.id} />}

          <div>
            <label className="label">Name *</label>
            <input
              name="name"
              className="input"
              required
              autoFocus
              defaultValue={t?.name ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">E-Mail</label>
              <input
                name="email"
                type="email"
                className="input"
                defaultValue={t?.email ?? ""}
              />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input
                name="phone"
                className="input"
                defaultValue={t?.phone ?? ""}
              />
            </div>
          </div>
          <div>
            <label className="label">Notizen</label>
            <textarea
              name="notes"
              className="textarea"
              rows={2}
              defaultValue={t?.notes ?? ""}
              placeholder="z. B. Allergien, Sitzplatzwunsch, Zimmeraufteilung"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </button>
            <button type="submit" className="btn-primary">
              Speichern
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
