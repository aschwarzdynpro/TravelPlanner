"use client";

import { useState } from "react";
import Link from "next/link";
import type { WorkspaceData } from "./types";
import { TRIP_KINDS } from "@/lib/constants";
import { formatCurrency, formatDateRange } from "@/lib/format";
import OverviewSection from "./OverviewSection";
import AccommodationsSection from "./AccommodationsSection";
import FlightsSection from "./FlightsSection";
import TravelersSection from "./TravelersSection";
import MembersSection from "./MembersSection";
import EditTripButton from "./EditTripButton";

const TABS = [
  { id: "overview", label: "Übersicht", icon: "📋" },
  { id: "stays", label: "Unterkünfte", icon: "🏨" },
  { id: "flights", label: "Flüge", icon: "✈️" },
  { id: "travelers", label: "Mitreisende", icon: "🧑‍🤝‍🧑" },
  { id: "members", label: "Mitglieder", icon: "🤝" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function TripWorkspace(data: WorkspaceData) {
  const [tab, setTab] = useState<TabId>("overview");
  const { trip, accommodations, flights, canEdit } = data;

  const totalCost =
    accommodations.reduce((s, a) => s + (a.cost ?? 0), 0) +
    flights.reduce((s, f) => s + (f.cost ?? 0), 0);

  return (
    <div>
      <Link
        href="/trips"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Alle Reisen
      </Link>

      <div className="card mb-6 overflow-hidden">
        <div className="h-2.5" style={{ backgroundColor: trip.cover_color ?? "#2563eb" }} />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{trip.name}</h1>
              <span className="chip bg-black/5 dark:bg-white/10">
                {TRIP_KINDS[trip.kind] ?? trip.kind}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
              {trip.destination && <span>📍 {trip.destination}</span>}
              <span>🗓️ {formatDateRange(trip.start_date, trip.end_date)}</span>
            </div>
            {trip.description && (
              <p className="mt-2 max-w-2xl text-sm">{trip.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-[var(--muted)]">Gesamtkosten</div>
              <div className="text-xl font-bold">{formatCurrency(totalCost)}</div>
            </div>
            {canEdit && <EditTripButton trip={trip} />}
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewSection {...data} onNavigate={(t) => setTab(t as TabId)} />
      )}
      {tab === "stays" && <AccommodationsSection {...data} />}
      {tab === "flights" && <FlightsSection {...data} />}
      {tab === "travelers" && <TravelersSection {...data} />}
      {tab === "members" && <MembersSection {...data} />}
    </div>
  );
}
