import Link from "next/link";
import { Lock, ArrowRight } from "@/components/icons";

// Comfort gating: a compact hint shown where a Pro feature would appear for
// free users. The real enforcement lives server-side (assertCan). Links to the
// plan page rather than a checkout (none exists yet).
export default function UpgradeNotice({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="card flex flex-col items-start gap-2 border-dashed p-4">
      <div className="flex items-center gap-2 font-medium">
        <Lock className="h-4 w-4 text-[var(--muted)]" strokeWidth={2} />
        {title}
      </div>
      {description && (
        <p className="text-sm text-[var(--muted)]">{description}</p>
      )}
      <Link
        href="/account/plan"
        className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
      >
        Mehr zu Pro
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </Link>
    </div>
  );
}
