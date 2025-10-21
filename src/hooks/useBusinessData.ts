import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BusinessService } from '@/services/businessService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { NegocioItem, ChatbotItem, LeadItem, AutomacaoItem } from '@/types';

// Query Keys
export const businessKeys = {
  all: ['business'] as const,
  negocios: (userId: string) => [...businessKeys.all, 'negocios', userId] as const,
  chatbots: (negocioIds: string[]) => [...businessKeys.all, 'chatbots', negocioIds] as const,
  leads: (negocioIds: string[]) => [...businessKeys.all, 'leads', negocioIds] as const,
  automacoes: (userId: string) => [...businessKeys.all, 'automacoes', userId] as const,
  agendamentos: (negocioIds: string[]) => [...businessKeys.all, 'agendamentos', negocioIds] as const,
};

// ============= Negócios =============
export function useNegocios() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: businessKeys.negocios(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await BusinessService.fetchNegocios(user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateNegocio() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (negocio: Partial<NegocioItem>) => 
      BusinessService.createNegocio(negocio),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: businessKeys.negocios(user?.id || '') 
      });
      toast({
        title: "Sucesso!",
        description: "Negócio criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar negócio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o negócio.",
        variant: "destructive",
      });
    }
  });
}

export function useUpdateNegocio() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<NegocioItem> }) =>
      BusinessService.updateNegocio(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: businessKeys.negocios(user?.id || '') 
      });
      toast({
        title: "Sucesso!",
        description: "Negócio atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar negócio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o negócio.",
        variant: "destructive",
      });
    }
  });
}

export function useDeleteNegocio() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (id: string) => BusinessService.deleteNegocio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: businessKeys.negocios(user?.id || '') 
      });
      toast({
        title: "Sucesso!",
        description: "Negócio removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao remover negócio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o negócio.",
        variant: "destructive",
      });
    }
  });
}

// ============= Chatbots =============
export function useChatbots(negocioIds: string[]) {
  return useQuery({
    queryKey: businessKeys.chatbots(negocioIds),
    queryFn: async () => {
      const { data, error } = await BusinessService.fetchChatbots(negocioIds);
      if (error) throw error;
      return data || [];
    },
    enabled: negocioIds.length > 0,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useCreateChatbot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (chatbot: Partial<ChatbotItem>) => 
      BusinessService.createChatbot(chatbot),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: businessKeys.chatbots([variables.negocio_id || '']) 
      });
      toast({
        title: "Sucesso!",
        description: "Chatbot criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar chatbot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o chatbot.",
        variant: "destructive",
      });
    }
  });
}

export function useUpdateChatbot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ChatbotItem> }) =>
      BusinessService.updateChatbot(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: businessKeys.all 
      });
      toast({
        title: "Sucesso!",
        description: "Chatbot atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar chatbot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o chatbot.",
        variant: "destructive",
      });
    }
  });
}

export function useDeleteChatbot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => BusinessService.deleteChatbot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: businessKeys.all 
      });
      toast({
        title: "Sucesso!",
        description: "Chatbot removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao remover chatbot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o chatbot.",
        variant: "destructive",
      });
    }
  });
}

// ============= Leads =============
export function useLeads(negocioIds: string[]) {
  return useQuery({
    queryKey: businessKeys.leads(negocioIds),
    queryFn: async () => {
      const { data, error } = await BusinessService.fetchLeads(negocioIds);
      if (error) throw error;
      return data || [];
    },
    enabled: negocioIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lead: Partial<LeadItem>) => 
      BusinessService.createLead(lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: businessKeys.all 
      });
      toast({
        title: "Sucesso!",
        description: "Lead criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead.",
        variant: "destructive",
      });
    }
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LeadItem> }) =>
      BusinessService.updateLead(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: businessKeys.all 
      });
      toast({
        title: "Sucesso!",
        description: "Lead atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lead.",
        variant: "destructive",
      });
    }
  });
}

// ============= Automações =============
export function useAutomacoes() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: businessKeys.automacoes(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await BusinessService.fetchAutomacoes(user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============= Agendamentos =============
export function useAgendamentos(negocioIds: string[]) {
  return useQuery({
    queryKey: businessKeys.agendamentos(negocioIds),
    queryFn: async () => {
      const { data, error } = await BusinessService.fetchAgendamentos(negocioIds);
      if (error) throw error;
      return data || [];
    },
    enabled: negocioIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
