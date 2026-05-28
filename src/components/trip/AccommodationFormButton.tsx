"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import type { Accommodation, Area } from "./types";
import { saveAccommodation } from "@/app/(app)/trips/[id]/actions";
import { BOARD_LEVELS, BOARD_LEVEL_ORDER, CURRENCIES } from "@/lib/constants";

export default function AccommodationFormButton({
  tripId,
  areas,
  accommodation,
  defaultAreaId,
  label,
  className = "btn-primary",
}: {
  tripId: string;
  areas: Area[];
  accommodation?: Accommodation;
  defaultAreaId?: string | null;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const a = accommodation;

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={a ? "Unterkunft bearbeiten" : "Unterkunft hinzufügen"}
      >
        <form action={saveAccommodation} className="space-y-4">
          <input type="hidden" name="trip_id" value={tripId} />
          {a && <input type="hidden" name="id" value={a.id} />}

          <div>
            <label className="label">Name *</label>
            <input
              name="name"
              className="input"
              required
              autoFocus
              defaultValue={a?.name ?? ""}
              placeholder="z. B. Hotel Belvedere"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Gegend</label>
              <select
                name="area_id"
                className="select"
                defaultValue={a?.area_id ?? defaultAreaId ?? ""}
              >
                <option value="">— ohne Gegend —</option>
                {areas.map((ar) => (
                  <option key={ar.id} value={ar.id}>
                    {ar.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Verpflegung</label>
              <select
                name="board_level"
                className="select"
                defaultValue={a?.board_level ?? "none"}
              >
                {BOARD_LEVEL_ORDER.map((v) => (
                  <option key={v} value={v}>
                    {BOARD_LEVELS[v]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Adresse</label>
            <input
              name="address"
              className="input"
              defaultValue={a?.address ?? ""}
              placeholder="Straße, Ort"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Check-in Datum</label>
              <input
                name="check_in_date"
                type="date"
                className="input"
                defaultValue={a?.check_in_date ?? ""}
              />
            </div>
            <div>
              <label className="label">Check-in Zeit</label>
              <input
                name="check_in_time"
                type="time"
                className="input"
                defaultValue={a?.check_in_time?.slice(0, 5) ?? ""}
              />
            </div>
            <div>
              <label className="label">Check-out Datum</label>
              <input
                name="check_out_date"
                type="date"
                className="input"
                defaultValue={a?.check_out_date ?? ""}
              />
            </div>
            <div>
              <label className="label">Check-out Zeit</label>
              <input
                name="check_out_time"
                type="time"
                className="input"
                defaultValue={a?.check_out_time?.slice(0, 5) ?? ""}
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
                defaultValue={a?.cost ?? ""}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="label">Währung</label>
              <select
                name="currency"
                className="select"
                defaultValue={a?.currency ?? "EUR"}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-dashed p-3">
            <div className="mb-2 text-xs font-semibold text-[var(--muted)]">
              Stornierung
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Kostenlos stornierbar bis</label>
                <input
                  name="cancellation_deadline"
                  type="date"
                  className="input"
                  defaultValue={a?.cancellation_deadline ?? ""}
                />
              </div>
              <div>
                <label className="label">Stornierungsbedingungen</label>
                <textarea
                  name="cancellation_policy"
                  className="textarea"
                  rows={2}
                  defaultValue={a?.cancellation_policy ?? ""}
                  placeholder="z. B. bis 14 Tage vorher kostenlos, danach 80 %"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Buchungsnummer</label>
              <input
                name="booking_reference"
                className="input"
                defaultValue={a?.booking_reference ?? ""}
              />
            </div>
            <div>
              <label className="label">Buchungs-Link</label>
              <input
                name="booking_url"
                type="url"
                className="input"
                defaultValue={a?.booking_url ?? ""}
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
              defaultValue={a?.notes ?? ""}
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
