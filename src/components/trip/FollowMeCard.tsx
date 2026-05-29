"use client";

import { useEffect, useState, useTransition } from "react";
import type { Trip } from "./types";
import { setTripVisibility } from "@/app/(app)/trips/actions";
import { Share2, Check, Copy } from "@/components/icons";

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
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={trip.is_public}
              disabled={pending}
              onChange={(e) => toggle(e.target.checked)}
            />
            <span className="relative h-6 w-11 rounded-full bg-black/20 transition peer-checked:bg-[var(--primary)] dark:bg-white/20">
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
            </span>
          </label>
        )}
      </div>

      {trip.is_public ? (
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
