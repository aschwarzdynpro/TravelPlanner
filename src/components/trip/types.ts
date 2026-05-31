import type { Tables } from "@/lib/database.types";

export type Trip = Tables<"trips">;
export type Area = Tables<"areas">;
export type Accommodation = Tables<"accommodations">;
export type Flight = Tables<"flights">;
export type Traveler = Tables<"travelers">;

export type Member = Tables<"trip_members"> & {
  profiles: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
};

export type ActivityRow = Tables<"trip_activity"> & {
  profiles: { display_name: string | null; email: string | null } | null;
};

export type TripNote = Tables<"trip_notes">;

export type TripTodo = Tables<"trip_todos"> & {
  assignee: { display_name: string | null; email: string | null } | null;
};

export interface WorkspaceData {
  trip: Trip;
  areas: Area[];
  accommodations: Accommodation[];
  flights: Flight[];
  travelers: Traveler[];
  members: Member[];
  activity: ActivityRow[];
  notes: TripNote[];
  todos: TripTodo[];
  canEdit: boolean;
  isOwner: boolean;
  currentUserId: string;
  // Whether the current user has an active Pro plan (gates premium UI).
  isPro: boolean;
  // Display preference: show embedded area-map previews.
  showAreaMaps: boolean;
  // Admin feature flag: show the "Drucken / PDF" button.
  showPrintPdf: boolean;
}
