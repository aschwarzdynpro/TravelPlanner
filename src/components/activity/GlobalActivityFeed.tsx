"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [tripFilter, setTripFilter] = useState("");
  const [personFilter, setPersonFilter] = useState("");

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

  // Distinct trips and people for the filter dropdowns, derived from the
  // entries currently in the feed.
  const tripOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of entries) {
      if (!map.has(e.trip_id)) {
        map.set(e.trip_id, e.tripName || "Unbenannte Reise");
      }
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [entries]);

  const personOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of entries) {
      if (e.user_id && !map.has(e.user_id)) {
        map.set(e.user_id, e.actorName || "Unbekannt");
      }
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [entries]);

  const filtered = useMemo(
    () =>
      entries.filter(
        (e) =>
          (!tripFilter || e.trip_id === tripFilter) &&
          (!personFilter || e.user_id === personFilter),
      ),
    [entries, tripFilter, personFilter],
  );

  if (entries.length === 0) {
    return (
      <div className="card px-6 py-16 text-center text-sm text-[var(--muted)]">
        Noch keine Aktivität. Sobald du oder Mitplanende etwas an euren Reisen
        ändern, erscheint es hier.
      </div>
    );
  }

  const hasFilter = Boolean(tripFilter || personFilter);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="select w-auto min-w-[10rem] flex-1 sm:flex-none"
          value={tripFilter}
          onChange={(e) => setTripFilter(e.target.value)}
          aria-label="Nach Reise filtern"
        >
          <option value="">Alle Reisen</option>
          {tripOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          className="select w-auto min-w-[10rem] flex-1 sm:flex-none"
          value={personFilter}
          onChange={(e) => setPersonFilter(e.target.value)}
          aria-label="Nach Person filtern"
        >
          <option value="">Alle Personen</option>
          {personOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setTripFilter("");
              setPersonFilter("");
            }}
            className="text-sm text-[var(--muted)] hover:underline"
          >
            Filter zurücksetzen
          </button>
        )}
        <span className="ml-auto text-xs text-[var(--muted)]">
          {filtered.length} {filtered.length === 1 ? "Eintrag" : "Einträge"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-[var(--muted)]">
          Keine Einträge für die gewählten Filter.
        </div>
      ) : (
        <ul className="card divide-y">
          {filtered.map((e) => {
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
      )}
    </div>
  );
}
