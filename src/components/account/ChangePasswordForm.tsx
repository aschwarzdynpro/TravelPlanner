"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 6) {
      return setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
    }
    if (password !== confirm) {
      return setError("Die Passwörter stimmen nicht überein.");
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) return setError(error.message);
    setPassword("");
    setConfirm("");
    setInfo("Passwort erfolgreich aktualisiert.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Neues Passwort</label>
        <input
          className="input"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="label">Passwort bestätigen</label>
        <input
          className="input"
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
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

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Speichern…" : "Passwort ändern"}
      </button>
    </form>
  );
}
