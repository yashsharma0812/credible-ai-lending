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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      credit_scores: {
        Row: {
          calculated_at: string | null
          created_at: string | null
          explanation: string | null
          factors: Json | null
          id: string
          score: number
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          created_at?: string | null
          explanation?: string | null
          factors?: Json | null
          id?: string
          score: number
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          created_at?: string | null
          explanation?: string | null
          factors?: Json | null
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          amount: number
          amount_repaid: number | null
          borrower_id: string
          completed_at: string | null
          created_at: string | null
          duration_months: number
          funded_at: string | null
          id: string
          interest_rate: number
          lender_id: string | null
          next_payment_date: string | null
          purpose: string
          repayment_amount: number | null
          smart_contract_hash: string | null
          status: Database["public"]["Enums"]["loan_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_repaid?: number | null
          borrower_id: string
          completed_at?: string | null
          created_at?: string | null
          duration_months: number
          funded_at?: string | null
          id?: string
          interest_rate: number
          lender_id?: string | null
          next_payment_date?: string | null
          purpose: string
          repayment_amount?: number | null
          smart_contract_hash?: string | null
          status?: Database["public"]["Enums"]["loan_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_repaid?: number | null
          borrower_id?: string
          completed_at?: string | null
          created_at?: string | null
          duration_months?: number
          funded_at?: string | null
          id?: string
          interest_rate?: number
          lender_id?: string | null
          next_payment_date?: string | null
          purpose?: string
          repayment_amount?: number | null
          smart_contract_hash?: string | null
          status?: Database["public"]["Enums"]["loan_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          kyc_completed_at: string | null
          kyc_status: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name: string
          id?: string
          kyc_completed_at?: string | null
          kyc_status?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          kyc_completed_at?: string | null
          kyc_status?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          block_number: number
          blockchain_hash: string
          created_at: string | null
          from_user_id: string
          gas_fee: number | null
          id: string
          loan_id: string
          status: string | null
          to_user_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          block_number: number
          blockchain_hash: string
          created_at?: string | null
          from_user_id: string
          gas_fee?: number | null
          id?: string
          loan_id: string
          status?: string | null
          to_user_id: string
          transaction_type: string
        }
        Update: {
          amount?: number
          block_number?: number
          blockchain_hash?: string
          created_at?: string | null
          from_user_id?: string
          gas_fee?: number | null
          id?: string
          loan_id?: string
          status?: string | null
          to_user_id?: string
          transaction_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "borrower" | "lender"
      loan_status:
        | "pending"
        | "active"
        | "funded"
        | "repaying"
        | "completed"
        | "defaulted"
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
      app_role: ["admin", "borrower", "lender"],
      loan_status: [
        "pending",
        "active",
        "funded",
        "repaying",
        "completed",
        "defaulted",
      ],
    },
  },
} as const
