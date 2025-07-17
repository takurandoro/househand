export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bids: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          helper_id: string
          id: string
          message: string | null
          proposed_price: number
          rejected_at: string | null
          status: Database["public"]["Enums"]["application_status"]
          task_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          helper_id: string
          id?: string
          message?: string | null
          proposed_price: number
          rejected_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          task_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          helper_id?: string
          id?: string
          message?: string | null
          proposed_price?: number
          rejected_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_balances"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "bids_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_stats"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "bids_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_applications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_earnings: {
        Row: {
          amount: number
          created_at: string
          helper_id: string
          id: string
          status: string | null
          task_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          helper_id: string
          id?: string
          status?: string | null
          task_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          helper_id?: string
          id?: string
          status?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "helper_earnings_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string | null
          helper_id: string
          id: string
          rating: number
          task_id: string
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string | null
          helper_id: string
          id?: string
          rating: number
          task_id: string
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string | null
          helper_id?: string
          id?: string
          rating?: number
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "helper_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "helper_balances"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "helper_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "helper_stats"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "helper_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helper_reviews_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_balances"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "helper_reviews_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_stats"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "helper_reviews_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helper_reviews_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean
          message: string
          read: boolean
          related_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          read?: boolean
          related_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          read?: boolean
          related_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "helper_balances"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "helper_stats"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          helper_id: string
          id: string
          paid: boolean
          paid_at: string | null
          social_security_contribution: number | null
          task_id: string
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          helper_id: string
          id?: string
          paid?: boolean
          paid_at?: string | null
          social_security_contribution?: number | null
          task_id: string
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          helper_id?: string
          id?: string
          paid?: boolean
          paid_at?: string | null
          social_security_contribution?: number | null
          task_id?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "helper_balances"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "helper_stats"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_balances"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "payments_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_stats"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "payments_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string
          bio: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          location: string
          phone_number: string
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url: string
          bio?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          location: string
          phone_number: string
          updated_at?: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          location?: string
          phone_number?: string
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      tasks: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category: Database["public"]["Enums"]["task_category"]
          client_id: string
          completed_at: string | null
          created_at: string | null
          description: string
          hours: string | null
          id: string
          location: string
          max_price: number
          median_budget: number | null
          min_price: number
          payment_amount: number | null
          payment_date: string | null
          payment_status: boolean
          selected_helper_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category?: Database["public"]["Enums"]["task_category"]
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          description: string
          hours?: string | null
          id?: string
          location: string
          max_price: number
          median_budget?: number | null
          min_price: number
          payment_amount?: number | null
          payment_date?: string | null
          payment_status?: boolean
          selected_helper_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category?: Database["public"]["Enums"]["task_category"]
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string
          hours?: string | null
          id?: string
          location?: string
          max_price?: number
          median_budget?: number | null
          min_price?: number
          payment_amount?: number | null
          payment_date?: string | null
          payment_status?: boolean
          selected_helper_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "helper_balances"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "helper_stats"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_selected_helper_id_fkey"
            columns: ["selected_helper_id"]
            isOneToOne: false
            referencedRelation: "helper_balances"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "tasks_selected_helper_id_fkey"
            columns: ["selected_helper_id"]
            isOneToOne: false
            referencedRelation: "helper_stats"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "tasks_selected_helper_id_fkey"
            columns: ["selected_helper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          helper_id: string
          id: string
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          helper_id: string
          id?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          helper_id?: string
          id?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_balances"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "transactions_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_stats"
            referencedColumns: ["helper_id"]
          },
          {
            foreignKeyName: "transactions_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      helper_balances: {
        Row: {
          current_balance: number | null
          full_name: string | null
          helper_id: string | null
        }
        Relationships: []
      }
      helper_stats: {
        Row: {
          average_rating: number | null
          completed_tasks: number | null
          full_name: string | null
          helper_id: string | null
          total_earnings: number | null
          total_reviews: number | null
          total_social_security: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_suggested_budget: {
        Args: { hours: string; effort_level: string }
        Returns: Json
      }
      exec_sql: {
        Args: { sql: string }
        Returns: undefined
      }
      fix_task_application: {
        Args: { p_task_id: string; p_helper_id: string }
        Returns: undefined
      }
      get_helper_available_balance: {
        Args: { p_helper_id: string }
        Returns: number
      }
      process_task_payment: {
        Args: { p_task_id: string; p_helper_id: string; p_amount: number }
        Returns: Json
      }
    }
    Enums: {
      application_status: "submitted" | "accepted" | "rejected"
      notification_type:
        | "bid_submitted"
        | "new_bid"
        | "bid_rejected"
        | "bid_accepted"
        | "task_started"
        | "task_completed"
        | "payment_completed"
        | "review_submitted"
      task_category:
        | "cleaning"
        | "gardening"
        | "moving"
        | "home_maintenance"
        | "other"
      task_effort:
        | "1-2 hours"
        | "2-4 hours"
        | "4-6 hours"
        | "6-8 hours"
        | "8-12 hours"
        | "12-24 hours"
        | "24-48 hours"
        | "48+ hours"
      task_status: "open" | "assigned" | "in_progress" | "completed"
      transaction_status: "pending" | "completed" | "failed"
      transaction_type: "withdrawal" | "deposit" | "earning"
      user_type: "client" | "helper"
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
    Enums: {
      application_status: ["submitted", "accepted", "rejected"],
      notification_type: [
        "bid_submitted",
        "new_bid",
        "bid_rejected",
        "bid_accepted",
        "task_started",
        "task_completed",
        "payment_completed",
        "review_submitted",
      ],
      task_category: [
        "cleaning",
        "gardening",
        "moving",
        "home_maintenance",
        "other",
      ],
      task_effort: [
        "1-2 hours",
        "2-4 hours",
        "4-6 hours",
        "6-8 hours",
        "8-12 hours",
        "12-24 hours",
        "24-48 hours",
        "48+ hours",
      ],
      task_status: ["open", "assigned", "in_progress", "completed"],
      transaction_status: ["pending", "completed", "failed"],
      transaction_type: ["withdrawal", "deposit", "earning"],
      user_type: ["client", "helper"],
    },
  },
} as const
