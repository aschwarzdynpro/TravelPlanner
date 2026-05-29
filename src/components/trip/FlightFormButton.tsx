"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import type { Flight } from "./types";
import { saveFlight } from "@/app/(app)/trips/[id]/actions";
import { CURRENCIES } from "@/lib/constants";

// Format a timestamptz value for a datetime-local input (local time, no seconds).
function toLocalInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function FlightFormButton({
  tripId,
  flight,
  label,
  className = "btn-primary",
}: {
  tripId: string;
  flight?: Flight;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const f = flight;

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={f ? "Flug bearbeiten" : "Flug hinzufügen"}
      >
        <form action={saveFlight} className="space-y-4">
          <input type="hidden" name="trip_id" value={tripId} />
          {f && <input type="hidden" name="id" value={f.id} />}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fluggesellschaft</label>
              <input
                name="airline"
                className="input"
                defaultValue={f?.airline ?? ""}
                placeholder="z. B. Lufthansa"
              />
            </div>
            <div>
              <label className="label">Flugnummer</label>
              <input
                name="flight_number"
                className="input"
                defaultValue={f?.flight_number ?? ""}
                placeholder="LH 1234"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Abflughafen</label>
              <input
                name="departure_airport"
                className="input"
                defaultValue={f?.departure_airport ?? ""}
                placeholder="FRA"
              />
            </div>
            <div>
              <label className="label">Zielflughafen</label>
              <input
                name="arrival_airport"
                className="input"
                defaultValue={f?.arrival_airport ?? ""}
                placeholder="FLR"
              />
            </div>
            <div>
              <label className="label">Abflug</label>
              <input
                name="departure_time"
                type="datetime-local"
                className="input"
                defaultValue={toLocalInput(f?.departure_time ?? null)}
              />
            </div>
            <div>
              <label className="label">Ankunft</label>
              <input
                name="arrival_time"
                type="datetime-local"
                className="input"
                defaultValue={toLocalInput(f?.arrival_time ?? null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">Kosten</label>
              <input
                name="cost"
                type="number"
                step="0.01"
                min="0"
                className="input"
                defaultValue={f?.cost ?? ""}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="label">Währung</label>
              <select
                name="currency"
                className="select"
                defaultValue={f?.currency ?? "EUR"}
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
            <label className="label">Stornierungsbedingungen</label>
            <textarea
              name="cancellation_policy"
              className="textarea"
              rows={2}
              defaultValue={f?.cancellation_policy ?? ""}
              placeholder="z. B. nicht erstattbar / umbuchbar gegen Gebühr"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Buchungsnummer</label>
              <input
                name="booking_reference"
                className="input"
                defaultValue={f?.booking_reference ?? ""}
              />
            </div>
            <div>
              <label className="label">Buchungs-Link</label>
              <input
                name="booking_url"
                type="url"
                className="input"
                defaultValue={f?.booking_url ?? ""}
                placeholder="https://"
              />
            </div>
          </div>

          <div>
            <label className="label">Notizen</label>
            <textarea
              name="notes"
              className="textarea"
              rows={2}
              defaultValue={f?.notes ?? ""}
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
