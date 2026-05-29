"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };
type NavEntry =
  | { type: "link"; href: string; label: string; icon: string }
  | { type: "group"; label: string; icon: string; base: string; children: NavItem[] };

const NAV: NavEntry[] = [
  { type: "link", href: "/dashboard", label: "Dashboard", icon: "📊" },
  {
    type: "group",
    label: "Reisen",
    icon: "🧳",
    base: "/trips",
    children: [
      { href: "/trips", label: "Meine Reisen" },
      { href: "/trips/shared", label: "Geteilte Reisen" },
      { href: "/trips/following", label: "Follow-Up Reisen" },
    ],
  },
  { type: "link", href: "/activity", label: "Aktivität", icon: "🔔" },
  { type: "link", href: "/help", label: "Hilfe", icon: "❓" },
  {
    type: "group",
    label: "Account",
    icon: "⚙️",
    base: "/account",
    children: [
      { href: "/account/security", label: "Sicherheit" },
      { href: "/account/general", label: "Allgemeine Informationen" },
    ],
  },
];

// "Meine Reisen" (/trips) also owns trip-detail pages (/trips/<id>), but not
// the sibling sub-pages.
function isChildActive(href: string, pathname: string): boolean {
  if (href === "/trips") {
    if (pathname === "/trips") return true;
    return (
      pathname.startsWith("/trips/") &&
      pathname !== "/trips/shared" &&
      pathname !== "/trips/following"
    );
  }
  return pathname === href;
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2 px-4 py-4 font-bold"
      >
        <span className="text-xl">✈️</span>
        <span>TravelPlanner</span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {NAV.map((entry) => {
          if (entry.type === "link") {
            const active = pathname === entry.href;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--primary)] text-white"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span className="w-5 text-center">{entry.icon}</span>
                {entry.label}
              </Link>
            );
          }
          return (
            <div key={entry.label} className="pt-2">
              <div className="flex items-center gap-2.5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <span className="w-5 text-center">{entry.icon}</span>
                {entry.label}
              </div>
              <div className="mt-0.5 space-y-0.5">
                {entry.children.map((c) => {
                  const active = isChildActive(c.href, pathname);
                  return (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={onNavigate}
                      className={`block rounded-lg py-2 pl-10 pr-3 text-sm transition ${
                        active
                          ? "bg-[var(--primary)] text-white"
                          : "text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
