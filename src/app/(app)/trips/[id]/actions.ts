"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nightsBetween } from "@/lib/format";
import type { Json } from "@/lib/database.types";

async function db() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function str(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
}
function num(fd: FormData, key: string): number | null {
  const v = String(fd.get(key) ?? "").trim().replace(",", ".");
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function done(tripId: string) {
  revalidatePath(`/trips/${tripId}`);
}

// Minimal allowlist sanitizer for rich-text notes (rendered via
// dangerouslySetInnerHTML). Drops script/style/iframe blocks, inline event
// handlers and javascript: URLs. The tiptap editor only emits safe formatting
// tags; this guards against hand-crafted writes.
function sanitizeHtml(html: string): string {
  return html
    .replace(/<\/?(script|style|iframe|object|embed|link|meta)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*"\s*javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'\s*javascript:[^']*'/gi, "$1='#'");
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Append an entry to the trip activity feed. Best-effort: a logging failure
 * must never break the underlying mutation, so errors are swallowed. The RLS
 * insert policy requires user_id = auth.uid() and edit rights on the trip.
 */
async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  tripId: string,
  action: string,
  detail: Record<string, Json> = {},
) {
  try {
    await supabase
      .from("trip_activity")
      .insert({ trip_id: tripId, user_id: userId, action, detail });
  } catch {
    // ignore – the feed is non-critical
  }
}

/* ---------- Trip ---------- */
export async function updateTrip(formData: FormData) {
  const { supabase, user } = await db();
  const id = String(formData.get("id"));
  const name = str(formData, "name") ?? "Unbenannt";
  await supabase
    .from("trips")
    .update({
      name,
      kind: String(formData.get("kind") ?? "trip"),
      destination: str(formData, "destination"),
      description: str(formData, "description"),
      start_date: str(formData, "start_date"),
      end_date: str(formData, "end_date"),
      cover_color: String(formData.get("cover_color") ?? "#2563eb"),
      budget: num(formData, "budget"),
      budget_currency: String(formData.get("budget_currency") ?? "EUR"),
    })
    .eq("id", id);
  await logActivity(supabase, user.id, id, "trip.updated", { name });
  done(id);
}

/* ---------- Areas ---------- */
export async function saveArea(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = str(formData, "id");
  const name = str(formData, "name") ?? "Neue Gegend";
  const countryRaw = str(formData, "country_code");
  const payload = {
    trip_id: tripId,
    name,
    region: str(formData, "region"),
    country_code:
      countryRaw && /^[A-Z]{2}$/.test(countryRaw) ? countryRaw : null,
    description: str(formData, "description"),
    arrival_date: str(formData, "arrival_date"),
    departure_date: str(formData, "departure_date"),
    latitude: num(formData, "latitude"),
    longitude: num(formData, "longitude"),
  };
  if (id) await supabase.from("areas").update(payload).eq("id", id);
  else await supabase.from("areas").insert(payload);
  await logActivity(supabase, user.id, tripId, id ? "area.updated" : "area.created", {
    name,
  });
  done(tripId);
}

export async function deleteArea(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = String(formData.get("id"));
  const { data: existing } = await supabase
    .from("areas")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("areas").delete().eq("id", id);
  await logActivity(supabase, user.id, tripId, "area.deleted", {
    name: existing?.name ?? null,
  });
  done(tripId);
}

/* ---------- Accommodations ---------- */
export async function saveAccommodation(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = str(formData, "id");
  const checkIn = str(formData, "check_in_date");
  const checkOut = str(formData, "check_out_date");
  const pricePerNight = num(formData, "price_per_night");
  let cost = num(formData, "cost");
  // When only a per-night price is given, derive the total from the stay length
  // so the existing cost-based totals keep working.
  if (cost === null && pricePerNight !== null) {
    const nights = nightsBetween(checkIn, checkOut);
    if (nights) cost = Math.round(pricePerNight * nights * 100) / 100;
  }
  const payload = {
    trip_id: tripId,
    area_id: str(formData, "area_id"),
    name: str(formData, "name") ?? "Unterkunft",
    address: str(formData, "address"),
    check_in_date: checkIn,
    check_out_date: checkOut,
    check_in_time: str(formData, "check_in_time"),
    check_out_time: str(formData, "check_out_time"),
    board_level: String(formData.get("board_level") ?? "none"),
    price_per_night: pricePerNight,
    cost,
    currency: String(formData.get("currency") ?? "EUR"),
    latitude: num(formData, "latitude"),
    longitude: num(formData, "longitude"),
    cancellation_policy: str(formData, "cancellation_policy"),
    cancellation_deadline: str(formData, "cancellation_deadline"),
    booking_reference: str(formData, "booking_reference"),
    booking_url: str(formData, "booking_url"),
    notes: str(formData, "notes"),
  };
  if (id) await supabase.from("accommodations").update(payload).eq("id", id);
  else await supabase.from("accommodations").insert(payload);
  await logActivity(
    supabase,
    user.id,
    tripId,
    id ? "accommodation.updated" : "accommodation.created",
    { name: payload.name },
  );
  done(tripId);
}

export async function deleteAccommodation(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = String(formData.get("id"));
  const { data: existing } = await supabase
    .from("accommodations")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("accommodations").delete().eq("id", id);
  await logActivity(supabase, user.id, tripId, "accommodation.deleted", {
    name: existing?.name ?? null,
  });
  done(tripId);
}

/* ---------- Flights ---------- */
export async function saveFlight(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = str(formData, "id");
  const payload = {
    trip_id: tripId,
    airline: str(formData, "airline"),
    flight_number: str(formData, "flight_number"),
    departure_airport: str(formData, "departure_airport"),
    arrival_airport: str(formData, "arrival_airport"),
    departure_time: str(formData, "departure_time"),
    arrival_time: str(formData, "arrival_time"),
    cost: num(formData, "cost"),
    currency: String(formData.get("currency") ?? "EUR"),
    cancellation_policy: str(formData, "cancellation_policy"),
    booking_reference: str(formData, "booking_reference"),
    booking_url: str(formData, "booking_url"),
    notes: str(formData, "notes"),
  };
  if (id) {
    await supabase.from("flights").update(payload).eq("id", id);
  } else {
    await supabase.from("flights").insert(payload);
    // Optional return flight: a second leg with swapped airports, same airline.
    // Only the return departure time is taken from the form; the rest is left
    // for the user to fill in afterwards.
    if (formData.get("add_return") === "on") {
      const returnTime = str(formData, "return_time");
      await supabase.from("flights").insert({
        trip_id: tripId,
        airline: payload.airline,
        flight_number: null,
        departure_airport: payload.arrival_airport,
        arrival_airport: payload.departure_airport,
        departure_time: returnTime,
        arrival_time: null,
        cost: null,
        currency: payload.currency,
        cancellation_policy: null,
        booking_reference: null,
        booking_url: null,
        notes: null,
      });
    }
  }
  const flightLabel =
    [payload.airline, payload.flight_number].filter(Boolean).join(" ") ||
    [payload.departure_airport, payload.arrival_airport]
      .filter(Boolean)
      .join(" → ") ||
    "Flug";
  await logActivity(
    supabase,
    user.id,
    tripId,
    id ? "flight.updated" : "flight.created",
    { name: flightLabel },
  );
  done(tripId);
}

export async function deleteFlight(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = String(formData.get("id"));
  const { data: existing } = await supabase
    .from("flights")
    .select("airline, flight_number")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("flights").delete().eq("id", id);
  const flightLabel =
    [existing?.airline, existing?.flight_number].filter(Boolean).join(" ") ||
    "Flug";
  await logActivity(supabase, user.id, tripId, "flight.deleted", {
    name: flightLabel,
  });
  done(tripId);
}

/* ---------- Travelers ---------- */
export async function saveTraveler(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = str(formData, "id");
  const name = str(formData, "name") ?? "Mitreisende:r";
  const payload = {
    trip_id: tripId,
    name,
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    birth_date: str(formData, "birth_date"),
    notes: str(formData, "notes"),
  };
  if (id) await supabase.from("travelers").update(payload).eq("id", id);
  else await supabase.from("travelers").insert(payload);
  await logActivity(
    supabase,
    user.id,
    tripId,
    id ? "traveler.updated" : "traveler.created",
    { name },
  );
  done(tripId);
}

export async function deleteTraveler(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = String(formData.get("id"));
  const { data: existing } = await supabase
    .from("travelers")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("travelers").delete().eq("id", id);
  await logActivity(supabase, user.id, tripId, "traveler.deleted", {
    name: existing?.name ?? null,
  });
  done(tripId);
}

/* ---------- Members / collaboration ---------- */
export async function inviteMember(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const email = str(formData, "email")?.toLowerCase();
  const role = String(formData.get("role") ?? "editor");
  if (!email) return;

  // If the invitee already has a profile, link directly; otherwise store the
  // invite by email so it is claimed automatically on signup/login.
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  await supabase.from("trip_members").insert({
    trip_id: tripId,
    user_id: existing?.id ?? null,
    invited_email: email,
    role,
    status: existing ? "active" : "invited",
  });
  await logActivity(supabase, user.id, tripId, "member.invited", {
    name: email,
  });
  done(tripId);
}

export async function updateMemberRole(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const role = String(formData.get("role"));
  await supabase
    .from("trip_members")
    .update({ role })
    .eq("id", String(formData.get("id")));
  await logActivity(supabase, user.id, tripId, "member.role_changed", { role });
  done(tripId);
}

export async function removeMember(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = String(formData.get("id"));
  const { data: existing } = await supabase
    .from("trip_members")
    .select("invited_email, profiles(display_name)")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("trip_members").delete().eq("id", id);
  await logActivity(supabase, user.id, tripId, "member.removed", {
    name: existing?.profiles?.display_name ?? existing?.invited_email ?? null,
  });
  done(tripId);
}

/* ---------- Preparation: notes ---------- */
export async function saveNote(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = str(formData, "id");
  const content = sanitizeHtml(String(formData.get("content") ?? ""));
  if (id) {
    await supabase
      .from("trip_notes")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", id);
  } else {
    if (content.trim() === "") return;
    await supabase
      .from("trip_notes")
      .insert({ trip_id: tripId, created_by: user.id, content });
  }
  await logActivity(supabase, user.id, tripId, "note.saved", {});
  done(tripId);
}

export async function deleteNote(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  await supabase.from("trip_notes").delete().eq("id", String(formData.get("id")));
  done(tripId);
}

/* ---------- Preparation: to-dos ---------- */
export async function saveTodo(formData: FormData) {
  const { supabase, user } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = str(formData, "id");
  const payload = {
    trip_id: tripId,
    title: str(formData, "title") ?? "Aufgabe",
    description: str(formData, "description"),
    assigned_to: str(formData, "assigned_to"),
    due_date: str(formData, "due_date"),
  };
  if (id) await supabase.from("trip_todos").update(payload).eq("id", id);
  else await supabase.from("trip_todos").insert({ ...payload, created_by: user.id });
  await logActivity(
    supabase,
    user.id,
    tripId,
    id ? "todo.updated" : "todo.created",
    { name: payload.title },
  );
  done(tripId);
}

export async function toggleTodo(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = String(formData.get("id"));
  const done_ = formData.get("done") === "true";
  await supabase
    .from("trip_todos")
    .update({ done: done_, done_at: done_ ? new Date().toISOString() : null })
    .eq("id", id);
  done(tripId);
  revalidatePath("/todos");
}

export async function deleteTodo(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  await supabase.from("trip_todos").delete().eq("id", String(formData.get("id")));
  done(tripId);
}
