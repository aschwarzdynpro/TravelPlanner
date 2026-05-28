export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          address: string | null
          area_id: string | null
          board_level: string
          booking_reference: string | null
          booking_url: string | null
          cancellation_deadline: string | null
          cancellation_policy: string | null
          check_in_date: string | null
          check_in_time: string | null
          check_out_date: string | null
          check_out_time: string | null
          cost: number | null
          created_at: string
          currency: string
          id: string
          name: string
          notes: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          area_id?: string | null
          board_level?: string
          booking_reference?: string | null
          booking_url?: string | null
          cancellation_deadline?: string | null
          cancellation_policy?: string | null
          check_in_date?: string | null
          check_in_time?: string | null
          check_out_date?: string | null
          check_out_time?: string | null
          cost?: number | null
          created_at?: string
          currency?: string
          id?: string
          name: string
          notes?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          area_id?: string | null
          board_level?: string
          booking_reference?: string | null
          booking_url?: string | null
          cancellation_deadline?: string | null
          cancellation_policy?: string | null
          check_in_date?: string | null
          check_in_time?: string | null
          check_out_date?: string | null
          check_out_time?: string | null
          cost?: number | null
          created_at?: string
          currency?: string
          id?: string
          name?: string
          notes?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          arrival_date: string | null
          created_at: string
          departure_date: string | null
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          region: string | null
          sort_order: number
          trip_id: string
        }
        Insert: {
          arrival_date?: string | null
          created_at?: string
          departure_date?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          region?: string | null
          sort_order?: number
          trip_id: string
        }
        Update: {
          arrival_date?: string | null
          created_at?: string
          departure_date?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string | null
          sort_order?: number
          trip_id?: string
        }
        Relationships: []
      }
      flights: {
        Row: {
          airline: string | null
          arrival_airport: string | null
          arrival_time: string | null
          booking_reference: string | null
          booking_url: string | null
          cancellation_policy: string | null
          cost: number | null
          created_at: string
          currency: string
          departure_airport: string | null
          departure_time: string | null
          flight_number: string | null
          id: string
          notes: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          airline?: string | null
          arrival_airport?: string | null
          arrival_time?: string | null
          booking_reference?: string | null
          booking_url?: string | null
          cancellation_policy?: string | null
          cost?: number | null
          created_at?: string
          currency?: string
          departure_airport?: string | null
          departure_time?: string | null
          flight_number?: string | null
          id?: string
          notes?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          airline?: string | null
          arrival_airport?: string | null
          arrival_time?: string | null
          booking_reference?: string | null
          booking_url?: string | null
          cancellation_policy?: string | null
          cost?: number | null
          created_at?: string
          currency?: string
          departure_airport?: string | null
          departure_time?: string | null
          flight_number?: string | null
          id?: string
          notes?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      travelers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          linked_user_id: string | null
          name: string
          notes: string | null
          phone: string | null
          trip_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          linked_user_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          trip_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          linked_user_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          trip_id?: string
        }
        Relationships: []
      }
      trip_activity: {
        Row: {
          action: string
          created_at: string
          detail: Json
          id: string
          trip_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          detail?: Json
          id?: string
          trip_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          detail?: Json
          id?: string
          trip_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trip_members: {
        Row: {
          created_at: string
          id: string
          invited_email: string | null
          role: string
          status: string
          trip_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invited_email?: string | null
          role?: string
          status?: string
          trip_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invited_email?: string | null
          role?: string
          status?: string
          trip_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          cover_color: string | null
          created_at: string
          created_by: string
          description: string | null
          destination: string | null
          end_date: string | null
          id: string
          is_public: boolean
          kind: string
          name: string
          share_token: string
          source_trip_id: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          cover_color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          is_public?: boolean
          kind?: string
          name: string
          share_token?: string
          source_trip_id?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          cover_color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          is_public?: boolean
          kind?: string
          name?: string
          share_token?: string
          source_trip_id?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      can_edit_trip: { Args: { _trip_id: string }; Returns: boolean }
      can_view_trip: { Args: { _trip_id: string }; Returns: boolean }
      claim_invites: { Args: Record<string, never>; Returns: number }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]
