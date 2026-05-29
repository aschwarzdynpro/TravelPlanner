// Verpflegungsstufen (board / meal levels)
export const BOARD_LEVELS: Record<string, string> = {
  none: "Keine Angabe",
  self_catering: "Selbstverpflegung",
  breakfast: "Frühstück",
  half_board: "Halbpension",
  full_board: "Vollpension",
  all_inclusive: "All Inclusive",
};

export const BOARD_LEVEL_ORDER = [
  "none",
  "self_catering",
  "breakfast",
  "half_board",
  "full_board",
  "all_inclusive",
];

export const TRIP_KINDS: Record<string, string> = {
  trip: "Reise",
  event: "Event",
};

export const MEMBER_ROLES: Record<string, string> = {
  owner: "Eigentümer",
  editor: "Bearbeiter",
  viewer: "Betrachter",
};

export const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD"];

export const COVER_COLORS = [
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#db2777",
  "#475569",
];
