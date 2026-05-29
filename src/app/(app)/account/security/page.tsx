import { createClient } from "@/lib/supabase/server";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountSecurityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const provider = user?.app_metadata?.provider ?? "email";
  const isOAuth = provider !== "email";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sicherheit</h1>
        <p className="text-sm text-[var(--muted)]">
          Verwalte dein Passwort und sieh, wie du angemeldet bist.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="mb-1 font-semibold">Anmeldung</h2>
        <p className="text-sm text-[var(--muted)]">
          Du bist angemeldet als <strong>{user?.email}</strong>
          {isOAuth ? (
            <>
              {" "}
              über <strong>{provider}</strong>.
            </>
          ) : (
            <> mit E-Mail und Passwort.</>
          )}
        </p>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-semibold">Passwort ändern</h2>
        {isOAuth && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            Du hast dich über {provider} angemeldet. Du kannst hier zusätzlich ein
            Passwort setzen, um dich künftig auch per E-Mail anzumelden.
          </p>
        )}
        <ChangePasswordForm />
      </div>
    </div>
  );
}
