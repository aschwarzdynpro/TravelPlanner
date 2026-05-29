"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal";
import type { Accommodation, Area } from "./types";
import { saveAccommodation } from "@/app/(app)/trips/[id]/actions";
import { BOARD_LEVELS, BOARD_LEVEL_ORDER, CURRENCIES } from "@/lib/constants";
import CoordinateFields from "@/components/map/CoordinateFields";
import SelectMenu from "@/components/ui/SelectMenu";
import DatePicker from "@/components/ui/DatePicker";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";

const BOARD_OPTIONS = BOARD_LEVEL_ORDER.map((v) => ({
  value: v,
  label: BOARD_LEVELS[v],
}));
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));

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
  const addressRef = useRef<HTMLInputElement>(null);

  // Coordinates picked via the place autocomplete. Bumping `coordsKey`
  // remounts CoordinateFields so it picks up the new defaults.
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [coordsKey, setCoordsKey] = useState(0);

  // Set an uncontrolled input's value and notify React/listeners.
  function setInput(ref: React.RefObject<HTMLInputElement | null>, value: string) {
    if (ref.current) ref.current.value = value;
  }

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
            <label className="label">Name / Ort suchen *</label>
            <PlaceAutocomplete
              name="name"
              required
              autoFocus
              defaultValue={a?.name ?? ""}
              placeholder="z. B. Hotel Belvedere, Dubrovnik"
              onSelect={(r) => {
                setInput(addressRef, r.address);
                setPicked({ lat: r.latitude, lng: r.longitude });
                setCoordsKey((k) => k + 1);
              }}
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Tippe einen Namen: Wird ein Treffer gewählt, füllen sich Adresse und
              Koordinaten automatisch. Du kannst auch einfach frei eintippen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Gegend</label>
              <SelectMenu
                name="area_id"
                defaultValue={a?.area_id ?? defaultAreaId ?? ""}
                placeholder="— ohne Gegend —"
                options={[
                  { value: "", label: "— ohne Gegend —" },
                  ...areas.map((ar) => ({ value: ar.id, label: ar.name })),
                ]}
              />
            </div>
            <div>
              <label className="label">Verpflegung</label>
              <SelectMenu
                name="board_level"
                defaultValue={a?.board_level ?? "none"}
                options={BOARD_OPTIONS}
              />
            </div>
          </div>

          <div>
            <label className="label">Adresse</label>
            <input
              ref={addressRef}
              name="address"
              className="input"
              defaultValue={a?.address ?? ""}
              placeholder="Straße, Ort"
            />
          </div>

          <CoordinateFields
            key={coordsKey}
            defaultLatitude={picked?.lat ?? a?.latitude}
            defaultLongitude={picked?.lng ?? a?.longitude}
            getQuery={() => addressRef.current?.value?.trim() ?? ""}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Check-in Datum</label>
              <DatePicker
                name="check_in_date"
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
              <DatePicker
                name="check_out_date"
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
            <div>
              <label className="label">Preis / Nacht</label>
              <input
                name="price_per_night"
                type="number"
                step="0.01"
                min="0"
                className="input"
                defaultValue={a?.price_per_night ?? ""}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="label">Gesamtkosten</label>
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
              <SelectMenu
                name="currency"
                defaultValue={a?.currency ?? "EUR"}
                options={CURRENCY_OPTIONS}
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-[var(--muted)]">
            Nur Preis/Nacht angeben genügt – die Gesamtkosten werden dann aus den
            Nächten (Check-in bis Check-out) berechnet.
          </p>

          <div className="rounded-lg border border-dashed p-3">
            <div className="mb-2 text-xs font-semibold text-[var(--muted)]">
              Stornierung
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Kostenlos stornierbar bis</label>
                <DatePicker
                  name="cancellation_deadline"
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
