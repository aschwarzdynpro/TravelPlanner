"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Tables } from "@/lib/database.types";
import { TRIP_KINDS } from "@/lib/constants";
import { formatCurrency, formatDateRange, daysUntil } from "@/lib/format";
import {
  MapPin,
  CalendarDays,
  Users,
  Crown,
  ChevronRight,
  Search,
} from "@/components/icons";
import SelectMenu from "@/components/ui/SelectMenu";

type Trip = Tables<"trips">;
export type TripItem = {
  trip: Trip;
  role: string;
  members: number;
  cost: number;
};

function TripCard({ item }: { item: TripItem }) {
  const { trip, role, members, cost } = item;
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="card group overflow-hidden transition hover:shadow-md"
    >
      <div className="h-2" style={{ backgroundColor: trip.cover_color ?? "#18181b" }} />
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight group-hover:text-[var(--muted)]">
            {trip.name}
          </h3>
          <span className="chip shrink-0 bg-black/5 dark:bg-white/10">
            {TRIP_KINDS[trip.kind] ?? trip.kind}
          </span>
        </div>
        {trip.destination && (
          <p className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {trip.destination}
          </p>
        )}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted)]">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          {formatDateRange(trip.start_date, trip.end_date)}
        </p>
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
          <span className="flex items-center gap-1.5 text-[var(--muted)]">
            <Users className="h-3.5 w-3.5" strokeWidth={2} />
            {members}
          </span>
          <span className="font-semibold">{formatCurrency(cost)}</span>
        </div>
        {role === "owner" && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--muted)]">
            <Crown className="h-3 w-3" strokeWidth={2} />
            Du bist Eigentümer
          </span>
        )}
      </div>
    </Link>
  );
}

function Grid({ items }: { items: TripItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <TripCard key={it.trip.id} item={it} />
      ))}
    </div>
  );
}

export default function TripsBrowser({ items }: { items: TripItem[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (kind && it.trip.kind !== kind) return false;
      if (!q) return true;
      return (
        it.trip.name.toLowerCase().includes(q) ||
        (it.trip.destination?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [items, query, kind]);

  const isPast = (t: Trip) => {
    const ref = t.end_date ?? t.start_date;
    return ref != null && (daysUntil(ref) ?? 0) < 0;
  };
  const upcoming = filtered.filter((it) => !isPast(it.trip));
  const past = filtered.filter((it) => isPast(it.trip));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
            strokeWidth={2}
          />
          <input
            className="input pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Reise oder Ziel suchen …"
          />
        </div>
        <SelectMenu
          name="kind-filter"
          defaultValue=""
          className="sm:w-44"
          options={[
            { value: "", label: "Alle Typen" },
            ...Object.entries(TRIP_KINDS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
          onChange={setKind}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-[var(--muted)]">
          Keine Treffer für die aktuelle Suche.
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 ? (
            <Grid items={upcoming} />
          ) : (
            <div className="card px-6 py-10 text-center text-sm text-[var(--muted)]">
              Keine anstehenden Reisen. Vergangene findest du unten.
            </div>
          )}

          {past.length > 0 && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-2 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
                <ChevronRight
                  className="h-4 w-4 transition-transform group-open:rotate-90"
                  strokeWidth={2}
                />
                Vergangene Reisen ({past.length})
              </summary>
              <div className="mt-3">
                <Grid items={past} />
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
