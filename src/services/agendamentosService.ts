import { supabase } from '@/integrations/supabase/client';

export interface Agendamento {
  id: string;
  negocio_id: string;
  cliente_nome: string;
  cliente_telefone?: string;
  cliente_email?: string;
  servico: string;
  data_hora: string;
  status?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export const agendamentosService = {
  async getAll(userId: string): Promise<Agendamento[]> {
    const result: any = (supabase as any)
      .from('agendamentos')
      .select('*')
      .eq('user_id', userId)
      .order('data_hora', { ascending: true });
    
    const { data, error } = await result;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Agendamento | null> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(agendamento: Partial<Agendamento>): Promise<Agendamento> {
    const { data, error } = await supabase
      .from('agendamentos')
      .insert([agendamento as any])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Agendamento>): Promise<Agendamento> {
    const { data, error } = await supabase
      .from('agendamentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getByNegocioId(negocioId: string): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('data_hora', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getByDateRange(negocioId: string, startDate: string, endDate: string): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('negocio_id', negocioId)
      .gte('data_hora', startDate)
      .lte('data_hora', endDate)
      .order('data_hora', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
};
