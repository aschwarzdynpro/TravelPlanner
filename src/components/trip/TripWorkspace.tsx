"use client";

import { useState } from "react";
import Link from "next/link";
import type { WorkspaceData } from "./types";
import { TRIP_KINDS } from "@/lib/constants";
import { formatCurrency, formatDateRange } from "@/lib/format";
import { useBreadcrumbTitle } from "@/components/nav/breadcrumb";
import OverviewSection from "./OverviewSection";
import AccommodationsSection from "./AccommodationsSection";
import FlightsSection from "./FlightsSection";
import TravelersSection from "./TravelersSection";
import MembersSection from "./MembersSection";
import MapSection from "./MapSection";
import ActivitySection, { type ActivityEntry } from "./ActivitySection";
import EditTripButton from "./EditTripButton";

const TABS = [
  { id: "overview", label: "Übersicht", icon: "📋" },
  { id: "stays", label: "Unterkünfte", icon: "🏨" },
  { id: "map", label: "Karte", icon: "🗺️" },
  { id: "flights", label: "Flüge", icon: "✈️" },
  { id: "travelers", label: "Mitreisende", icon: "🧑‍🤝‍🧑" },
  { id: "members", label: "Mitglieder", icon: "🤝" },
  { id: "activity", label: "Aktivität", icon: "🔔" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function TripWorkspace(data: WorkspaceData) {
  const [tab, setTab] = useState<TabId>("overview");
  const { trip, accommodations, flights, activity, canEdit } = data;

  useBreadcrumbTitle(trip.name);

  const initialActivity: ActivityEntry[] = activity.map((a) => ({
    id: a.id,
    trip_id: a.trip_id,
    user_id: a.user_id,
    action: a.action,
    detail: (a.detail ?? {}) as ActivityEntry["detail"],
    created_at: a.created_at,
    actorName: a.profiles?.display_name || a.profiles?.email || null,
  }));

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

      <div className="sticky top-0 z-10 mb-6 -mx-4 grid grid-cols-4 border-b bg-[var(--background)]/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80 sm:mx-0 sm:flex sm:gap-1 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex min-w-0 flex-col items-center gap-0.5 border-b-2 px-1 py-2 text-[11px] font-medium transition sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm ${
              tab === t.id
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="text-base leading-none sm:text-sm">{t.icon}</span>
            <span className="max-w-full truncate">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewSection {...data} onNavigate={(t) => setTab(t as TabId)} />
      )}
      {tab === "stays" && <AccommodationsSection {...data} />}
      {tab === "map" && <MapSection {...data} />}
      {tab === "flights" && <FlightsSection {...data} />}
      {tab === "travelers" && <TravelersSection {...data} />}
      {tab === "members" && <MembersSection {...data} />}
      {tab === "activity" && (
        <ActivitySection {...data} initialActivity={initialActivity} />
      )}
    </div>
  );
}
