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
      activity_logs: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          type: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          type: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          type?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          agency_name: string
          contact_email: string | null
          currency: string
          id: string
          language: string
          logo_url: string | null
          notify_new_order: boolean
          notify_payment: boolean
          updated_at: string
          zalo: string | null
        }
        Insert: {
          address?: string | null
          agency_name?: string
          contact_email?: string | null
          currency?: string
          id?: string
          language?: string
          logo_url?: string | null
          notify_new_order?: boolean
          notify_payment?: boolean
          updated_at?: string
          zalo?: string | null
        }
        Update: {
          address?: string | null
          agency_name?: string
          contact_email?: string | null
          currency?: string
          id?: string
          language?: string
          logo_url?: string | null
          notify_new_order?: boolean
          notify_payment?: boolean
          updated_at?: string
          zalo?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          id: string
          notes: string | null
          paid_on: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          paid_on?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          paid_on?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_name: string | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          issued_at: string
          notes: string | null
          number: string
          order_id: string | null
          paid_at: string | null
          status: string
        }
        Insert: {
          amount?: number
          client_name?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          issued_at?: string
          notes?: string | null
          number: string
          order_id?: string | null
          paid_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          client_name?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          issued_at?: string
          notes?: string | null
          number?: string
          order_id?: string | null
          paid_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          read_at: string | null
          recipient_id: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      order_attachments: {
        Row: {
          created_at: string
          id: string
          mime: string | null
          name: string
          order_id: string
          size: number | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime?: string | null
          name: string
          order_id: string
          size?: number | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          mime?: string | null
          name?: string
          order_id?: string
          size?: number | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_attachments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_comments: {
        Row: {
          author_name: string | null
          body: string
          created_at: string
          id: string
          is_internal: boolean
          order_id: string
        }
        Insert: {
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          order_id: string
        }
        Update: {
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_comments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          order_id: string
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id: string
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          assigned_employee_id: string | null
          assigned_to: string | null
          business_name: string | null
          business_type: string | null
          client_avatar_url: string | null
          client_name: string
          client_notes: string | null
          company_name: string | null
          country: string | null
          created_at: string
          currency: string
          deadline: string | null
          delivery_days: number | null
          deposit: number
          email: string | null
          estimated_delivery: string | null
          facebook: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          package: string | null
          payment_method: string | null
          payment_status: string
          phone: string | null
          priority: string
          progress: number
          service: string | null
          service_category: string | null
          status: string
          tiktok: string | null
          total: number
          website: string | null
          whatsapp: string | null
          zalo: string | null
        }
        Insert: {
          address?: string | null
          assigned_employee_id?: string | null
          assigned_to?: string | null
          business_name?: string | null
          business_type?: string | null
          client_avatar_url?: string | null
          client_name: string
          client_notes?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          delivery_days?: number | null
          deposit?: number
          email?: string | null
          estimated_delivery?: string | null
          facebook?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          package?: string | null
          payment_method?: string | null
          payment_status?: string
          phone?: string | null
          priority?: string
          progress?: number
          service?: string | null
          service_category?: string | null
          status?: string
          tiktok?: string | null
          total?: number
          website?: string | null
          whatsapp?: string | null
          zalo?: string | null
        }
        Update: {
          address?: string | null
          assigned_employee_id?: string | null
          assigned_to?: string | null
          business_name?: string | null
          business_type?: string | null
          client_avatar_url?: string | null
          client_name?: string
          client_notes?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          delivery_days?: number | null
          deposit?: number
          email?: string | null
          estimated_delivery?: string | null
          facebook?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          package?: string | null
          payment_method?: string | null
          payment_status?: string
          phone?: string | null
          priority?: string
          progress?: number
          service?: string | null
          service_category?: string | null
          status?: string
          tiktok?: string | null
          total?: number
          website?: string | null
          whatsapp?: string | null
          zalo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_data_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          last_seen_at: string | null
          name: string
          permissions: Json
          phone: string | null
          role: string | null
          status: string
        }
        Insert: {
          avatar_data_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_seen_at?: string | null
          name: string
          permissions?: Json
          phone?: string | null
          role?: string | null
          status?: string
        }
        Update: {
          avatar_data_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_seen_at?: string | null
          name?: string
          permissions?: Json
          phone?: string | null
          role?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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
