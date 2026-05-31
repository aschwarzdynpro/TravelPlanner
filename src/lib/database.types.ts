export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          is_paid: boolean
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          payment_due_date: string | null
          price_per_night: number | null
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
          is_paid?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          payment_due_date?: string | null
          price_per_night?: number | null
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
          is_paid?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          payment_due_date?: string | null
          price_per_night?: number | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          arrival_date: string | null
          country_code: string | null
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
          country_code?: string | null
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
          country_code?: string | null
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
        Relationships: [
          {
            foreignKeyName: "areas_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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
          is_paid: boolean
          notes: string | null
          payment_due_date: string | null
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
          is_paid?: boolean
          notes?: string | null
          payment_due_date?: string | null
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
          is_paid?: boolean
          notes?: string | null
          payment_due_date?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flights_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_admin: boolean
          plan: string
          plan_until: string | null
          show_area_maps: boolean
          theme: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          is_admin?: boolean
          plan?: string
          plan_until?: string | null
          show_area_maps?: boolean
          theme?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean
          plan?: string
          plan_until?: string | null
          show_area_maps?: boolean
          theme?: string
        }
        Relationships: []
      }
      travelers: {
        Row: {
          birth_date: string | null
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
          birth_date?: string | null
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
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          linked_user_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travelers_linked_user_id_fkey"
            columns: ["linked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travelers_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "trip_activity_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_follows: {
        Row: {
          created_at: string
          id: string
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_follows_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      trip_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_notes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_todos: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          done: boolean
          done_at: string | null
          due_date: string | null
          id: string
          sort_order: number
          title: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          done?: boolean
          done_at?: string | null
          due_date?: string | null
          id?: string
          sort_order?: number
          title: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          done?: boolean
          done_at?: string | null
          due_date?: string | null
          id?: string
          sort_order?: number
          title?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_todos_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_todos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_todos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget: number | null
          budget_currency: string
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
          share_level: string
          share_token: string
          source_trip_id: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          budget_currency?: string
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
          share_level?: string
          share_token?: string
          source_trip_id?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          budget_currency?: string
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
          share_level?: string
          share_token?: string
          source_trip_id?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_source_trip_id_fkey"
            columns: ["source_trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_trip: { Args: { _trip_id: string }; Returns: boolean }
      can_view_trip: { Args: { _trip_id: string }; Returns: boolean }
      claim_invites: { Args: never; Returns: number }
      get_followed_trips: { Args: never; Returns: Json }
      get_shared_trip: { Args: { p_token: string }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      is_trip_editor: { Args: { _trip_id: string }; Returns: boolean }
      is_trip_member: { Args: { _trip_id: string }; Returns: boolean }
      is_trip_participant: { Args: { _trip_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
