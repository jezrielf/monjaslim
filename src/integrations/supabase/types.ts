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
      funnel_events: {
        Row: {
          event_type: string
          form_data_snapshot: Json | null
          id: string
          lead_id: string | null
          step_number: number | null
          time_on_step_seconds: number | null
          timestamp: string
          utm_data: Json | null
        }
        Insert: {
          event_type: string
          form_data_snapshot?: Json | null
          id?: string
          lead_id?: string | null
          step_number?: number | null
          time_on_step_seconds?: number | null
          timestamp?: string
          utm_data?: Json | null
        }
        Update: {
          event_type?: string
          form_data_snapshot?: Json | null
          id?: string
          lead_id?: string | null
          step_number?: number | null
          time_on_step_seconds?: number | null
          timestamp?: string
          utm_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          aceite_final: boolean | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          completed_steps: number | null
          conversion_value: string | null
          created_at: string
          data_preenchimento: string | null
          delivery_date: string | null
          delivery_notes: string | null
          delivery_status: string | null
          dia_agenda: string | null
          email: string | null
          fb_source: string | null
          fbclid: string | null
          final_action: string | null
          horario_agenda: string | null
          id: string
          modalidade_compra: string | null
          nome: string | null
          numero: string | null
          page_url: string | null
          payment_date: string | null
          payment_notes: string | null
          payment_status: string | null
          preco_tratamento: string | null
          referrer: string | null
          rua: string | null
          session_id: string | null
          telefone: string | null
          tipo_tratamento: string | null
          total_time_seconds: number | null
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          aceite_final?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          completed_steps?: number | null
          conversion_value?: string | null
          created_at?: string
          data_preenchimento?: string | null
          delivery_date?: string | null
          delivery_notes?: string | null
          delivery_status?: string | null
          dia_agenda?: string | null
          email?: string | null
          fb_source?: string | null
          fbclid?: string | null
          final_action?: string | null
          horario_agenda?: string | null
          id?: string
          modalidade_compra?: string | null
          nome?: string | null
          numero?: string | null
          page_url?: string | null
          payment_date?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          preco_tratamento?: string | null
          referrer?: string | null
          rua?: string | null
          session_id?: string | null
          telefone?: string | null
          tipo_tratamento?: string | null
          total_time_seconds?: number | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          aceite_final?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          completed_steps?: number | null
          conversion_value?: string | null
          created_at?: string
          data_preenchimento?: string | null
          delivery_date?: string | null
          delivery_notes?: string | null
          delivery_status?: string | null
          dia_agenda?: string | null
          email?: string | null
          fb_source?: string | null
          fbclid?: string | null
          final_action?: string | null
          horario_agenda?: string | null
          id?: string
          modalidade_compra?: string | null
          nome?: string | null
          numero?: string | null
          page_url?: string | null
          payment_date?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          preco_tratamento?: string | null
          referrer?: string | null
          rua?: string | null
          session_id?: string | null
          telefone?: string | null
          tipo_tratamento?: string | null
          total_time_seconds?: number | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
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
