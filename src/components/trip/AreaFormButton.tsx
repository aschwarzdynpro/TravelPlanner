"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal";
import type { Area } from "./types";
import { saveArea } from "@/app/(app)/trips/[id]/actions";
import CoordinateFields from "@/components/map/CoordinateFields";
import DatePicker from "@/components/ui/DatePicker";

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
  const nameRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLInputElement>(null);

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
              ref={nameRef}
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
              ref={regionRef}
              name="region"
              className="input"
              defaultValue={area?.region ?? ""}
              placeholder="Toskana, Italien"
            />
          </div>

          <CoordinateFields
            defaultLatitude={area?.latitude}
            defaultLongitude={area?.longitude}
            getQuery={() =>
              [nameRef.current?.value, regionRef.current?.value]
                .filter(Boolean)
                .join(", ")
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Ankunft</label>
              <DatePicker
                name="arrival_date"
                defaultValue={area?.arrival_date ?? ""}
              />
            </div>
            <div>
              <label className="label">Abreise</label>
              <DatePicker
                name="departure_date"
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
