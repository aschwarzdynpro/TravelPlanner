"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { createTrip } from "@/app/(app)/trips/actions";
import { COVER_COLORS, TRIP_KINDS, CURRENCIES } from "@/lib/constants";
import SelectMenu from "@/components/ui/SelectMenu";
import DatePicker from "@/components/ui/DatePicker";

const KIND_OPTIONS = Object.entries(TRIP_KINDS).map(([value, label]) => ({
  value,
  label,
}));
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));

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
              <SelectMenu name="kind" defaultValue="trip" options={KIND_OPTIONS} />
            </div>
            <div>
              <label className="label">Ziel / Ort</label>
              <input name="destination" className="input" placeholder="Italien" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Von</label>
              <DatePicker name="start_date" />
            </div>
            <div>
              <label className="label">Bis</label>
              <DatePicker name="end_date" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">Budget (optional)</label>
              <input
                name="budget"
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="z. B. 2000"
              />
            </div>
            <div>
              <label className="label">Währung</label>
              <SelectMenu
                name="budget_currency"
                defaultValue="EUR"
                options={CURRENCY_OPTIONS}
              />
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
