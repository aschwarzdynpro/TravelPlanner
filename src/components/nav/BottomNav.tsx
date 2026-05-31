"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Luggage,
  TrendingUp,
  ClipboardList,
  User,
  type LucideIcon,
} from "@/components/icons";

type Item = { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean };

// Five core destinations for the mobile bottom bar (like Komoot/adidas/IG).
// Secondary areas (shared/following trips, feed, help, account sub-pages) stay
// reachable via the header menu / sidebar.
const ITEMS: Item[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: LayoutDashboard,
    match: (p) => p === "/dashboard",
  },
  {
    href: "/trips",
    label: "Reisen",
    icon: Luggage,
    // Owns the trips list + trip-detail pages, but not the account/other areas.
    match: (p) => p === "/trips" || /^\/trips(\/|$)/.test(p),
  },
  {
    href: "/insights",
    label: "Auswertung",
    icon: TrendingUp,
    match: (p) => p === "/insights",
  },
  {
    href: "/todos",
    label: "Aufgaben",
    icon: ClipboardList,
    match: (p) => p === "/todos",
  },
  {
    href: "/account/general",
    label: "Profil",
    icon: User,
    match: (p) => p.startsWith("/account"),
  },
];

// Fixed bottom tab bar, mobile only (hidden from lg up where the sidebar shows).
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-[var(--surface)]/95 backdrop-blur lg:hidden"
      // Add a little breathing room on top of the iOS safe-area inset so the
      // tappable row sits clear of the home indicator / Siri gesture zone.
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 pt-2.5 pb-2 text-xs font-medium transition ${
                active
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
