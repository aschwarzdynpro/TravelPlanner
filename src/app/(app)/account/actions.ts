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
