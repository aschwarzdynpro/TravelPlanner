"use client";

import { useEffect, useState, useTransition } from "react";
import type { Trip } from "./types";
import { setTripVisibility, setShareLevel } from "@/app/(app)/trips/actions";
import { Share2, Check, Copy } from "@/components/icons";

const SHARE_LEVELS: { value: string; label: string; hint: string }[] = [
  { value: "basic", label: "Nur Zeiten & Gegenden", hint: "Zeitraum und Gegenden" },
  {
    value: "plus",
    label: "+ Hotels & Flüge",
    hint: "zusätzlich Unterkünfte und Flüge (ohne Kosten)",
  },
  {
    value: "full",
    label: "+ Budget & Kosten",
    hint: "zusätzlich Budget, Preise und Kosten",
  },
];

export default function FollowMeCard({
  trip,
  canManage,
}: {
  trip: Trip;
  canManage: boolean;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [level, setLevel] = useState(trip.share_level ?? "full");
  const [levelPending, startLevel] = useTransition();

  function chooseLevel(next: string) {
    setLevel(next);
    const fd = new FormData();
    fd.set("id", trip.id);
    fd.set("share_level", next);
    startLevel(() => setShareLevel(fd));
  }

  // Read the origin only after mount to avoid an SSR/CSR hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOrigin(window.location.origin), []);
  const link = `${origin}/follow/${trip.share_token}`;

  function toggle(next: boolean) {
    const fd = new FormData();
    fd.set("id", trip.id);
    fd.set("is_public", String(next));
    startTransition(() => setTripVisibility(fd));
  }

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <Share2 className="h-4 w-4" strokeWidth={2} />
            Follow Me
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Teile einen schreibgeschützten Link, mit dem andere die Reiseplanung
            live verfolgen können – ganz ohne Konto.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            role="switch"
            aria-checked={trip.is_public}
            aria-label="Follow-Me-Link aktivieren"
            disabled={pending}
            onClick={() => toggle(!trip.is_public)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition disabled:opacity-60 ${
              trip.is_public
                ? "bg-[var(--primary)]"
                : "bg-black/20 dark:bg-white/20"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
                trip.is_public ? "translate-x-5" : ""
              }`}
            />
          </button>
        )}
      </div>

      {trip.is_public ? (
        <>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={link} className="input font-mono text-xs" />
            <button onClick={copy} className="btn-ghost shrink-0">
              {copied ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={2} />
                  Kopiert
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" strokeWidth={2} />
                  Link kopieren
                </>
              )}
            </button>
          </div>

          {canManage && (
            <div className="mt-4">
              <div className="mb-1.5 text-xs font-medium text-[var(--muted)]">
                Sichtbar für Empfänger
              </div>
              <div className="inline-flex flex-col gap-1 rounded-lg border bg-[var(--surface)] p-1 sm:flex-row">
                {SHARE_LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => chooseLevel(l.value)}
                    disabled={levelPending}
                    title={l.hint}
                    className={`rounded-md px-3 py-1.5 text-left text-sm font-medium transition disabled:opacity-60 ${
                      level === l.value
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                {SHARE_LEVELS.find((l) => l.value === level)?.hint}. Empfänger
                sehen ausschließlich diese Inhalte.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {canManage
            ? "Aktiviere den Schalter, um einen öffentlichen Follow-Me-Link zu erzeugen."
            : "Der öffentliche Link ist derzeit deaktiviert."}
        </p>
      )}
    </div>
  );
}
