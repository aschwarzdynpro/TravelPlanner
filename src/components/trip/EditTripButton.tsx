"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Modal from "@/components/Modal";
import type { Trip } from "./types";
import { COVER_COLORS, TRIP_KINDS, CURRENCIES } from "@/lib/constants";
import { updateTrip } from "@/app/(app)/trips/[id]/actions";
import { deleteTrip } from "@/app/(app)/trips/actions";
import { Pencil, Loader2 } from "@/components/icons";
import SelectMenu from "@/components/ui/SelectMenu";
import DatePicker from "@/components/ui/DatePicker";

const KIND_OPTIONS = Object.entries(TRIP_KINDS).map(([value, label]) => ({
  value,
  label,
}));
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));

export default function EditTripButton({ trip }: { trip: Trip }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(trip.cover_color ?? "#18181b");

  return (
    <>
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" strokeWidth={2} />
        Bearbeiten
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Reise bearbeiten">
        <form
          action={async (formData) => {
            await updateTrip(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={trip.id} />
          <input type="hidden" name="cover_color" value={color} />

          <div>
            <label className="label">Name *</label>
            <input name="name" className="input" required defaultValue={trip.name} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Typ</label>
              <SelectMenu
                name="kind"
                defaultValue={trip.kind}
                options={KIND_OPTIONS}
              />
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
              <DatePicker name="start_date" defaultValue={trip.start_date ?? ""} />
            </div>
            <div>
              <label className="label">Bis</label>
              <DatePicker name="end_date" defaultValue={trip.end_date ?? ""} />
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
              <SelectMenu
                name="budget_currency"
                defaultValue={trip.budget_currency ?? "EUR"}
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

          <FormActions />
        </form>
      </Modal>
    </>
  );
}

// Save + delete row inside the <form> so useFormStatus reflects the pending
// action (either button) with a spinner and locked controls. Delete keeps its
// own formAction + confirm; it redirects server-side, so no close is needed.
function FormActions() {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center justify-between gap-2 border-t pt-4">
      <button
        type="submit"
        formAction={deleteTrip}
        className="btn-danger"
        disabled={pending}
        onClick={(e) => {
          if (!confirm("Diese Reise wirklich endgültig löschen?"))
            e.preventDefault();
        }}
      >
        Löschen
      </button>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Speichern…
          </>
        ) : (
          "Speichern"
        )}
      </button>
    </div>
  );
}
