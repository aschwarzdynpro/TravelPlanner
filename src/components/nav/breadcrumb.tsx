"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbCtx = {
  title: string | null;
  setTitle: (t: string | null) => void;
};

const Ctx = createContext<BreadcrumbCtx>({ title: null, setTitle: () => {} });

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | null>(null);
  return <Ctx.Provider value={{ title, setTitle }}>{children}</Ctx.Provider>;
}

/**
 * Lets a page register a dynamic breadcrumb label (e.g. the trip name on the
 * trip-detail page). Clears it again on unmount.
 */
export function useBreadcrumbTitle(title: string | null | undefined) {
  const { setTitle } = useContext(Ctx);
  useEffect(() => {
    setTitle(title ?? null);
    return () => setTitle(null);
  }, [title, setTitle]);
}

type Crumb = { label: string; href?: string };

// Static label map for known routes. The trip-detail page contributes its
// name dynamically via useBreadcrumbTitle.
const STATIC: { match: (p: string) => boolean; crumbs: Crumb[] }[] = [
  { match: (p) => p === "/dashboard", crumbs: [{ label: "Dashboard" }] },
  {
    match: (p) => p === "/trips",
    crumbs: [{ label: "Reisen" }, { label: "Meine Reisen" }],
  },
  {
    match: (p) => p === "/trips/shared",
    crumbs: [{ label: "Reisen" }, { label: "Geteilte Reisen" }],
  },
  {
    match: (p) => p === "/trips/following",
    crumbs: [{ label: "Reisen" }, { label: "Follow-Up Reisen" }],
  },
  { match: (p) => p === "/todos", crumbs: [{ label: "Meine Aufgaben" }] },
  { match: (p) => p === "/insights", crumbs: [{ label: "Auswertungen" }] },
  { match: (p) => p === "/activity", crumbs: [{ label: "Feed" }] },
  { match: (p) => p === "/help", crumbs: [{ label: "Hilfe" }] },
  {
    match: (p) => p === "/account/security",
    crumbs: [{ label: "Account" }, { label: "Sicherheit" }],
  },
  {
    match: (p) => p === "/account/general",
    crumbs: [{ label: "Account" }, { label: "Allgemein" }],
  },
  {
    match: (p) => p === "/account/plan",
    crumbs: [{ label: "Account" }, { label: "Abo" }],
  },
];

export function Breadcrumb() {
  const pathname = usePathname();
  const { title } = useContext(Ctx);

  let crumbs: Crumb[] | null = null;

  const staticMatch = STATIC.find((s) => s.match(pathname));
  if (staticMatch) {
    crumbs = staticMatch.crumbs;
  } else if (/^\/trips\/[^/]+$/.test(pathname)) {
    crumbs = [
      { label: "Reisen", href: "/trips" },
      { label: title ?? "Reise" },
    ];
  }

  if (!crumbs) return null;

  return (
    <nav
      aria-label="Brotkrumen"
      className="flex min-w-0 items-center gap-1.5 text-sm"
    >
      {crumbs.map((c, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1.5">
          {i > 0 && <span className="text-[var(--muted)]">/</span>}
          {c.href ? (
            <Link
              href={c.href}
              className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {c.label}
            </Link>
          ) : (
            <span
              className={
                i === crumbs!.length - 1
                  ? "truncate font-medium"
                  : "shrink-0 text-[var(--muted)]"
              }
            >
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
