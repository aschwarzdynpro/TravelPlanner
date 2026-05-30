import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TRIP_KINDS } from "@/lib/constants";
import { formatDateRange } from "@/lib/format";
import { Share2, MapPin, CalendarDays, ArrowRight } from "@/components/icons";

export const dynamic = "force-dynamic";

type FollowedTrip = {
  id: string;
  name: string;
  kind: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_color: string | null;
  share_token: string;
};

export default async function FollowingTripsPage() {
  const supabase = await createClient();

  // The followed trips that are still public, with only safe display columns.
  // Served by a SECURITY DEFINER function because non-members no longer read
  // public trips directly (share-level boundary); a trip that was unshared
  // drops out automatically.
  const { data } = await supabase.rpc("get_followed_trips");
  const trips = (data as unknown as FollowedTrip[] | null) ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Follow-Up Reisen</h1>
        <p className="text-sm text-[var(--muted)]">
          Reisen anderer, denen du folgst
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Share2 className="h-10 w-10 text-[var(--muted)]" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold">Noch nichts im Blick</h2>
          <p className="max-w-md text-sm text-[var(--muted)]">
            Öffne einen geteilten „Follow-Me“-Link und tippe auf „Dieser Reise
            folgen“. Gefolgte Reisen sammeln sich hier und du behältst
            Aktualisierungen im Blick.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <Link
              key={t.id}
              href={`/follow/${t.share_token}`}
              className="card group overflow-hidden transition hover:shadow-md"
            >
              <div
                className="h-2"
                style={{ backgroundColor: t.cover_color ?? "#18181b" }}
              />
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight group-hover:text-[var(--muted)]">
                    {t.name}
                  </h3>
                  <span className="chip shrink-0 bg-black/5 dark:bg-white/10">
                    {TRIP_KINDS[t.kind] ?? t.kind}
                  </span>
                </div>
                {t.destination && (
                  <p className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    {t.destination}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  {formatDateRange(t.start_date, t.end_date)}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium">
                  Ansehen
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
