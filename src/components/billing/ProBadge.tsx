import { Sparkles } from "@/components/icons";

// Small, unobtrusive "Pro" marker for gated features. Monochrome, theme-driven.
export default function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`chip border border-[var(--border)] bg-black/[0.04] text-[var(--muted)] dark:bg-white/[0.06] ${className}`}
    >
      <Sparkles className="h-3 w-3" strokeWidth={2} />
      Pro
    </span>
  );
}
