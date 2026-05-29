import { createClient } from "@/lib/supabase/server";
import { isPro, planOf, PRO_FEATURES, featureMeta } from "@/lib/entitlements";
import ProBadge from "@/components/billing/ProBadge";
import { Sparkles, Check } from "@/components/icons";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountPlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_until")
    .eq("id", user!.id)
    .maybeSingle();

  const pro = isPro(profile);
  const plan = planOf(profile);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Abo</h1>
        <p className="text-sm text-[var(--muted)]">
          Dein Tarif und die geplanten Pro-Funktionen.
        </p>
      </div>

      {/* Current plan */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Aktueller Tarif</h2>
            <p className="text-sm text-[var(--muted)]">
              {pro
                ? "Du nutzt TravelPlanner Pro."
                : "Du nutzt den kostenlosen Tarif."}
              {pro && profile?.plan_until && (
                <> Gültig bis {formatDate(profile.plan_until)}.</>
              )}
            </p>
          </div>
          {pro ? (
            <ProBadge />
          ) : (
            <span className="chip bg-black/5 text-[var(--muted)] dark:bg-white/10">
              Free
            </span>
          )}
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          {plan === "free"
            ? "Alle bisherigen Funktionen bleiben kostenlos. Pro schaltet künftig zusätzliche, KI-gestützte Funktionen frei."
            : "Danke für deine Unterstützung – Pro-Funktionen werden nach und nach freigeschaltet."}
        </p>
      </div>

      {/* Planned Pro features */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b px-5 py-3">
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          <h2 className="font-semibold">Pro-Funktionen</h2>
        </div>
        <ul className="divide-y">
          {PRO_FEATURES.map((key) => {
            const meta = featureMeta(key);
            return (
              <li key={key} className="flex items-start gap-3 px-5 py-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/5 text-[var(--muted)] dark:bg-white/10">
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{meta.title}</span>
                    {meta.available ? (
                      <span className="chip bg-black/5 text-[var(--muted)] dark:bg-white/10">
                        <Check className="h-3 w-3" strokeWidth={2} />
                        verfügbar
                      </span>
                    ) : (
                      <span className="chip bg-black/5 text-[var(--muted)] dark:bg-white/10">
                        kommt bald
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {meta.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t px-5 py-3 text-xs text-[var(--muted)]">
          Eine Bezahlung ist noch nicht möglich – diese Funktionen sind in
          Vorbereitung. Du wirst informiert, sobald Pro startet.
        </div>
      </div>
    </div>
  );
}
