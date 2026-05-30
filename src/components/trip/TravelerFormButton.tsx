"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Modal from "@/components/Modal";
import { Loader2 } from "@/components/icons";
import type { Traveler } from "./types";
import { saveTraveler } from "@/app/(app)/trips/[id]/actions";

export default function TravelerFormButton({
  tripId,
  traveler,
  label,
  title,
  className = "btn-primary",
}: {
  tripId: string;
  traveler?: Traveler;
  label: React.ReactNode;
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = traveler;

  return (
    <>
      <button className={className} title={title} onClick={() => setOpen(true)}>
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t ? "Mitreisende:n bearbeiten" : "Mitreisende:n hinzufügen"}
      >
        <form
          action={async (formData) => {
            await saveTraveler(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
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

          <FormActions onCancel={() => setOpen(false)} />
        </form>
      </Modal>
    </>
  );
}

// Submit + cancel row inside the <form> so useFormStatus reflects the pending
// server action: spinner + locked buttons while saving.
function FormActions({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        className="btn-ghost"
        onClick={onCancel}
        disabled={pending}
      >
        Abbrechen
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
