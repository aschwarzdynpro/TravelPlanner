"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { relativeTime } from "@/lib/format";
import type { WorkspaceData } from "./types";

export type ActivityEntry = {
  id: string;
  trip_id: string;
  user_id: string | null;
  action: string;
  detail: { name?: string | null; role?: string | null } | null;
  created_at: string;
  // Joined on the server for the initial load; resolved from members for
  // realtime-inserted rows.
  actorName?: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Eigentümer",
  editor: "Bearbeiter",
  viewer: "Betrachter",
};

function describe(entry: ActivityEntry): { icon: string; text: string } {
  const name = entry.detail?.name ?? "";
  const role = entry.detail?.role ? ROLE_LABELS[entry.detail.role] ?? entry.detail.role : "";
  switch (entry.action) {
    case "trip.updated":
      return { icon: "✏️", text: "hat die Reisedaten aktualisiert" };
    case "area.created":
      return { icon: "🗺️", text: `hat die Gegend „${name}" hinzugefügt` };
    case "area.updated":
      return { icon: "🗺️", text: `hat die Gegend „${name}" bearbeitet` };
    case "area.deleted":
      return { icon: "🗑️", text: `hat die Gegend „${name}" gelöscht` };
    case "accommodation.created":
      return { icon: "🏨", text: `hat die Unterkunft „${name}" hinzugefügt` };
    case "accommodation.updated":
      return { icon: "🏨", text: `hat die Unterkunft „${name}" bearbeitet` };
    case "accommodation.deleted":
      return { icon: "🗑️", text: `hat die Unterkunft „${name}" gelöscht` };
    case "flight.created":
      return { icon: "✈️", text: `hat den Flug „${name}" hinzugefügt` };
    case "flight.updated":
      return { icon: "✈️", text: `hat den Flug „${name}" bearbeitet` };
    case "flight.deleted":
      return { icon: "🗑️", text: `hat den Flug „${name}" gelöscht` };
    case "traveler.created":
      return { icon: "🧑", text: `hat „${name}" als Mitreisende:n hinzugefügt` };
    case "traveler.updated":
      return { icon: "🧑", text: `hat Mitreisende:n „${name}" bearbeitet` };
    case "traveler.deleted":
      return { icon: "🗑️", text: `hat Mitreisende:n „${name}" entfernt` };
    case "member.invited":
      return { icon: "📨", text: `hat ${name} eingeladen` };
    case "member.role_changed":
      return { icon: "🔑", text: `hat eine Rolle auf ${role} geändert` };
    case "member.removed":
      return { icon: "🚪", text: `hat ${name || "ein Mitglied"} entfernt` };
    default:
      return { icon: "•", text: entry.action };
  }
}

export default function ActivitySection({
  trip,
  members,
  initialActivity = [],
}: WorkspaceData & { initialActivity?: ActivityEntry[] }) {
  const [entries, setEntries] = useState<ActivityEntry[]>(initialActivity);

  // Resolve an actor's display name from the trip members (covers realtime rows
  // that arrive without the joined profile).
  function nameFor(userId: string | null): string {
    if (!userId) return "System";
    const m = members.find((m) => m.user_id === userId);
    return m?.profiles?.display_name || m?.profiles?.email || "Jemand";
  }

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`activity:${trip.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trip_activity",
          filter: `trip_id=eq.${trip.id}`,
        },
        (payload) => {
          const row = payload.new as ActivityEntry;
          setEntries((prev) =>
            // Skip if we already have it (e.g. initial-load overlap).
            prev.some((e) => e.id === row.id)
              ? prev
              : [row, ...prev].slice(0, 100),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trip.id]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">🔔 Aktivität</h3>
        <p className="text-sm text-[var(--muted)]">
          Wer hat was geändert – live aktualisiert.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-[var(--muted)]">
          Noch keine Aktivität. Änderungen an Unterkünften, Flügen, Mitreisenden
          und Mitgliedern erscheinen hier.
        </div>
      ) : (
        <ul className="card divide-y">
          {entries.map((e) => {
            const { icon, text } = describe(e);
            const actor = e.actorName ?? nameFor(e.user_id);
            return (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/5 text-sm dark:bg-white/10">
                  {icon}
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <span
                    className="mr-1 inline-flex items-center gap-1 font-medium"
                    title={actor}
                  >
                    {actor}
                  </span>
                  <span className="text-[var(--muted)]">{text}</span>
                </div>
                <span className="shrink-0 text-xs text-[var(--muted)]">
                  {relativeTime(e.created_at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
