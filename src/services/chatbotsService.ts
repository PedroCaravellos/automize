import { supabase } from '@/integrations/supabase/client';

export interface Chatbot {
  id: string;
  negocio_id: string;
  nome: string;
  personalidade?: string;
  instrucoes?: string;
  template?: string;
  status?: string;
  ativo?: boolean;
  mensagens?: any;
  interacoes?: number;
  created_at?: string;
  updated_at?: string;
}

export const chatbotsService = {
  async getAll(userId: string): Promise<Chatbot[]> {
    const result: any = (supabase as any)
      .from('chatbots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const { data, error } = await result;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Chatbot | null> {
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(chatbot: Partial<Chatbot>): Promise<Chatbot> {
    const { data, error } = await supabase
      .from('chatbots')
      .insert([chatbot as any])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Chatbot>): Promise<Chatbot> {
    const { data, error } = await supabase
      .from('chatbots')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('chatbots')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getByNegocioId(negocioId: string): Promise<Chatbot[]> {
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};
