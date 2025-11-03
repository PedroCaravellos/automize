import { supabase } from '@/integrations/supabase/client';

export interface Negocio {
  id: string;
  user_id: string;
  nome: string;
  tipo_negocio?: string;
  segmento?: string;
  unidade?: string;
  endereco?: string;
  telefone?: string;
  whatsapp?: string;
  horario_funcionamento?: string;
  servicos_oferecidos?: string[];
  promocoes?: string;
  diferenciais?: string;
  valores?: any;
  created_at?: string;
  updated_at?: string;
}

export const negociosService = {
  async getAll(userId: string): Promise<Negocio[]> {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Negocio | null> {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(negocio: Partial<Negocio>): Promise<Negocio> {
    const { data, error } = await supabase
      .from('negocios')
      .insert([negocio as any])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Negocio>): Promise<Negocio> {
    const { data, error } = await supabase
      .from('negocios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('negocios')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
