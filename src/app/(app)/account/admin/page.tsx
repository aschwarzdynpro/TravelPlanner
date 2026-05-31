import { notFound } from "next/navigation";
import { Printer, ShieldCheck } from "@/components/icons";
import { isCurrentUserAdmin, getAppSettings } from "@/lib/app-settings";
import AppSettingToggle from "@/components/account/AppSettingToggle";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Hard gate: non-admins get a 404 (page doesn't exist for them).
  if (!(await isCurrentUserAdmin())) notFound();

  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="h-6 w-6" strokeWidth={2} />
          Admin
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Globale Schalter für die App. Gilt für alle Nutzer.
        </p>
      </div>

      <div className="card divide-y">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/5 text-[var(--muted)] dark:bg-white/10">
              <Printer className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <div className="font-medium">
                &bdquo;Drucken / PDF&ldquo; anzeigen
              </div>
              <p className="text-sm text-[var(--muted)]">
                Blendet den Drucken/PDF-Button in der Reiseansicht ein. Aktuell
                global ausgeblendet; die Druckseite bleibt per Link erreichbar.
              </p>
            </div>
          </div>
          <AppSettingToggle
            settingKey="show_print_pdf"
            initial={settings.showPrintPdf}
          />
        </div>
      </div>
    </div>
  );
}
