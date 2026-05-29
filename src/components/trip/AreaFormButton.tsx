"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import type { Area } from "./types";
import { saveArea } from "@/app/(app)/trips/[id]/actions";

export default function AreaFormButton({
  tripId,
  area,
  label,
  className = "btn-primary",
}: {
  tripId: string;
  area?: Area;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={area ? "Gegend bearbeiten" : "Gegend hinzufügen"}
      >
        <form action={saveArea} className="space-y-4">
          <input type="hidden" name="trip_id" value={tripId} />
          {area && <input type="hidden" name="id" value={area.id} />}

          <div>
            <label className="label">Name der Gegend *</label>
            <input
              name="name"
              className="input"
              required
              autoFocus
              defaultValue={area?.name ?? ""}
              placeholder="z. B. Chianti / Florenz"
            />
          </div>
          <div>
            <label className="label">Region / Land</label>
            <input
              name="region"
              className="input"
              defaultValue={area?.region ?? ""}
              placeholder="Toskana, Italien"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Ankunft</label>
              <input
                name="arrival_date"
                type="date"
                className="input"
                defaultValue={area?.arrival_date ?? ""}
              />
            </div>
            <div>
              <label className="label">Abreise</label>
              <input
                name="departure_date"
                type="date"
                className="input"
                defaultValue={area?.departure_date ?? ""}
              />
            </div>
          </div>
          <div>
            <label className="label">Notizen</label>
            <textarea
              name="description"
              className="textarea"
              rows={2}
              defaultValue={area?.description ?? ""}
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
