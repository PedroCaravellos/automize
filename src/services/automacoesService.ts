import { supabase } from '@/integrations/supabase/client';

export interface Automacao {
  id: string;
  negocio_id: string;
  user_id?: string;
  nome: string;
  descricao?: string;
  trigger_type: string;
  trigger_config?: any;
  actions?: any;
  ativo?: boolean;
  ativa?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const automacoesService = {
  async getAll(userId: string): Promise<Automacao[]> {
    const result: any = (supabase as any)
      .from('automacoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const { data, error } = await result;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Automacao | null> {
    const { data, error } = await supabase
      .from('automacoes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(automacao: Partial<Automacao>): Promise<Automacao> {
    const { data, error } = await supabase
      .from('automacoes')
      .insert([automacao as any])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Automacao>): Promise<Automacao> {
    const { data, error } = await supabase
      .from('automacoes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('automacoes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggle(id: string, ativo: boolean): Promise<Automacao> {
    const { data, error } = await supabase
      .from('automacoes')
      .update({ ativo, ativa: ativo })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByNegocioId(negocioId: string): Promise<Automacao[]> {
    const { data, error } = await supabase
      .from('automacoes')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};
