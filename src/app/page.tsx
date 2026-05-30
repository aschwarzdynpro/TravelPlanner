import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Plane,
  Hotel,
  MapPin,
  Wallet,
  ClipboardList,
  Bell,
  Share2,
  ArrowRight,
  type LucideIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Plane,
    title: "Flüge & Unterkünfte",
    text: "Erfasse Flüge, Hotels und Gegenden mit Zeiten, Kosten und Buchungslinks – alles an einem Ort.",
  },
  {
    icon: MapPin,
    title: "Interaktive Karte",
    text: "Sieh deine Reise auf einer Karte. Koordinaten findest du automatisch per Ortssuche.",
  },
  {
    icon: Wallet,
    title: "Budget im Blick",
    text: "Setze ein Budget, verfolge die Kosten pro Person und werde bei Überschreitung gewarnt.",
  },
  {
    icon: ClipboardList,
    title: "Vorbereitung & Aufgaben",
    text: "Checklisten mit Zuweisung und Fälligkeit sowie gemeinsame Notizen für jede Reise.",
  },
  {
    icon: Bell,
    title: "Gemeinsam & live",
    text: "Lade Mitreisende ein und seht Änderungen in Echtzeit im Aktivitäts-Feed.",
  },
  {
    icon: Share2,
    title: "Teilen & exportieren",
    text: "Teile eine schreibgeschützte Live-Ansicht, drucke als PDF oder exportiere als Kalender.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2 font-bold tracking-tight">
          <Plane className="h-5 w-5" strokeWidth={2} />
          TravelPlanner
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
          >
            Anmelden
          </Link>
          <Link
            href="/login?mode=signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-85"
          >
            Registrieren
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10 text-center sm:pt-16">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Reisen & Events gemeinsam planen
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--muted)] sm:text-lg">
          Flüge, Unterkünfte, Budget, Aufgaben und Mitreisende – übersichtlich an
          einem Ort. Plant zusammen, in Echtzeit, auf jedem Gerät.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login?mode=signup"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-85"
          >
            Kostenlos starten
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:border-[var(--ring)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            Anmelden
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-black/5 dark:bg-white/10">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="card flex flex-col items-center gap-4 px-6 py-12 text-center">
          <Hotel className="h-9 w-9 text-[var(--muted)]" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold">Bereit für die nächste Reise?</h2>
          <p className="max-w-md text-sm text-[var(--muted)]">
            Erstelle dein kostenloses Konto und plane in wenigen Minuten deine
            erste Reise – allein oder im Team.
          </p>
          <Link
            href="/login?mode=signup"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-85"
          >
            Jetzt registrieren
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-[var(--muted)] sm:flex-row">
          <span className="flex items-center gap-1.5">
            <Plane className="h-4 w-4" strokeWidth={2} />
            TravelPlanner
          </span>
          <span>Reisen & Events gemeinsam planen</span>
        </div>
      </footer>
    </div>
  );
}
