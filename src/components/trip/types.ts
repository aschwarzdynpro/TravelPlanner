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

export interface WorkspaceData {
  trip: Trip;
  areas: Area[];
  accommodations: Accommodation[];
  flights: Flight[];
  travelers: Traveler[];
  members: Member[];
  canEdit: boolean;
  isOwner: boolean;
  currentUserId: string;
}
