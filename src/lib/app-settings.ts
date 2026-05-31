import { createClient } from "@/lib/supabase/server";

// Global app settings (admin-controlled feature flags). Stored in the
// app_settings table (key -> jsonb). World-readable; only admins can write.

export type AppSettings = {
  // Whether the "Drucken / PDF" button is shown in the trip workspace.
  showPrintPdf: boolean;
};

const DEFAULTS: AppSettings = {
  showPrintPdf: false,
};

// Load all known settings, falling back to defaults for any that are missing.
export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("key, value");
  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  return {
    showPrintPdf: (map.get("show_print_pdf") as boolean | null) ?? DEFAULTS.showPrintPdf,
  };
}

// Whether the current user is an admin (server-side check via the is_admin RPC).
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.rpc("is_admin");
  return data === true;
}
