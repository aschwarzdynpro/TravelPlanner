"use client";

import type { WorkspaceData } from "./types";
import { initials } from "@/lib/format";
import TravelerFormButton from "./TravelerFormButton";
import DeleteButton from "@/components/DeleteButton";
import { deleteTraveler } from "@/app/(app)/trips/[id]/actions";

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
        <div className="card px-6 py-12 text-center text-sm text-[var(--muted)]">
          🧑‍🤝‍🧑 Noch keine Mitreisenden erfasst. Hier verwaltest du alle Personen,
          die mitreisen – unabhängig davon, ob sie ein App-Konto haben.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {travelers.map((t) => (
            <div key={t.id} className="card flex items-start gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
                {initials(t.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold">{t.name}</h4>
                {t.email && (
                  <p className="truncate text-sm text-[var(--muted)]">✉️ {t.email}</p>
                )}
                {t.phone && (
                  <p className="text-sm text-[var(--muted)]">📞 {t.phone}</p>
                )}
                {t.notes && <p className="mt-1 text-sm">{t.notes}</p>}
                {canEdit && (
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <TravelerFormButton
                      tripId={trip.id}
                      traveler={t}
                      label="Bearbeiten"
                      className="text-[var(--primary)] hover:underline"
                    />
                    <DeleteButton
                      action={deleteTraveler}
                      id={t.id}
                      tripId={trip.id}
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
