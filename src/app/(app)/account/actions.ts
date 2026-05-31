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

// Admin: set a global app setting. RLS (app_settings_write) already restricts
// writes to admins; we additionally verify here so a non-admin gets a clear
// no-op rather than a silent RLS rejection.
export async function setAppSetting(key: string, value: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: admin } = await supabase.rpc("is_admin");
  if (admin !== true) return;
  await supabase
    .from("app_settings")
    .upsert(
      { key, value, updated_at: new Date().toISOString(), updated_by: user.id },
      { onConflict: "key" },
    );
  revalidatePath("/account/admin");
  // Trip pages read this flag, so refresh them too.
  revalidatePath("/trips", "layout");
}
