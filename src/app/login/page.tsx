"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleOAuth(provider: "google") {
    setError(null);
    setOauthLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    // On success the browser is redirected to the provider, so we only reach
    // here on error.
    if (error) {
      setOauthLoading(null);
      setError(error.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name || email.split("@")[0] },
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      setLoading(false);
      if (error) return setError(error.message);
      if (data.session) {
        await supabase.rpc("claim_invites");
        router.push(redirect);
        router.refresh();
      } else {
        setInfo(
          "Fast geschafft! Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.",
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) return setError(error.message);
      await supabase.rpc("claim_invites");
      router.push(redirect);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-3xl font-bold tracking-tight">✈️ TravelPlanner</div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Reisen & Events gemeinsam planen
          </p>
        </div>

        <div className="card p-6">
          <div className="mb-4 space-y-2">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={oauthLoading !== null}
              className="btn-ghost w-full"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {oauthLoading === "google" ? "Weiterleiten…" : "Mit Google fortfahren"}
            </button>
          </div>

          <div className="mb-4 flex items-center gap-3 text-xs text-[var(--muted)]">
            <span className="h-px flex-1 bg-[var(--border)]" />
            oder mit E-Mail
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-md py-1.5 text-sm font-medium transition ${
                mode === "signin" ? "bg-[var(--surface)] shadow" : "text-[var(--muted)]"
              }`}
            >
              Anmelden
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-md py-1.5 text-sm font-medium transition ${
                mode === "signup" ? "bg-[var(--surface)] shadow" : "text-[var(--muted)]"
              }`}
            >
              Registrieren
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Wie heißt du?"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="label">E-Mail</label>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="du@beispiel.de"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Passwort</label>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                {info}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading
                ? "Bitte warten…"
                : mode === "signup"
                  ? "Konto erstellen"
                  : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-pulse">
        <div className="mb-8 text-center">
          <div className="text-3xl font-bold tracking-tight">✈️ TravelPlanner</div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Reisen & Events gemeinsam planen
          </p>
        </div>
        <div className="card space-y-4 p-6">
          <div className="h-10 rounded-lg bg-black/5 dark:bg-white/10" />
          <div className="h-4 w-24 mx-auto rounded bg-black/5 dark:bg-white/10" />
          <div className="h-9 rounded-lg bg-black/5 dark:bg-white/10" />
          <div className="space-y-2">
            <div className="h-10 rounded-lg bg-black/5 dark:bg-white/10" />
            <div className="h-10 rounded-lg bg-black/5 dark:bg-white/10" />
          </div>
          <div className="h-10 rounded-lg bg-black/5 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
