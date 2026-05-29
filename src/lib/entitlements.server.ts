import { createClient } from "@/lib/supabase/server";
import { can, isPro, type Feature, type PlanHolder } from "@/lib/entitlements";

// Server-side entitlement checks. UI gating is only comfort — these are the
// real enforcement to call from Server Actions / route handlers before running
// a Pro-only operation.

/** Load the current user's plan fields, or null if signed out. */
export async function currentPlan(): Promise<PlanHolder | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("plan, plan_until")
    .eq("id", user.id)
    .maybeSingle();
  return data ?? null;
}

/** Throws unless the signed-in user may use the given Pro feature. */
export async function assertCan(feature: Feature): Promise<void> {
  const holder = await currentPlan();
  if (!can(holder, feature)) {
    throw new Error("PRO_REQUIRED");
  }
}

/** Throws unless the signed-in user has an active Pro plan. */
export async function requirePro(): Promise<void> {
  const holder = await currentPlan();
  if (!isPro(holder)) {
    throw new Error("PRO_REQUIRED");
  }
}
