import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types";

export class AuthService {
  static async signUp(email: string, password: string, name: string) {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });
    
    return { data, error };
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  }

  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    return { data, error };
  }

  static async fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error || !data) return null;
    
    // Map database fields to expected interface
    return {
      ...data,
      plano_ativo: data.plano !== 'trial' && data.plano !== null,
      nome_plano: data.plano !== 'trial' ? data.plano : null,
      trial_ativo: data.plano === 'trial' && data.trial_end_date 
        ? new Date(data.trial_end_date) > new Date() 
        : false,
      trial_fim_em: data.trial_end_date,
      name: data.nome
    };
  }

  static async updateProfile(userId: string, updates: Partial<Profile>) {
    // Map legacy fields to actual DB columns
    const dbUpdates: any = {};

    // Direct mappable fields
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.telefone !== undefined) dbUpdates.telefone = updates.telefone;
    if (updates.plano !== undefined) dbUpdates.plano = updates.plano;
    if (updates.trial_end_date !== undefined) dbUpdates.trial_end_date = updates.trial_end_date;

    // Legacy compatibility mapping
    if ('nome_plano' in updates) {
      dbUpdates.plano = updates.nome_plano || null;
      if (updates.nome_plano) dbUpdates.trial_end_date = null;
    }

    if ('plano_ativo' in updates) {
      if (!updates.plano_ativo && !('nome_plano' in updates)) {
        dbUpdates.plano = null;
      }
    }

    if ('trial_ativo' in updates) {
      if (updates.trial_ativo) {
        dbUpdates.plano = 'trial';
        if ('trial_fim_em' in updates) {
          dbUpdates.trial_end_date = updates.trial_fim_em;
        }
        if (!dbUpdates.trial_end_date) {
          const end = new Date();
          end.setDate(end.getDate() + 7);
          dbUpdates.trial_end_date = end.toISOString();
        }
      } else {
        dbUpdates.trial_end_date = null;
      }
    } else if ('trial_fim_em' in updates) {
      dbUpdates.trial_end_date = updates.trial_fim_em;
    }

    if (Object.keys(dbUpdates).length === 0) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('user_id', userId);

    return { data, error };
  }
}
