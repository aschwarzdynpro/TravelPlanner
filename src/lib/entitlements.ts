// Freemium entitlements — single source of truth for what each plan may do.
//
// No checkout exists yet; `plan` is set out-of-band (service role / future
// Stripe webhook) and guarded against client tampering by a DB trigger. This
// module only decides *what a given plan is entitled to*, used by both the UI
// (comfort gating) and the server (real enforcement via assertCan).

export type Plan = "free" | "pro";

// Minimal shape we need from a profile row to decide entitlements.
export type PlanHolder = {
  plan?: string | null;
  plan_until?: string | null;
};

/** Boolean Pro features. Add new gated capabilities here. */
export type Feature =
  | "ai.trip_suggestions" // KI-Vorschläge für Reisen/Gegenden
  | "ai.prep_suggestions" // Vorbereitungen aus ähnlichen Reisemustern
  | "ai.activity_suggestions" // Aktivitätenvorschläge in der Gegend
  | "hotel.ratings"; // Hotel-Kategorie & Bewertung zur Unterkunft

/** Numeric limits that differ per plan (null = unbegrenzt). */
export type Limit = "maxTrips";

const FEATURE_PLAN: Record<Feature, Plan> = {
  "ai.trip_suggestions": "pro",
  "ai.prep_suggestions": "pro",
  "ai.activity_suggestions": "pro",
  "hotel.ratings": "pro",
};

const LIMITS: Record<Plan, Record<Limit, number | null>> = {
  free: { maxTrips: null }, // bewusst noch unbegrenzt — keine Bestandsfunktion einschränken
  pro: { maxTrips: null },
};

type FeatureMeta = {
  title: string;
  description: string;
  /** Whether the capability is actually live yet (false = "kommt bald"). */
  available: boolean;
};

const FEATURE_META: Record<Feature, FeatureMeta> = {
  "ai.trip_suggestions": {
    title: "KI-Reisevorschläge",
    description:
      "Vorschläge für Reisen und passende Gegenden – generiert auf Basis deiner Planung.",
    available: false,
  },
  "ai.prep_suggestions": {
    title: "Smarte Vorbereitung",
    description:
      "Aufgaben- und Packvorschläge, abgeleitet aus ähnlichen Reisen anderer.",
    available: false,
  },
  "ai.activity_suggestions": {
    title: "Aktivitäten in der Gegend",
    description:
      "Passende Unternehmungen und Sehenswürdigkeiten rund um deine Unterkünfte.",
    available: false,
  },
  "hotel.ratings": {
    title: "Hotel-Kategorie & Bewertung",
    description:
      "Sterne-Kategorie und Gesamtbewertung zu deinen Unterkünften, direkt bei der Auswahl.",
    available: false,
  },
};

export const PRO_FEATURES: Feature[] = Object.keys(FEATURE_META) as Feature[];

/** True when the holder has an active Pro plan (respects plan_until expiry). */
export function isPro(holder: PlanHolder | null | undefined): boolean {
  if (!holder || holder.plan !== "pro") return false;
  if (!holder.plan_until) return true; // no expiry = permanent
  return new Date(holder.plan_until).getTime() > Date.now();
}

export function planOf(holder: PlanHolder | null | undefined): Plan {
  return isPro(holder) ? "pro" : "free";
}

/** Whether the holder may use a boolean Pro feature. */
export function can(
  holder: PlanHolder | null | undefined,
  feature: Feature,
): boolean {
  const required = FEATURE_PLAN[feature];
  if (required === "free") return true;
  return isPro(holder);
}

/** Per-plan numeric limit (null = unbegrenzt). */
export function limitOf(
  holder: PlanHolder | null | undefined,
  limit: Limit,
): number | null {
  return LIMITS[planOf(holder)][limit];
}

export function featureMeta(feature: Feature): FeatureMeta {
  return FEATURE_META[feature];
}
