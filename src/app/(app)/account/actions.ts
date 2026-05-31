"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayName = String(formData.get("display_name") ?? "").trim();
  await supabase
    .from("profiles")
    .update({ display_name: displayName || null })
    .eq("id", user.id);

  revalidatePath("/account/general");
  revalidatePath("/trips");
}

const THEMES = ["system", "light", "dark"] as const;
type Theme = (typeof THEMES)[number];

// Persist the chosen theme to the user's profile (so it follows them across
// devices). Called from the client toggle; localStorage is updated there for
// signed-out / pre-hydration use. Returns silently for unknown values.
export async function updateTheme(theme: string) {
  if (!THEMES.includes(theme as Theme)) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ theme }).eq("id", user.id);
}

// Toggle whether embedded area-map previews are shown on the trip workspace.
export async function setShowAreaMaps(value: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("profiles")
    .update({ show_area_maps: value })
    .eq("id", user.id);
  revalidatePath("/account/settings");
}
