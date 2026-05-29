"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import type { Trip } from "./types";
import { COVER_COLORS, TRIP_KINDS, CURRENCIES } from "@/lib/constants";
import { updateTrip } from "@/app/(app)/trips/[id]/actions";
import { deleteTrip } from "@/app/(app)/trips/actions";

export default function EditTripButton({ trip }: { trip: Trip }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(trip.cover_color ?? "#2563eb");

  return (
    <>
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        ✎ Bearbeiten
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Reise bearbeiten">
        <form action={updateTrip} className="space-y-4">
          <input type="hidden" name="id" value={trip.id} />
          <input type="hidden" name="cover_color" value={color} />

          <div>
            <label className="label">Name *</label>
            <input name="name" className="input" required defaultValue={trip.name} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Typ</label>
              <select name="kind" className="select" defaultValue={trip.kind}>
                {Object.entries(TRIP_KINDS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ziel / Ort</label>
              <input
                name="destination"
                className="input"
                defaultValue={trip.destination ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Von</label>
              <input
                name="start_date"
                type="date"
                className="input"
                defaultValue={trip.start_date ?? ""}
              />
            </div>
            <div>
              <label className="label">Bis</label>
              <input
                name="end_date"
                type="date"
                className="input"
                defaultValue={trip.end_date ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">Budget</label>
              <input
                name="budget"
                type="number"
                step="0.01"
                min="0"
                className="input"
                defaultValue={trip.budget ?? ""}
                placeholder="z. B. 2000"
              />
            </div>
            <div>
              <label className="label">Währung</label>
              <select
                name="budget_currency"
                className="select"
                defaultValue={trip.budget_currency ?? "EUR"}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Beschreibung</label>
            <textarea
              name="description"
              className="textarea"
              rows={2}
              defaultValue={trip.description ?? ""}
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

          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <button
              type="submit"
              formAction={deleteTrip}
              className="btn-danger"
              onClick={(e) => {
                if (!confirm("Diese Reise wirklich endgültig löschen?"))
                  e.preventDefault();
              }}
            >
              Löschen
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
