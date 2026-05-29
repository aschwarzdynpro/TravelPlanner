"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { relativeTime } from "@/lib/format";
import { describeActivity } from "@/components/trip/activity-format";

export type GlobalActivityEntry = {
  id: string;
  trip_id: string;
  user_id: string | null;
  action: string;
  detail: { name?: string | null; role?: string | null } | null;
  created_at: string;
  actorName?: string | null;
  tripName?: string | null;
  tripColor?: string | null;
};

export default function GlobalActivityFeed({
  initial,
}: {
  initial: GlobalActivityEntry[];
}) {
  const [entries, setEntries] = useState<GlobalActivityEntry[]>(initial);

  useEffect(() => {
    const supabase = createClient();
    // Subscribe to all activity inserts; RLS scopes the stream to trips the
    // user may view, so no trip filter is needed here. We enrich rows that
    // belong to trips we already know about (from the initial load); unknown
    // trips fall back to a neutral label.
    const tripMeta = new Map(
      initial.map((e) => [e.trip_id, { name: e.tripName, color: e.tripColor }]),
    );

    const channel = supabase
      .channel("activity:global")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trip_activity" },
        (payload) => {
          const row = payload.new as GlobalActivityEntry;
          const meta = tripMeta.get(row.trip_id);
          setEntries((prev) =>
            prev.some((e) => e.id === row.id)
              ? prev
              : [
                  {
                    ...row,
                    tripName: meta?.name ?? null,
                    tripColor: meta?.color ?? null,
                  },
                  ...prev,
                ].slice(0, 200),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initial]);

  if (entries.length === 0) {
    return (
      <div className="card px-6 py-16 text-center text-sm text-[var(--muted)]">
        Noch keine Aktivität. Sobald du oder Mitplanende etwas an euren Reisen
        ändern, erscheint es hier.
      </div>
    );
  }

  return (
    <ul className="card divide-y">
      {entries.map((e) => {
        const { icon, text } = describeActivity(e);
        const actor = e.actorName ?? "Jemand";
        return (
          <li key={e.id} className="flex items-center gap-3 px-4 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/5 text-sm dark:bg-white/10">
              {icon}
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <span className="font-medium" title={actor}>
                {actor}
              </span>{" "}
              <span className="text-[var(--muted)]">{text}</span>
              {e.tripName && (
                <>
                  {" · "}
                  <Link
                    href={`/trips/${e.trip_id}`}
                    className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                  >
                    {e.tripColor && (
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: e.tripColor }}
                      />
                    )}
                    {e.tripName}
                  </Link>
                </>
              )}
            </div>
            <span className="shrink-0 text-xs text-[var(--muted)]">
              {relativeTime(e.created_at)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
