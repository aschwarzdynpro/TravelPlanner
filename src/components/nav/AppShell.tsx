"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { initials } from "@/lib/format";
import Sidebar from "./Sidebar";
import { BreadcrumbProvider, Breadcrumb } from "./breadcrumb";

export default function AppShell({
  displayName,
  email,
  children,
}: {
  displayName: string;
  email: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <BreadcrumbProvider>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r bg-[var(--surface)] lg:block">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-64 border-r bg-[var(--surface)] shadow-xl">
              <Sidebar onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b bg-[var(--surface)]/80 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-2.5">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="btn-ghost px-2 py-1.5 lg:hidden"
                aria-label="Menü öffnen"
              >
                ☰
              </button>

              {/* User / profile */}
              <Link
                href="/account/general"
                className="flex items-center gap-2 rounded-lg py-1 pr-2 hover:bg-black/5 dark:hover:bg-white/5"
                title={email}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-xs font-semibold text-white">
                  {initials(displayName)}
                </span>
                <span className="hidden text-sm font-medium sm:block">
                  {displayName}
                </span>
              </Link>

              <span className="text-[var(--muted)]">/</span>

              {/* Selected submenu / context */}
              <div className="min-w-0 flex-1">
                <Breadcrumb />
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
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
