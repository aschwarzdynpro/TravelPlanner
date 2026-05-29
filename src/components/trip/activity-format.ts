// Shared types + presentation helpers for the activity feed, used by both the
// per-trip ActivitySection and the global cross-trip feed.

export type ActivityEntry = {
  id: string;
  trip_id: string;
  user_id: string | null;
  action: string;
  detail: { name?: string | null; role?: string | null } | null;
  created_at: string;
  // Resolved actor display name (joined on the server where available).
  actorName?: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Eigentümer",
  editor: "Bearbeiter",
  viewer: "Betrachter",
};

export function describeActivity(entry: ActivityEntry): {
  icon: string;
  text: string;
} {
  const name = entry.detail?.name ?? "";
  const role = entry.detail?.role
    ? ROLE_LABELS[entry.detail.role] ?? entry.detail.role
    : "";
  switch (entry.action) {
    case "trip.updated":
      return { icon: "✏️", text: "hat die Reisedaten aktualisiert" };
    case "area.created":
      return { icon: "🗺️", text: `hat die Gegend „${name}“ hinzugefügt` };
    case "area.updated":
      return { icon: "🗺️", text: `hat die Gegend „${name}“ bearbeitet` };
    case "area.deleted":
      return { icon: "🗑️", text: `hat die Gegend „${name}“ gelöscht` };
    case "accommodation.created":
      return { icon: "🏨", text: `hat die Unterkunft „${name}“ hinzugefügt` };
    case "accommodation.updated":
      return { icon: "🏨", text: `hat die Unterkunft „${name}“ bearbeitet` };
    case "accommodation.deleted":
      return { icon: "🗑️", text: `hat die Unterkunft „${name}“ gelöscht` };
    case "flight.created":
      return { icon: "✈️", text: `hat den Flug „${name}“ hinzugefügt` };
    case "flight.updated":
      return { icon: "✈️", text: `hat den Flug „${name}“ bearbeitet` };
    case "flight.deleted":
      return { icon: "🗑️", text: `hat den Flug „${name}“ gelöscht` };
    case "traveler.created":
      return { icon: "🧑", text: `hat „${name}“ als Mitreisende:n hinzugefügt` };
    case "traveler.updated":
      return { icon: "🧑", text: `hat Mitreisende:n „${name}“ bearbeitet` };
    case "traveler.deleted":
      return { icon: "🗑️", text: `hat Mitreisende:n „${name}“ entfernt` };
    case "member.invited":
      return { icon: "📨", text: `hat ${name} eingeladen` };
    case "member.role_changed":
      return { icon: "🔑", text: `hat eine Rolle auf ${role} geändert` };
    case "member.removed":
      return { icon: "🚪", text: `hat ${name || "ein Mitglied"} entfernt` };
    default:
      return { icon: "•", text: entry.action };
  }
}
