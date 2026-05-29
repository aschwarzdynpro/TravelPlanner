"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { initials } from "@/lib/format";

const LINKS = [
  { href: "/trips", label: "Reisen", icon: "🧳" },
  { href: "/members", label: "Member-Bereich", icon: "👥" },
];

export default function NavBar({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b bg-[var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/trips" className="flex items-center gap-2 font-bold">
          <span className="text-xl">✈️</span>
          <span className="hidden sm:inline">TravelPlanner</span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--primary)] text-white"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span className="sm:hidden">{l.icon}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium leading-tight">{displayName}</div>
            <div className="text-xs text-[var(--muted)] leading-tight">{email}</div>
          </div>
          <div
            className="grid h-9 w-9 place-items-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white"
            title={displayName}
          >
            {initials(displayName)}
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="btn-ghost px-2 py-1.5 text-sm"
              title="Abmelden"
            >
              ⏻
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
