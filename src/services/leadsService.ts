import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: string;
  negocio_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  origem?: string;
  status?: string;
  pipeline_stage?: string;
  valor_estimado?: number;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export const leadsService = {
  async getAll(userId: string): Promise<Lead[]> {
    const result: any = (supabase as any)
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const { data, error } = await result;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(lead: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead as any])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async bulkUpdate(ids: string[], updates: Partial<Lead>): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update(updates)
      .in('id', ids);
    
    if (error) throw error;
  },

  async getByNegocioId(negocioId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByStatus(negocioId: string, status: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('negocio_id', negocioId)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByPipelineStage(negocioId: string, stage: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('negocio_id', negocioId)
      .eq('pipeline_stage', stage)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};
