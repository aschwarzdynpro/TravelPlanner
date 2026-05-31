"use client";

import type { WorkspaceData } from "./types";
import { formatCurrency, formatDate, daysUntil } from "@/lib/format";
import { tripMetrics, costByCountry } from "@/lib/analytics";
import {
  Wallet,
  AlarmClock,
  Hotel,
  Plane,
  MapPin,
  TriangleAlert,
  type LucideIcon,
} from "@/components/icons";

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
  trip,
  accommodations,
  flights,
  travelers,
  areas,
  members,
  todos,
  onNavigate,
}: WorkspaceData & { onNavigate: (tab: string) => void }) {
  const openTodos = todos.filter((t) => !t.done).length;
  const m = tripMetrics(accommodations, flights);
  const { accTotal, flightTotal, total, currencies, mixedCurrencies } = m;
  const activeMembers = members.filter((m) => m.status === "active").length;
  const perPerson = travelers.length ? total / travelers.length : 0;
  const byCountry = costByCountry(accommodations, areas);

  // Paid vs. open across accommodations and flights; everything not marked
  // paid counts as open.
  const paid =
    accommodations.filter((a) => a.is_paid).reduce((s, a) => s + (a.cost ?? 0), 0) +
    flights.filter((f) => f.is_paid).reduce((s, f) => s + (f.cost ?? 0), 0);
  const open = total - paid;

  const budget = trip.budget;
  const budgetPct =
    budget && budget > 0 ? Math.round((total / budget) * 100) : 0;
  const overBudget = budget != null && total > budget;

  // Upcoming/overdue payment due dates on unpaid accommodations + flights.
  const dues = [
    ...accommodations
      .filter((a) => !a.is_paid && a.payment_due_date)
      .map((a) => ({ name: a.name, date: a.payment_due_date! })),
    ...flights
      .filter((f) => !f.is_paid && f.payment_due_date)
      .map((f) => ({
        name:
          [f.airline, f.flight_number].filter(Boolean).join(" ") ||
          [f.departure_airport, f.arrival_airport].filter(Boolean).join(" → ") ||
          "Flug",
        date: f.payment_due_date!,
      })),
  ]
    .map((d) => ({ ...d, left: daysUntil(d.date) }))
    .sort((a, b) => (a.left ?? 0) - (b.left ?? 0));

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
          hint={
            m.nights > 0
              ? `Ø ${formatCurrency(m.avgPerNight)} / Nacht`
              : `${areas.length} Gegenden`
          }
          onClick={() => onNavigate("stays")}
        />
        <StatCard
          label="Flüge"
          value={String(flights.length)}
          hint={
            m.flightCount > 0
              ? `Ø ${formatCurrency(m.avgPerFlight)} / Flug`
              : undefined
          }
          onClick={() => onNavigate("flights")}
        />
        <StatCard
          label="Mitreisende"
          value={String(travelers.length)}
          hint={`${activeMembers} Mitglieder`}
          onClick={() => onNavigate("travelers")}
        />
        <StatCard
          label="Offene Aufgaben"
          value={String(openTodos)}
          hint={todos.length ? `von ${todos.length} gesamt` : "Checkliste anlegen"}
          onClick={() => onNavigate("prep")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Wallet className="h-4 w-4" strokeWidth={2} />
            Kostenaufschlüsselung
          </h3>
          <CostRow icon={Hotel} label="Unterkünfte" value={accTotal} total={total} />
          <CostRow icon={Plane} label="Flüge" value={flightTotal} total={total} />
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <span className="font-semibold">Summe</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>

          {/* Paid vs. open split */}
          <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
            <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
              <div className="text-xs text-[var(--muted)]">Bereits bezahlt</div>
              <div className="font-semibold text-green-700 dark:text-green-300">
                {formatCurrency(paid)}
              </div>
            </div>
            <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
              <div className="text-xs text-[var(--muted)]">Noch offen</div>
              <div className="font-semibold text-amber-700 dark:text-amber-300">
                {formatCurrency(open)}
              </div>
            </div>
          </div>

          {mixedCurrencies && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>
                Es werden mehrere Währungen verwendet ({currencies.join(", ")});
                die Summe addiert die Beträge ohne Umrechnung.
              </span>
            </p>
          )}

          {budget != null && (
            <div className="mt-4 border-t pt-3">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">Budget</span>
                <span className="font-medium">
                  {formatCurrency(budget, trip.budget_currency)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className={`h-full rounded-full ${
                    overBudget ? "bg-red-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>{budgetPct}% genutzt</span>
                <span>
                  {overBudget
                    ? `${formatCurrency(total - budget, trip.budget_currency)} über Budget`
                    : `${formatCurrency(budget - total, trip.budget_currency)} übrig`}
                </span>
              </div>
              {overBudget && (
                <div className="mt-2">
                  <span className="chip bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                    <TriangleAlert className="h-3 w-3" strokeWidth={2} />
                    Budget überschritten
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <AlarmClock className="h-4 w-4" strokeWidth={2} />
            Storno-Fristen
          </h3>
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

      {dues.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Wallet className="h-4 w-4" strokeWidth={2} />
            Offene Zahlungen
          </h3>
          <ul className="space-y-2">
            {dues.map((d, i) => {
              const overdue = (d.left ?? 0) < 0;
              const soon = (d.left ?? 99) >= 0 && (d.left ?? 99) <= 7;
              return (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate">{d.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-[var(--muted)]">
                      {formatDate(d.date)}
                    </span>
                    <span
                      className={`chip ${
                        overdue || soon
                          ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {overdue
                        ? "überfällig"
                        : `in ${d.left} ${d.left === 1 ? "Tag" : "Tagen"}`}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {byCountry.length > 0 && accTotal > 0 && (
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4" strokeWidth={2} />
            Unterkunftskosten pro Land
          </h3>
          <div className="space-y-3">
            {byCountry.map((c) => (
              <div key={c.code ?? "none"}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>
                    {c.name}
                    {c.nights > 0 && (
                      <span className="ml-1.5 text-xs text-[var(--muted)]">
                        · Ø {formatCurrency(c.cost / c.nights)} / Nacht
                      </span>
                    )}
                  </span>
                  <span className="font-medium">{formatCurrency(c.cost)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{
                      width: `${accTotal > 0 ? Math.round((c.cost / accTotal) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CostRow({
  icon: Icon,
  label,
  value,
  total,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-[var(--muted)]" strokeWidth={2} />
          {label}
        </span>
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
