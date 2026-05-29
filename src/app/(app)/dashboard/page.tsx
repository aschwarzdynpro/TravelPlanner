import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NewTripButton from "@/components/NewTripButton";
import { TRIP_KINDS } from "@/lib/constants";
import { formatDateRange, daysUntil } from "@/lib/format";
import {
  Luggage,
  Share2,
  Bell,
  CircleHelp,
  CalendarDays,
  ArrowRight,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .maybeSingle();
  const name = profile?.display_name || user!.email?.split("@")[0] || "Reisender";

  const { data: memberships } = await supabase
    .from("trip_members")
    .select("role, status, trips(*)")
    .order("created_at", { ascending: false });

  const rows = (memberships ?? []).filter((m) => m.trips);
  const owned = rows.filter((m) => m.role === "owner");
  const shared = rows.filter(
    (m) => m.role !== "owner" && m.status === "active",
  );

  // Next upcoming trips (by start date, future first).
  const upcoming = rows
    .map((m) => m.trips!)
    .filter((t) => t.start_date && (daysUntil(t.start_date) ?? -1) >= 0)
    .sort(
      (a, b) =>
        new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hallo {name}</h1>
          <p className="text-sm text-[var(--muted)]">
            Willkommen zurück bei TravelPlanner.
          </p>
        </div>
        <NewTripButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/trips" className="card p-4 transition hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <Luggage className="h-4 w-4 text-[var(--muted)]" strokeWidth={2} />
            <span className="text-2xl font-bold">{owned.length}</span>
          </div>
          <div className="text-xs text-[var(--muted)]">Meine Reisen</div>
        </Link>
        <Link href="/trips/shared" className="card p-4 transition hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <Share2 className="h-4 w-4 text-[var(--muted)]" strokeWidth={2} />
            <span className="text-2xl font-bold">{shared.length}</span>
          </div>
          <div className="text-xs text-[var(--muted)]">Geteilte Reisen</div>
        </Link>
        <Link href="/activity" className="card flex flex-col justify-between p-4 transition hover:shadow-md">
          <Bell className="h-5 w-5 text-[var(--muted)]" strokeWidth={2} />
          <div className="mt-2 text-xs text-[var(--muted)]">Feed</div>
        </Link>
        <Link href="/help" className="card flex flex-col justify-between p-4 transition hover:shadow-md">
          <CircleHelp className="h-5 w-5 text-[var(--muted)]" strokeWidth={2} />
          <div className="mt-2 text-xs text-[var(--muted)]">Hilfe & Anleitung</div>
        </Link>
      </div>

      {/* Upcoming trips */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b px-5 py-3">
          <CalendarDays className="h-4 w-4" strokeWidth={2} />
          <h2 className="font-semibold">Nächste Reisen</h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--muted)]">
            Keine anstehenden Reisen mit Datum.{" "}
            <Link
              href="/trips"
              className="inline-flex items-center gap-1 font-medium text-[var(--foreground)] hover:underline"
            >
              Reise planen
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </p>
        ) : (
          <ul className="divide-y">
            {upcoming.map((t) => {
              const left = daysUntil(t.start_date);
              return (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className="h-9 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: t.cover_color ?? "#18181b" }}
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/trips/${t.id}`}
                      className="font-medium hover:text-[var(--muted)]"
                    >
                      {t.name}
                    </Link>
                    <div className="text-xs text-[var(--muted)]">
                      {TRIP_KINDS[t.kind] ?? t.kind} ·{" "}
                      {formatDateRange(t.start_date, t.end_date)}
                    </div>
                  </div>
                  {left !== null && (
                    <span className="chip shrink-0 bg-black/5 dark:bg-white/10">
                      {left === 0
                        ? "heute"
                        : `in ${left} ${left === 1 ? "Tag" : "Tagen"}`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
