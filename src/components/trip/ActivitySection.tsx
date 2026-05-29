"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { relativeTime } from "@/lib/format";
import type { WorkspaceData } from "./types";
import { describeActivity, type ActivityEntry } from "./activity-format";

export type { ActivityEntry } from "./activity-format";

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
            const { icon, text } = describeActivity(e);
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
