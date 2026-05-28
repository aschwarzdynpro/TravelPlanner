"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { createTrip } from "@/app/(app)/trips/actions";
import { COVER_COLORS, TRIP_KINDS } from "@/lib/constants";

export default function NewTripButton() {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(COVER_COLORS[0]);

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + Neue Reise / Event
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Neue Reise oder Event">
        <form action={createTrip} className="space-y-4">
          <input type="hidden" name="cover_color" value={color} />

          <div>
            <label className="label">Name *</label>
            <input
              name="name"
              className="input"
              required
              placeholder="z. B. Sommerurlaub Toskana"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Typ</label>
              <select name="kind" className="select" defaultValue="trip">
                {Object.entries(TRIP_KINDS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ziel / Ort</label>
              <input name="destination" className="input" placeholder="Italien" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Von</label>
              <input name="start_date" type="date" className="input" />
            </div>
            <div>
              <label className="label">Bis</label>
              <input name="end_date" type="date" className="input" />
            </div>
          </div>

          <div>
            <label className="label">Beschreibung</label>
            <textarea
              name="description"
              className="textarea"
              rows={2}
              placeholder="Worum geht es?"
            />
          </div>

          <div>
            <label className="label">Farbe</label>
            <div className="flex flex-wrap gap-2">
              {COVER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    color === c ? "border-[var(--foreground)] scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Farbe ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </button>
            <button type="submit" className="btn-primary">
              Erstellen
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
