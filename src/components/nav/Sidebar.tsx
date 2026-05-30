"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Luggage,
  Bell,
  CircleHelp,
  Settings,
  Plane,
  ClipboardList,
  TrendingUp,
  type LucideIcon,
} from "@/components/icons";

type NavItem = { href: string; label: string };
type NavEntry =
  | { type: "link"; href: string; label: string; icon: LucideIcon }
  | { type: "group"; label: string; icon: LucideIcon; base: string; children: NavItem[] };

const NAV: NavEntry[] = [
  { type: "link", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    type: "group",
    label: "Reisen",
    icon: Luggage,
    base: "/trips",
    children: [
      { href: "/trips", label: "Meine Reisen" },
      { href: "/trips/shared", label: "Geteilte Reisen" },
      { href: "/trips/following", label: "Follow-Up Reisen" },
    ],
  },
  { type: "link", href: "/todos", label: "Meine Aufgaben", icon: ClipboardList },
  { type: "link", href: "/insights", label: "Auswertungen", icon: TrendingUp },
  { type: "link", href: "/activity", label: "Feed", icon: Bell },
  { type: "link", href: "/help", label: "Hilfe", icon: CircleHelp },
  {
    type: "group",
    label: "Account",
    icon: Settings,
    base: "/account",
    children: [
      { href: "/account/general", label: "Allgemein" },
      { href: "/account/plan", label: "Abo" },
      { href: "/account/security", label: "Sicherheit" },
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
        className="flex items-center gap-2 px-4 py-4 font-bold tracking-tight"
      >
        <Plane className="h-5 w-5" strokeWidth={2} />
        <span>TravelPlanner</span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {NAV.map((entry) => {
          if (entry.type === "link") {
            const active = pathname === entry.href;
            const Icon = entry.icon;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                {entry.label}
              </Link>
            );
          }
          const Icon = entry.icon;
          return (
            <div key={entry.label} className="pt-2">
              <div className="flex items-center gap-2.5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
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
                      className={`block rounded-lg py-2 pl-9 pr-3 text-sm transition ${
                        active
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
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
