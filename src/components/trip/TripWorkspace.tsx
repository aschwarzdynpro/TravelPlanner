"use client";

import { useRef, useState } from "react";
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
import PrepSection from "./PrepSection";
import EditTripButton from "./EditTripButton";
import Popover from "@/components/ui/Popover";
import {
  LayoutDashboard,
  Hotel,
  MapIcon,
  Plane,
  Users,
  UserPlus,
  Bell,
  ClipboardList,
  ArrowLeft,
  MapPin,
  CalendarDays,
  Printer,
  Download,
  ChevronDown,
  Check,
  type LucideIcon,
} from "@/components/icons";

type TabDef = { id: string; label: string; icon: LucideIcon; primary?: boolean };

// Primary tabs stay visible; the rest live under a "Mehr" menu so the bar fits
// on mobile without wrapping to two rows.
const TABS: TabDef[] = [
  { id: "overview", label: "Übersicht", icon: LayoutDashboard, primary: true },
  { id: "stays", label: "Unterkünfte", icon: Hotel, primary: true },
  { id: "map", label: "Karte", icon: MapIcon, primary: true },
  { id: "flights", label: "Flüge", icon: Plane, primary: true },
  { id: "prep", label: "Vorbereitung", icon: ClipboardList },
  { id: "travelers", label: "Mitreisende", icon: Users },
  { id: "members", label: "Mitglieder", icon: UserPlus },
  { id: "activity", label: "Aktivität", icon: Bell },
];

type TabId =
  | "overview"
  | "prep"
  | "stays"
  | "map"
  | "flights"
  | "travelers"
  | "members"
  | "activity";

export default function TripWorkspace(data: WorkspaceData) {
  const [tab, setTab] = useState<TabId>("overview");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const { trip, accommodations, flights, activity, canEdit } = data;

  const primaryTabs = TABS.filter((t) => t.primary);
  const secondaryTabs = TABS.filter((t) => !t.primary);
  const activeSecondary = secondaryTabs.find((t) => t.id === tab);

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
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Alle Reisen
      </Link>

      <div className="card mb-6 overflow-hidden">
        <div className="h-2.5" style={{ backgroundColor: trip.cover_color ?? "#18181b" }} />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{trip.name}</h1>
              <span className="chip bg-black/5 dark:bg-white/10">
                {TRIP_KINDS[trip.kind] ?? trip.kind}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
              {trip.destination && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                  {trip.destination}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
                {formatDateRange(trip.start_date, trip.end_date)}
              </span>
            </div>
            {trip.description && (
              <p className="mt-2 max-w-2xl text-sm">{trip.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-[var(--muted)]">Gesamtkosten</div>
                <div className="text-xl font-bold">{formatCurrency(totalCost)}</div>
              </div>
              {canEdit && <EditTripButton trip={trip} />}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href={`/trips/${trip.id}/print`}
                className="inline-flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <Printer className="h-4 w-4" strokeWidth={2} />
                Drucken / PDF
              </Link>
              <a
                href={`/trips/${trip.id}/calendar`}
                className="inline-flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                Kalender
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 mb-6 -mx-4 grid grid-cols-5 border-b bg-[var(--background)]/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80 sm:mx-0 sm:flex sm:gap-1 sm:px-0">
        {primaryTabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as TabId)}
              className={`flex min-w-0 flex-col items-center gap-0.5 border-b-2 px-1 py-2 text-[11px] font-medium transition sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm ${
                tab === t.id
                  ? "border-[var(--primary)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="max-w-full truncate">{t.label}</span>
            </button>
          );
        })}

        {/* "Mehr" dropdown for the secondary tabs. */}
        <button
          ref={moreRef}
          onClick={() => setMoreOpen((o) => !o)}
          className={`flex min-w-0 flex-col items-center gap-0.5 border-b-2 px-1 py-2 text-[11px] font-medium transition sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm ${
            activeSecondary
              ? "border-[var(--primary)] text-[var(--foreground)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
          aria-haspopup="menu"
          aria-expanded={moreOpen}
        >
          <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="max-w-full truncate">
            {activeSecondary ? activeSecondary.label : "Mehr"}
          </span>
        </button>
        <Popover
          anchorRef={moreRef}
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          width={184}
        >
          <div
            role="menu"
            className="rounded-lg border bg-[var(--surface)] p-1 shadow-lg"
          >
            {secondaryTabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="menuitem"
                  onClick={() => {
                    setTab(t.id as TabId);
                    setMoreOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-[var(--primary)]/10 text-[var(--foreground)]"
                      : "hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-[var(--muted)]" strokeWidth={2} />
                  <span className="min-w-0 flex-1 truncate">{t.label}</span>
                  {active && <Check className="h-4 w-4 shrink-0" strokeWidth={2} />}
                </button>
              );
            })}
          </div>
        </Popover>
      </div>

      {tab === "overview" && (
        <OverviewSection {...data} onNavigate={(t) => setTab(t as TabId)} />
      )}
      {tab === "prep" && <PrepSection {...data} />}
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
