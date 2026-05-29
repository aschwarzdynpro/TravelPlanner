"use client";

import type { WorkspaceData } from "./types";
import { MEMBER_ROLES } from "@/lib/constants";
import { initials } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";
import FollowMeCard from "./FollowMeCard";
import ReTravelButton from "./ReTravelButton";
import {
  inviteMember,
  updateMemberRole,
  removeMember,
} from "@/app/(app)/trips/[id]/actions";
import { Repeat } from "@/components/icons";

export default function MembersSection({
  trip,
  members,
  canEdit,
  isOwner,
  currentUserId,
}: WorkspaceData) {
  return (
    <div className="space-y-6">
      {/* Collaboration tools */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FollowMeCard trip={trip} canManage={isOwner} />
        <div className="card flex flex-col justify-between gap-3 p-5">
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <Repeat className="h-4 w-4" strokeWidth={2} />
              Re-Travel
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Diese Reise als Vorlage nehmen und für einen neuen Termin neu planen.
            </p>
          </div>
          <div>
            <ReTravelButton trip={trip} className="btn-primary" />
          </div>
        </div>
      </div>

      {/* Invite */}
      {canEdit && (
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Mitglied einladen</h3>
          <form action={inviteMember} className="flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="trip_id" value={trip.id} />
            <input
              name="email"
              type="email"
              required
              className="input"
              placeholder="email@beispiel.de"
            />
            <select name="role" className="select sm:w-44" defaultValue="editor">
              {Object.entries(MEMBER_ROLES)
                .filter(([v]) => v !== "owner")
                .map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
            </select>
            <button type="submit" className="btn-primary shrink-0">
              Einladen
            </button>
          </form>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Hat die Person noch kein Konto, wird die Einladung automatisch
            zugeordnet, sobald sie sich mit dieser E-Mail registriert.
          </p>
        </div>
      )}

      {/* Member list */}
      <div className="card overflow-hidden">
        <div className="border-b px-5 py-3">
          <h3 className="font-semibold">Mitglieder ({members.length})</h3>
        </div>
        <ul className="divide-y">
          {members.map((m) => {
            const name =
              m.profiles?.display_name ||
              m.invited_email ||
              m.profiles?.email ||
              "Eingeladen";
            const email = m.profiles?.email || m.invited_email || "";
            const isSelf = m.user_id === currentUserId;
            return (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)]">
                  {initials(name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{name}</span>
                    {isSelf && (
                      <span className="chip bg-black/5 dark:bg-white/10">du</span>
                    )}
                    {m.status === "invited" && (
                      <span className="chip bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        eingeladen
                      </span>
                    )}
                  </div>
                  {email && (
                    <div className="truncate text-sm text-[var(--muted)]">
                      {email}
                    </div>
                  )}
                </div>

                {/* Role: owners can edit non-owner roles */}
                {isOwner && m.role !== "owner" ? (
                  <form action={updateMemberRole} className="flex items-center gap-2">
                    <input type="hidden" name="trip_id" value={trip.id} />
                    <input type="hidden" name="id" value={m.id} />
                    <select
                      name="role"
                      defaultValue={m.role}
                      className="select w-32 text-sm"
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                    >
                      {Object.entries(MEMBER_ROLES)
                        .filter(([v]) => v !== "owner")
                        .map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                    </select>
                  </form>
                ) : (
                  <span className="chip bg-black/5 dark:bg-white/10">
                    {MEMBER_ROLES[m.role] ?? m.role}
                  </span>
                )}

                {/* Remove: owners can remove others; anyone can leave */}
                {((isOwner && m.role !== "owner") || isSelf) &&
                  !(isSelf && m.role === "owner") && (
                    <DeleteButton
                      action={removeMember}
                      id={m.id}
                      tripId={trip.id}
                      label={isSelf ? "Verlassen" : "Entfernen"}
                      confirmText={
                        isSelf
                          ? "Reise wirklich verlassen?"
                          : `„${name}" entfernen?`
                      }
                    />
                  )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
