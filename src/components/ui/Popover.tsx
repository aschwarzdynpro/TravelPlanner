"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

// Anchored popover rendered in a portal (document.body) with fixed positioning,
// so it escapes any overflow/clipping from scrolling containers like modals.
// Flips above the anchor when there isn't enough room below.
export default function Popover({
  anchorRef,
  open,
  onClose,
  width,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  // Popover width in px; defaults to matching the anchor's width.
  width?: number;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    function place() {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const w = width ?? r.width;
      const panelH = panel?.offsetHeight ?? 320;
      const gap = 4;
      const below = window.innerHeight - r.bottom;
      const openUp = below < panelH + gap && r.top > below;
      const top = openUp ? r.top - panelH - gap : r.bottom + gap;
      let left = r.left;
      // Keep within the viewport horizontally.
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
      setPos({ left, top, width: w });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchorRef, width]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      )
        return;
      onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        left: pos?.left ?? -9999,
        top: pos?.top ?? -9999,
        width: pos?.width,
        visibility: pos ? "visible" : "hidden",
      }}
      className="z-[100]"
    >
      {children}
    </div>,
    document.body,
  );
}
