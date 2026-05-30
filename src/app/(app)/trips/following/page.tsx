import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TRIP_KINDS } from "@/lib/constants";
import { formatDateRange } from "@/lib/format";
import { Share2, MapPin, CalendarDays, ArrowRight } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function FollowingTripsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Trips the user follows. The embedded trip is only returned while the user
  // may still see it (RLS) — i.e. it is still public. is_public is re-checked
  // below so a since-unshared trip drops out of the list.
  const { data: follows } = await supabase
    .from("trip_follows")
    .select("trip_id, trips(id, name, kind, destination, start_date, end_date, cover_color, share_token, is_public)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const trips = (follows ?? [])
    .map((f) => f.trips)
    .filter(
      (t): t is NonNullable<typeof t> => Boolean(t) && t!.is_public === true,
    );

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
            Öffne einen geteilten „Follow-Me"-Link und tippe auf „Dieser Reise
            folgen". Gefolgte Reisen sammeln sich hier und du behältst
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
