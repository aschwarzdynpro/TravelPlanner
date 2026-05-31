"use client";

import { useEffect } from "react";
import { X } from "@/components/icons";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-b-none sm:max-h-[85dvh] sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b bg-[var(--surface)] px-5 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        {/* Only the body scrolls; overflow-x-hidden stops any wide child from
            spilling past the edge on narrow screens. */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
