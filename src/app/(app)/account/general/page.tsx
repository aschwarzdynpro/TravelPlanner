import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "../actions";
import ReTravelButton from "@/components/trip/ReTravelButton";
import { MEMBER_ROLES, TRIP_KINDS } from "@/lib/constants";
import { formatDateRange, initials } from "@/lib/format";
import { Users, Share2, ArrowRight } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AccountGeneralPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user!.id)
    .maybeSingle();

  const { data: memberships } = await supabase
    .from("trip_members")
    .select("role, status, trips(*)")
    .order("created_at", { ascending: false });

  const rows = (memberships ?? []).filter((m) => m.trips);
  const owned = rows.filter((m) => m.role === "owner");
  const collaborating = rows.filter(
    (m) => m.role !== "owner" && m.status === "active",
  );
  const shared = rows.filter((m) => m.trips!.is_public);

  const displayName = profile?.display_name || user!.email?.split("@")[0] || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Allgemeine Informationen</h1>
        <p className="text-sm text-[var(--muted)]">
          Dein Profil, deine Kollaborationen und Reise-Features an einem Ort.
        </p>
      </div>

      {/* Profile */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--primary)] text-lg font-semibold text-[var(--primary-foreground)]">
            {initials(displayName)}
          </div>
          <div>
            <div className="font-semibold">{displayName}</div>
            <div className="text-sm text-[var(--muted)]">{user!.email}</div>
          </div>
        </div>
        <form action={updateProfile} className="flex flex-col gap-2 sm:flex-row">
          <input
            name="display_name"
            className="input"
            defaultValue={displayName}
            placeholder="Anzeigename"
          />
          <button type="submit" className="btn-primary shrink-0">
            Profil speichern
          </button>
        </form>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Dein Passwort änderst du unter{" "}
          <Link href="/account/security" className="font-medium underline hover:no-underline">
            Account → Sicherheit
          </Link>
          .
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{owned.length}</div>
          <div className="text-xs text-[var(--muted)]">Eigene Reisen</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{collaborating.length}</div>
          <div className="text-xs text-[var(--muted)]">Kollaborationen</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{shared.length}</div>
          <div className="text-xs text-[var(--muted)]">Follow-Me aktiv</div>
        </div>
      </div>

      {/* Collaboration list with quick features */}
      <div className="card overflow-hidden">
        <div className="border-b px-5 py-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <Users className="h-4 w-4" strokeWidth={2} />
            Collaboration & Features
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Schnellzugriff auf Re-Travel und den Follow-Me-Status jeder Reise.
          </p>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--muted)]">
            Du bist noch an keiner Reise beteiligt.{" "}
            <Link
              href="/trips"
              className="inline-flex items-center gap-1 font-medium underline hover:no-underline"
            >
              Erste Reise anlegen
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </p>
        ) : (
          <ul className="divide-y">
            {rows.map((m) => {
              const t = m.trips!;
              return (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3"
                >
                  <span
                    className="h-9 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: t.cover_color ?? "#18181b" }}
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/trips/${t.id}`}
                      className="font-medium hover:text-[var(--muted)]"
                    >
                      {t.name}
                    </Link>
                    <div className="text-xs text-[var(--muted)]">
                      {TRIP_KINDS[t.kind] ?? t.kind} ·{" "}
                      {formatDateRange(t.start_date, t.end_date)}
                    </div>
                  </div>
                  <span className="chip bg-black/5 dark:bg-white/10">
                    {MEMBER_ROLES[m.role] ?? m.role}
                  </span>
                  {t.is_public && (
                    <span className="chip bg-black/5 text-[var(--muted)] dark:bg-white/10">
                      <Share2 className="h-3 w-3" strokeWidth={2} />
                      Follow-Me
                    </span>
                  )}
                  {m.status === "invited" && (
                    <span className="chip bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      eingeladen
                    </span>
                  )}
                  <ReTravelButton
                    trip={t}
                    className="text-xs font-medium hover:underline"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
