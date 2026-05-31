import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/nav/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, theme, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name || user.email?.split("@")[0] || "Reisender";
  const theme = (profile?.theme ?? "system") as "system" | "light" | "dark";

  return (
    <AppShell
      displayName={displayName}
      email={user.email ?? ""}
      theme={theme}
      isAdmin={profile?.is_admin ?? false}
    >
      {children}
    </AppShell>
  );
}
