"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

/* ---------- Trip ---------- */
export async function updateTrip(formData: FormData) {
  const { supabase } = await db();
  const id = String(formData.get("id"));
  await supabase
    .from("trips")
    .update({
      name: str(formData, "name") ?? "Unbenannt",
      kind: String(formData.get("kind") ?? "trip"),
      destination: str(formData, "destination"),
      description: str(formData, "description"),
      start_date: str(formData, "start_date"),
      end_date: str(formData, "end_date"),
      cover_color: String(formData.get("cover_color") ?? "#2563eb"),
    })
    .eq("id", id);
  done(id);
}

/* ---------- Areas ---------- */
export async function saveArea(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = str(formData, "id");
  const payload = {
    trip_id: tripId,
    name: str(formData, "name") ?? "Neue Gegend",
    region: str(formData, "region"),
    description: str(formData, "description"),
    arrival_date: str(formData, "arrival_date"),
    departure_date: str(formData, "departure_date"),
  };
  if (id) await supabase.from("areas").update(payload).eq("id", id);
  else await supabase.from("areas").insert(payload);
  done(tripId);
}

export async function deleteArea(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  await supabase.from("areas").delete().eq("id", String(formData.get("id")));
  done(tripId);
}

/* ---------- Accommodations ---------- */
export async function saveAccommodation(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = str(formData, "id");
  const payload = {
    trip_id: tripId,
    area_id: str(formData, "area_id"),
    name: str(formData, "name") ?? "Unterkunft",
    address: str(formData, "address"),
    check_in_date: str(formData, "check_in_date"),
    check_out_date: str(formData, "check_out_date"),
    check_in_time: str(formData, "check_in_time"),
    check_out_time: str(formData, "check_out_time"),
    board_level: String(formData.get("board_level") ?? "none"),
    cost: num(formData, "cost"),
    currency: String(formData.get("currency") ?? "EUR"),
    cancellation_policy: str(formData, "cancellation_policy"),
    cancellation_deadline: str(formData, "cancellation_deadline"),
    booking_reference: str(formData, "booking_reference"),
    booking_url: str(formData, "booking_url"),
    notes: str(formData, "notes"),
  };
  if (id) await supabase.from("accommodations").update(payload).eq("id", id);
  else await supabase.from("accommodations").insert(payload);
  done(tripId);
}

export async function deleteAccommodation(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  await supabase
    .from("accommodations")
    .delete()
    .eq("id", String(formData.get("id")));
  done(tripId);
}

/* ---------- Flights ---------- */
export async function saveFlight(formData: FormData) {
  const { supabase } = await db();
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
  if (id) await supabase.from("flights").update(payload).eq("id", id);
  else await supabase.from("flights").insert(payload);
  done(tripId);
}

export async function deleteFlight(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  await supabase.from("flights").delete().eq("id", String(formData.get("id")));
  done(tripId);
}

/* ---------- Travelers ---------- */
export async function saveTraveler(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  const id = str(formData, "id");
  const payload = {
    trip_id: tripId,
    name: str(formData, "name") ?? "Mitreisende:r",
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    notes: str(formData, "notes"),
  };
  if (id) await supabase.from("travelers").update(payload).eq("id", id);
  else await supabase.from("travelers").insert(payload);
  done(tripId);
}

export async function deleteTraveler(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  await supabase.from("travelers").delete().eq("id", String(formData.get("id")));
  done(tripId);
}

/* ---------- Members / collaboration ---------- */
export async function inviteMember(formData: FormData) {
  const { supabase } = await db();
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
  done(tripId);
}

export async function updateMemberRole(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  await supabase
    .from("trip_members")
    .update({ role: String(formData.get("role")) })
    .eq("id", String(formData.get("id")));
  done(tripId);
}

export async function removeMember(formData: FormData) {
  const { supabase } = await db();
  const tripId = String(formData.get("trip_id"));
  await supabase
    .from("trip_members")
    .delete()
    .eq("id", String(formData.get("id")));
  done(tripId);
}
