import { supabase } from "@/integrations/supabase/client";
import { NegocioItem, ChatbotItem, LeadItem, AutomacaoItem } from "@/types";

export class BusinessService {
  // ============= Negócios =============
  static async fetchNegocios(userId: string) {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('user_id', userId);
    
    return { data, error };
  }

  static async createNegocio(negocio: Partial<NegocioItem>) {
    const { data, error } = await supabase
      .from('negocios')
      .insert([negocio as any])
      .select()
      .single();
    
    return { data, error };
  }

  static async updateNegocio(id: string, updates: Partial<NegocioItem>) {
    const { data, error } = await supabase
      .from('negocios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async deleteNegocio(id: string) {
    const { error } = await supabase
      .from('negocios')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  // ============= Chatbots =============
  static async fetchChatbots(negocioIds: string[]) {
    if (negocioIds.length === 0) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .in('negocio_id', negocioIds);
    
    return { data, error };
  }

  static async createChatbot(chatbot: Partial<ChatbotItem>) {
    const { data, error } = await supabase
      .from('chatbots')
      .insert([chatbot as any])
      .select()
      .single();
    
    return { data, error };
  }

  static async updateChatbot(id: string, updates: Partial<ChatbotItem>) {
    const { data, error } = await supabase
      .from('chatbots')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async deleteChatbot(id: string) {
    const { error } = await supabase
      .from('chatbots')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  // ============= Leads =============
  static async fetchLeads(negocioIds: string[]) {
    if (negocioIds.length === 0) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .in('negocio_id', negocioIds);
    
    return { data, error };
  }

  static async createLead(lead: Partial<LeadItem>) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead as any])
      .select()
      .single();
    
    return { data, error };
  }

  static async updateLead(id: string, updates: Partial<LeadItem>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  // ============= Automações =============
  static async fetchAutomacoes(userId: string) {
    const { data, error } = await supabase
      .from('automacoes')
      .select('*')
      .eq('user_id', userId);
    
    return { data, error };
  }

  static async createAutomacao(automacao: Partial<AutomacaoItem>) {
    const { data, error } = await supabase
      .from('automacoes')
      .insert([automacao as any])
      .select()
      .single();
    
    return { data, error };
  }

  static async updateAutomacao(id: string, updates: Partial<AutomacaoItem>) {
    const { data, error } = await supabase
      .from('automacoes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async deleteAutomacao(id: string) {
    const { error } = await supabase
      .from('automacoes')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  // ============= Agendamentos =============
  static async fetchAgendamentos(negocioIds: string[]) {
    if (negocioIds.length === 0) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .in('negocio_id', negocioIds);
    
    return { data, error };
  }

  static async createAgendamento(agendamento: any) {
    const { data, error } = await supabase
      .from('agendamentos')
      .insert([agendamento])
      .select()
      .single();
    
    return { data, error };
  }

  static async updateAgendamento(id: string, updates: any) {
    const { data, error } = await supabase
      .from('agendamentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async deleteAgendamento(id: string) {
    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id);
    
    return { error };
  }
}
