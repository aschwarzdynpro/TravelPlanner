import { createClient } from "@/lib/supabase/server";
import { MapIcon } from "@/components/icons";
import AreaMapsToggle from "@/components/account/AreaMapsToggle";

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("show_area_maps")
    .eq("id", user!.id)
    .maybeSingle();

  const showAreaMaps = profile?.show_area_maps ?? true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-sm text-[var(--muted)]">
          Anzeige-Vorgaben für deine Reiseansicht.
        </p>
      </div>

      <div className="card divide-y">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/5 text-[var(--muted)] dark:bg-white/10">
              <MapIcon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <div className="font-medium">Kartenvorschauen bei Gegenden</div>
              <p className="text-sm text-[var(--muted)]">
                Zeigt eine eingebettete Karte je Gegend im Reise-Tab
                &bdquo;Unterkünfte&ldquo;. Ausschalten räumt die Ansicht auf und
                lädt keine externen Karten.
              </p>
            </div>
          </div>
          <AreaMapsToggle initial={showAreaMaps} />
        </div>
      </div>
    </div>
  );
}
