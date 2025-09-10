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
      academias: {
        Row: {
          created_at: string
          diferenciais: string | null
          endereco: string | null
          horario_funcionamento: string | null
          id: string
          modalidades: string[] | null
          nome: string
          promocoes: string | null
          telefone: string | null
          unidade: string | null
          updated_at: string
          user_id: string
          valores: Json | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          diferenciais?: string | null
          endereco?: string | null
          horario_funcionamento?: string | null
          id?: string
          modalidades?: string[] | null
          nome: string
          promocoes?: string | null
          telefone?: string | null
          unidade?: string | null
          updated_at?: string
          user_id: string
          valores?: Json | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          diferenciais?: string | null
          endereco?: string | null
          horario_funcionamento?: string | null
          id?: string
          modalidades?: string[] | null
          nome?: string
          promocoes?: string | null
          telefone?: string | null
          unidade?: string | null
          updated_at?: string
          user_id?: string
          valores?: Json | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      agendamentos: {
        Row: {
          academia_id: string
          cliente_email: string | null
          cliente_nome: string
          cliente_telefone: string | null
          created_at: string
          data_hora: string
          id: string
          observacoes: string | null
          servico: string
          status: string | null
          updated_at: string
        }
        Insert: {
          academia_id: string
          cliente_email?: string | null
          cliente_nome: string
          cliente_telefone?: string | null
          created_at?: string
          data_hora: string
          id?: string
          observacoes?: string | null
          servico: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          academia_id?: string
          cliente_email?: string | null
          cliente_nome?: string
          cliente_telefone?: string | null
          created_at?: string
          data_hora?: string
          id?: string
          observacoes?: string | null
          servico?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
        ]
      }
      automacoes: {
        Row: {
          academia_id: string
          actions: Json | null
          ativo: boolean | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          academia_id: string
          actions?: Json | null
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          academia_id?: string
          actions?: Json | null
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automacoes_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          academia_id: string
          ativo: boolean | null
          created_at: string
          id: string
          instrucoes: string | null
          nome: string
          personalidade: string | null
          updated_at: string
        }
        Insert: {
          academia_id: string
          ativo?: boolean | null
          created_at?: string
          id?: string
          instrucoes?: string | null
          nome: string
          personalidade?: string | null
          updated_at?: string
        }
        Update: {
          academia_id?: string
          ativo?: boolean | null
          created_at?: string
          id?: string
          instrucoes?: string | null
          nome?: string
          personalidade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbots_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          academia_id: string
          created_at: string
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          origem: string | null
          status: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          academia_id: string
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          origem?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          academia_id?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string | null
          plano: string | null
          telefone: string | null
          trial_end_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          plano?: string | null
          telefone?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          plano?: string | null
          telefone?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendas: {
        Row: {
          academia_id: string
          cliente_nome: string
          created_at: string
          data_venda: string | null
          id: string
          lead_id: string | null
          plano: string | null
          status: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          academia_id: string
          cliente_nome: string
          created_at?: string
          data_venda?: string | null
          id?: string
          lead_id?: string | null
          plano?: string | null
          status?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          academia_id?: string
          cliente_nome?: string
          created_at?: string
          data_venda?: string | null
          id?: string
          lead_id?: string | null
          plano?: string | null
          status?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
