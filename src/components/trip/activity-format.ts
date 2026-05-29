// Shared types + presentation helpers for the activity feed, used by both the
// per-trip ActivitySection and the global cross-trip feed.
import {
  Pencil,
  MapIcon,
  Hotel,
  Plane,
  User,
  Trash2,
  Mail,
  KeyRound,
  DoorOpen,
  Bell,
  type LucideIcon,
} from "@/components/icons";

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
  Icon: LucideIcon;
  text: string;
} {
  const name = entry.detail?.name ?? "";
  const role = entry.detail?.role
    ? ROLE_LABELS[entry.detail.role] ?? entry.detail.role
    : "";
  switch (entry.action) {
    case "trip.updated":
      return { Icon: Pencil, text: "hat die Reisedaten aktualisiert" };
    case "area.created":
      return { Icon: MapIcon, text: `hat die Gegend „${name}“ hinzugefügt` };
    case "area.updated":
      return { Icon: MapIcon, text: `hat die Gegend „${name}“ bearbeitet` };
    case "area.deleted":
      return { Icon: Trash2, text: `hat die Gegend „${name}“ gelöscht` };
    case "accommodation.created":
      return { Icon: Hotel, text: `hat die Unterkunft „${name}“ hinzugefügt` };
    case "accommodation.updated":
      return { Icon: Hotel, text: `hat die Unterkunft „${name}“ bearbeitet` };
    case "accommodation.deleted":
      return { Icon: Trash2, text: `hat die Unterkunft „${name}“ gelöscht` };
    case "flight.created":
      return { Icon: Plane, text: `hat den Flug „${name}“ hinzugefügt` };
    case "flight.updated":
      return { Icon: Plane, text: `hat den Flug „${name}“ bearbeitet` };
    case "flight.deleted":
      return { Icon: Trash2, text: `hat den Flug „${name}“ gelöscht` };
    case "traveler.created":
      return { Icon: User, text: `hat „${name}“ als Mitreisende:n hinzugefügt` };
    case "traveler.updated":
      return { Icon: User, text: `hat Mitreisende:n „${name}“ bearbeitet` };
    case "traveler.deleted":
      return { Icon: Trash2, text: `hat Mitreisende:n „${name}“ entfernt` };
    case "member.invited":
      return { Icon: Mail, text: `hat ${name} eingeladen` };
    case "member.role_changed":
      return { Icon: KeyRound, text: `hat eine Rolle auf ${role} geändert` };
    case "member.removed":
      return { Icon: DoorOpen, text: `hat ${name || "ein Mitglied"} entfernt` };
    default:
      return { Icon: Bell, text: entry.action };
  }
}
