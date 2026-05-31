import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TripWorkspace from "@/components/trip/TripWorkspace";
import { isPro as isProPlan } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!trip) notFound();

  const [
    { data: areas },
    { data: accommodations },
    { data: flights },
    { data: travelers },
    { data: members },
    { data: activity },
    { data: notes },
    { data: todos },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("areas")
      .select("*")
      .eq("trip_id", id)
      .order("sort_order")
      .order("created_at"),
    supabase
      .from("accommodations")
      .select("*")
      .eq("trip_id", id)
      .order("check_in_date", { nullsFirst: false }),
    supabase
      .from("flights")
      .select("*")
      .eq("trip_id", id)
      .order("departure_time", { nullsFirst: false }),
    supabase.from("travelers").select("*").eq("trip_id", id).order("name"),
    supabase
      .from("trip_members")
      .select("*, profiles(display_name, email, avatar_url)")
      .eq("trip_id", id)
      .order("created_at"),
    supabase
      .from("trip_activity")
      .select("*, profiles(display_name, email)")
      .eq("trip_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("trip_notes")
      .select("*")
      .eq("trip_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("trip_todos")
      .select("*, assignee:profiles!trip_todos_assigned_to_fkey(display_name, email)")
      .eq("trip_id", id)
      .order("done")
      .order("due_date", { nullsFirst: false })
      .order("created_at"),
    user
      ? supabase
          .from("profiles")
          .select("plan, plan_until, show_area_maps")
          .eq("id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const myMembership = (members ?? []).find((m) => m.user_id === user?.id);
  const canEdit =
    trip.created_by === user?.id ||
    myMembership?.role === "owner" ||
    myMembership?.role === "editor";
  const isOwner = trip.created_by === user?.id || myMembership?.role === "owner";

  return (
    <TripWorkspace
      trip={trip}
      areas={areas ?? []}
      accommodations={accommodations ?? []}
      flights={flights ?? []}
      travelers={travelers ?? []}
      members={members ?? []}
      activity={activity ?? []}
      notes={notes ?? []}
      todos={todos ?? []}
      canEdit={canEdit}
      isOwner={isOwner}
      currentUserId={user?.id ?? ""}
      isPro={isProPlan(profile)}
      showAreaMaps={profile?.show_area_maps ?? true}
    />
  );
}
