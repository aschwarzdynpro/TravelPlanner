"use client";

import type { WorkspaceData } from "./types";
import { initials } from "@/lib/format";
import TravelerFormButton from "./TravelerFormButton";
import DeleteButton from "@/components/DeleteButton";
import { deleteTraveler } from "@/app/(app)/trips/[id]/actions";
import { Users, Mail, Phone, Pencil, Trash2 } from "@/components/icons";

export default function TravelersSection({
  trip,
  travelers,
  canEdit,
}: WorkspaceData) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">
          {travelers.length}{" "}
          {travelers.length === 1 ? "Mitreisende:r" : "Mitreisende"}
        </p>
        {canEdit && (
          <TravelerFormButton
            tripId={trip.id}
            label="+ Mitreisende:n"
            className="btn-primary"
          />
        )}
      </div>

      {travelers.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-[var(--muted)]">
          <Users className="h-8 w-8" strokeWidth={1.5} />
          Noch keine Mitreisenden erfasst. Hier verwaltest du alle Personen,
          die mitreisen – unabhängig davon, ob sie ein App-Konto haben.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {travelers.map((t) => (
            <div key={t.id} className="card flex items-start gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)]">
                {initials(t.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold">{t.name}</h4>
                {t.email && (
                  <p className="flex items-center gap-1.5 truncate text-sm text-[var(--muted)]">
                    <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    {t.email}
                  </p>
                )}
                {t.phone && (
                  <p className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
                    <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    {t.phone}
                  </p>
                )}
                {t.notes && <p className="mt-1 text-sm">{t.notes}</p>}
                {canEdit && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <TravelerFormButton
                      tripId={trip.id}
                      traveler={t}
                      label={<Pencil className="h-4 w-4" strokeWidth={2} />}
                      title="Mitreisende:n bearbeiten"
                      className="icon-btn"
                    />
                    <DeleteButton
                      action={deleteTraveler}
                      id={t.id}
                      tripId={trip.id}
                      label={<Trash2 className="h-4 w-4" strokeWidth={2} />}
                      title="Mitreisende:n entfernen"
                      className="icon-btn icon-btn-danger"
                      confirmText={`„${t.name}" entfernen?`}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
