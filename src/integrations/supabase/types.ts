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
      chef_coins_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          transaction_type: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_type: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_type?: string
          wallet_address?: string
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          created_at: string | null
          id: string
          level_id: number
          run_duration: number
          score: number
          username: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level_id: number
          run_duration: number
          score: number
          username?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level_id?: number
          run_duration?: number
          score?: number
          username?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      player_inventory: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_name: string
          item_type: string
          quantity: number
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_name: string
          item_type: string
          quantity?: number
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_name?: string
          item_type?: string
          quantity?: number
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      player_level_progress: {
        Row: {
          best_score: number | null
          best_time: number | null
          completed: boolean | null
          created_at: string | null
          id: string
          level_id: number
          unlocked: boolean | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          best_score?: number | null
          best_time?: number | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          level_id: number
          unlocked?: boolean | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          best_score?: number | null
          best_time?: number | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          level_id?: number
          unlocked?: boolean | null
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      player_profiles: {
        Row: {
          chef_coins_balance: number
          created_at: string | null
          daily_chef_coins_earned: number
          id: string
          last_daily_reset: string | null
          total_chef_coins_earned: number
          updated_at: string | null
          username: string
          wallet_address: string
        }
        Insert: {
          chef_coins_balance?: number
          created_at?: string | null
          daily_chef_coins_earned?: number
          id?: string
          last_daily_reset?: string | null
          total_chef_coins_earned?: number
          updated_at?: string | null
          username: string
          wallet_address: string
        }
        Update: {
          chef_coins_balance?: number
          created_at?: string | null
          daily_chef_coins_earned?: number
          id?: string
          last_daily_reset?: string | null
          total_chef_coins_earned?: number
          updated_at?: string | null
          username?: string
          wallet_address?: string
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          cost: number
          created_at: string
          description: string | null
          duration: number | null
          icon: string
          id: string
          item_type: string
          level_required: number
          name: string
        }
        Insert: {
          cost: number
          created_at?: string
          description?: string | null
          duration?: number | null
          icon: string
          id: string
          item_type: string
          level_required?: number
          name: string
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string | null
          duration?: number | null
          icon?: string
          id?: string
          item_type?: string
          level_required?: number
          name?: string
        }
        Relationships: []
      }
      shop_purchases: {
        Row: {
          cost: number
          created_at: string | null
          id: string
          item_id: string
          item_name: string
          quantity: number | null
          wallet_address: string
        }
        Insert: {
          cost: number
          created_at?: string | null
          id?: string
          item_id: string
          item_name: string
          quantity?: number | null
          wallet_address: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          id?: string
          item_id?: string
          item_name?: string
          quantity?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      swap_requests: {
        Row: {
          amount: number
          created_at: string | null
          error_message: string | null
          id: string
          processed_at: string | null
          status: string
          swap_type: string
          transaction_signature: string | null
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          swap_type: string
          transaction_signature?: string | null
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          swap_type?: string
          transaction_signature?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_auth: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_chef_coins: {
        Args: {
          p_amount: number
          p_daily_limit?: number
          p_description: string
          p_wallet_address: string
        }
        Returns: {
          error_message: string
          new_balance: number
          success: boolean
        }[]
      }
      get_user_wallet: { Args: never; Returns: string }
      owns_wallet: { Args: { _wallet_address: string }; Returns: boolean }
      purchase_shop_item: {
        Args: { p_item_id: string; p_wallet_address: string }
        Returns: {
          error_message: string
          new_balance: number
          success: boolean
        }[]
      }
      refund_failed_swap: {
        Args: { p_swap_request_id: string }
        Returns: {
          error_message: string
          new_balance: number
          refund_amount: number
          success: boolean
        }[]
      }
      reset_daily_chef_coins: { Args: never; Returns: undefined }
      spend_chef_coins: {
        Args: {
          p_amount: number
          p_description: string
          p_wallet_address: string
        }
        Returns: {
          error_message: string
          new_balance: number
          success: boolean
        }[]
      }
      unlock_next_level: {
        Args: { p_current_level: number; p_wallet_address: string }
        Returns: boolean
      }
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
