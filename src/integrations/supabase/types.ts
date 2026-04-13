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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      card_types: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          card_name: string | null
          card_number: string | null
          card_type: string
          cert_number: string | null
          copy_number: string | null
          created_at: string
          driver_id: string
          grade: string | null
          grading_company: string | null
          id: string
          image_back_url: string | null
          image_front_url: string | null
          is_graded: boolean
          is_landscape: boolean
          notes: string | null
          parallel: string
          print_run: string | null
          set_name: string
          sort_order: number
          status: string
          team: string | null
          year: number
        }
        Insert: {
          card_name?: string | null
          card_number?: string | null
          card_type?: string
          cert_number?: string | null
          copy_number?: string | null
          created_at?: string
          driver_id: string
          grade?: string | null
          grading_company?: string | null
          id?: string
          image_back_url?: string | null
          image_front_url?: string | null
          is_graded?: boolean
          is_landscape?: boolean
          notes?: string | null
          parallel?: string
          print_run?: string | null
          set_name: string
          sort_order?: number
          status?: string
          team?: string | null
          year: number
        }
        Update: {
          card_name?: string | null
          card_number?: string | null
          card_type?: string
          cert_number?: string | null
          copy_number?: string | null
          created_at?: string
          driver_id?: string
          grade?: string | null
          grading_company?: string | null
          id?: string
          image_back_url?: string | null
          image_front_url?: string | null
          is_graded?: boolean
          is_landscape?: boolean
          notes?: string | null
          parallel?: string
          print_run?: string | null
          set_name?: string
          sort_order?: number
          status?: string
          team?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cards_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          avatar_type: string
          avatar_value: string | null
          collection_type: string
          color_hex: string
          created_at: string
          id: string
          name: string
          sort_order: number
          team: string | null
        }
        Insert: {
          avatar_type?: string
          avatar_value?: string | null
          collection_type?: string
          color_hex?: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          team?: string | null
        }
        Update: {
          avatar_type?: string
          avatar_value?: string | null
          collection_type?: string
          color_hex?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          team?: string | null
        }
        Relationships: []
      }
      f1_cards: {
        Row: {
          card_name: string | null
          card_number: string | null
          cert_number: string | null
          copy_number: string | null
          created_at: string
          driver_id: string
          grade: string | null
          grade_company: string | null
          graded: boolean
          id: string
          image_back: string | null
          image_front: string | null
          notes: string | null
          parallel_id: string | null
          print_run: string | null
          set_id: string | null
          sort_order: number
          status: string
          type: string
        }
        Insert: {
          card_name?: string | null
          card_number?: string | null
          cert_number?: string | null
          copy_number?: string | null
          created_at?: string
          driver_id: string
          grade?: string | null
          grade_company?: string | null
          graded?: boolean
          id?: string
          image_back?: string | null
          image_front?: string | null
          notes?: string | null
          parallel_id?: string | null
          print_run?: string | null
          set_id?: string | null
          sort_order?: number
          status?: string
          type?: string
        }
        Update: {
          card_name?: string | null
          card_number?: string | null
          cert_number?: string | null
          copy_number?: string | null
          created_at?: string
          driver_id?: string
          grade?: string | null
          grade_company?: string | null
          graded?: boolean
          id?: string
          image_back?: string | null
          image_front?: string | null
          notes?: string | null
          parallel_id?: string | null
          print_run?: string | null
          set_id?: string | null
          sort_order?: number
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "f1_cards_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "f1_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "f1_cards_parallel_id_fkey"
            columns: ["parallel_id"]
            isOneToOne: false
            referencedRelation: "f1_parallels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "f1_cards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "f1_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      f1_drivers: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      f1_parallels: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      f1_sets: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      parallels: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
