import { createClient } from "@/lib/supabase/server";
import { buildICalendar, icsFilename, type CalEvent } from "@/lib/ical";

export const dynamic = "force-dynamic";

// GET /trips/:id/calendar -> downloadable .ics with flights + stays.
// Auth via Supabase; RLS ensures only trips the user may view are exported.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: trip } = await supabase
    .from("trips")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();
  if (!trip) {
    // Either it doesn't exist or RLS hides it from this user.
    return new Response("Not found", { status: 404 });
  }

  const [{ data: flights }, { data: accommodations }] = await Promise.all([
    supabase
      .from("flights")
      .select("*")
      .eq("trip_id", id)
      .order("departure_time", { nullsFirst: false }),
    supabase
      .from("accommodations")
      .select("*")
      .eq("trip_id", id)
      .order("check_in_date", { nullsFirst: false }),
  ]);

  const events: CalEvent[] = [];

  for (const f of flights ?? []) {
    if (!f.departure_time) continue; // need at least a start instant
    const route = [f.departure_airport, f.arrival_airport]
      .filter(Boolean)
      .join(" → ");
    const label = [f.airline, f.flight_number].filter(Boolean).join(" ");
    const summary =
      "Flug" + (label ? ` ${label}` : "") + (route ? ` (${route})` : "");
    events.push({
      uid: `flight-${f.id}@travelplanner`,
      start: f.departure_time,
      end: f.arrival_time ?? undefined,
      allDay: false,
      summary,
      location: route || undefined,
      description: f.booking_reference
        ? `Buchung: ${f.booking_reference}`
        : undefined,
    });
  }

  for (const a of accommodations ?? []) {
    if (!a.check_in_date) continue; // need at least a check-in date
    events.push({
      uid: `stay-${a.id}@travelplanner`,
      start: a.check_in_date,
      end: a.check_out_date ?? undefined,
      allDay: true,
      summary: `Unterkunft: ${a.name}`,
      location: a.address ?? undefined,
      description: a.booking_reference
        ? `Buchung: ${a.booking_reference}`
        : undefined,
    });
  }

  const body = buildICalendar(events, trip.name);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${icsFilename(trip.name)}"`,
      "Cache-Control": "no-store",
    },
  });
}
