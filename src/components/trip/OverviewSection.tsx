"use client";

import type { WorkspaceData } from "./types";
import { formatCurrency, formatDate, daysUntil } from "@/lib/format";

function StatCard({
  label,
  value,
  hint,
  onClick,
}: {
  label: string;
  value: string;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left transition hover:shadow-md"
    >
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-[var(--muted)]">{hint}</div>}
    </button>
  );
}

export default function OverviewSection({
  accommodations,
  flights,
  travelers,
  areas,
  members,
  onNavigate,
}: WorkspaceData & { onNavigate: (tab: string) => void }) {
  const accTotal = accommodations.reduce((s, a) => s + (a.cost ?? 0), 0);
  const flightTotal = flights.reduce((s, f) => s + (f.cost ?? 0), 0);
  const total = accTotal + flightTotal;
  const activeMembers = members.filter((m) => m.status === "active").length;
  const perPerson = travelers.length ? total / travelers.length : 0;

  // Upcoming cancellation deadlines (accommodations), nearest first.
  const deadlines = accommodations
    .filter((a) => a.cancellation_deadline)
    .map((a) => ({
      name: a.name,
      date: a.cancellation_deadline!,
      left: daysUntil(a.cancellation_deadline),
    }))
    .filter((d) => d.left !== null && d.left >= 0)
    .sort((a, b) => (a.left ?? 0) - (b.left ?? 0));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Gesamtkosten"
          value={formatCurrency(total)}
          hint={travelers.length ? `${formatCurrency(perPerson)} / Person` : undefined}
        />
        <StatCard
          label="Unterkünfte"
          value={String(accommodations.length)}
          hint={`${areas.length} Gegenden`}
          onClick={() => onNavigate("stays")}
        />
        <StatCard
          label="Flüge"
          value={String(flights.length)}
          onClick={() => onNavigate("flights")}
        />
        <StatCard
          label="Mitreisende"
          value={String(travelers.length)}
          hint={`${activeMembers} Mitglieder`}
          onClick={() => onNavigate("travelers")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-semibold">💶 Kostenaufschlüsselung</h3>
          <CostRow label="🏨 Unterkünfte" value={accTotal} total={total} />
          <CostRow label="✈️ Flüge" value={flightTotal} total={total} />
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <span className="font-semibold">Summe</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-semibold">⏰ Storno-Fristen</h3>
          {deadlines.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Keine anstehenden Stornierungsfristen hinterlegt.
            </p>
          ) : (
            <ul className="space-y-2">
              {deadlines.slice(0, 6).map((d, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate">{d.name}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-[var(--muted)]">{formatDate(d.date)}</span>
                    <span
                      className={`chip ${
                        (d.left ?? 99) <= 3
                          ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {d.left} {d.left === 1 ? "Tag" : "Tage"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function CostRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-[var(--primary)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
