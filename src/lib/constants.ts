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

// Noir cover palette — muted, desaturated tones plus neutrals. Calm enough to
// stay stimmig with the monochrome UI while still distinguishing trips.
export const COVER_COLORS = [
  "#18181b",
  "#3f3f46",
  "#64748b",
  "#4b5563",
  "#6b7280",
  "#78716c",
  "#57534e",
  "#a1a1aa",
];
