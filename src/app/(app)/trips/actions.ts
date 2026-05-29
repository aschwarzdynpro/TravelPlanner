"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createTrip(formData: FormData) {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const budgetRaw = String(formData.get("budget") ?? "").trim().replace(",", ".");
  const budget = budgetRaw === "" ? null : Number(budgetRaw);

  const { data, error } = await supabase
    .from("trips")
    .insert({
      name,
      kind: String(formData.get("kind") ?? "trip"),
      destination: String(formData.get("destination") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
      cover_color: String(formData.get("cover_color") ?? "#2563eb"),
      budget: budget !== null && Number.isFinite(budget) ? budget : null,
      budget_currency: String(formData.get("budget_currency") ?? "EUR"),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Anlegen fehlgeschlagen");

  revalidatePath("/trips");
  redirect(`/trips/${data.id}`);
}

export async function deleteTrip(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  await supabase.from("trips").delete().eq("id", id);
  revalidatePath("/trips");
  redirect("/trips");
}

export async function setTripVisibility(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  const isPublic = formData.get("is_public") === "true";
  await supabase.from("trips").update({ is_public: isPublic }).eq("id", id);
  revalidatePath(`/trips/${id}`);
}

// Re-Travel: deep-clone an existing trip (areas, accommodations, flights, travelers)
// for the current user, optionally shifting dates to a new start date.
export async function reTravel(formData: FormData) {
  const { supabase, user } = await requireUser();
  const sourceId = String(formData.get("source_id"));
  const newName = String(formData.get("name") ?? "").trim();

  const { data: source } = await supabase
    .from("trips")
    .select("*")
    .eq("id", sourceId)
    .single();
  if (!source) throw new Error("Quell-Reise nicht gefunden");

  const { data: newTrip, error } = await supabase
    .from("trips")
    .insert({
      name: newName || `${source.name} (Kopie)`,
      kind: source.kind,
      destination: source.destination,
      description: source.description,
      cover_color: source.cover_color,
      budget: source.budget,
      budget_currency: source.budget_currency,
      source_trip_id: source.id,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error || !newTrip) throw new Error(error?.message ?? "Klonen fehlgeschlagen");

  // Clone areas and keep an old->new id map for accommodation re-linking.
  const { data: areas } = await supabase
    .from("areas")
    .select("*")
    .eq("trip_id", sourceId);
  const areaMap = new Map<string, string>();
  if (areas?.length) {
    for (const a of areas) {
      const { data: newArea } = await supabase
        .from("areas")
        .insert({
          trip_id: newTrip.id,
          name: a.name,
          region: a.region,
          description: a.description,
          latitude: a.latitude,
          longitude: a.longitude,
          sort_order: a.sort_order,
        })
        .select("id")
        .single();
      if (newArea) areaMap.set(a.id, newArea.id);
    }
  }

  const { data: accommodations } = await supabase
    .from("accommodations")
    .select("*")
    .eq("trip_id", sourceId);
  if (accommodations?.length) {
    await supabase.from("accommodations").insert(
      accommodations.map((a) => ({
        trip_id: newTrip.id,
        area_id: a.area_id ? areaMap.get(a.area_id) ?? null : null,
        name: a.name,
        address: a.address,
        latitude: a.latitude,
        longitude: a.longitude,
        check_in_time: a.check_in_time,
        check_out_time: a.check_out_time,
        board_level: a.board_level,
        price_per_night: a.price_per_night,
        cost: a.cost,
        currency: a.currency,
        cancellation_policy: a.cancellation_policy,
        booking_reference: a.booking_reference,
        booking_url: a.booking_url,
        notes: a.notes,
      })),
    );
  }

  const { data: travelers } = await supabase
    .from("travelers")
    .select("*")
    .eq("trip_id", sourceId);
  if (travelers?.length) {
    await supabase.from("travelers").insert(
      travelers.map((t) => ({
        trip_id: newTrip.id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        linked_user_id: t.linked_user_id,
        notes: t.notes,
      })),
    );
  }

  revalidatePath("/trips");
  redirect(`/trips/${newTrip.id}`);
}
