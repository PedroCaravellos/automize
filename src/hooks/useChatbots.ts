import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useOptimizedRealtime } from './useOptimizedRealtime';

async function fetchChatbots(userId: string): Promise<any[]> {
  const result: any = (supabase as any)
    .from('chatbots')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  const { data, error } = await result;
  if (error) throw error;
  return data || [];
}

export function useChatbots() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: chatbots = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['chatbots', user?.id],
    queryFn: () => (user?.id ? fetchChatbots(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  useOptimizedRealtime({
    table: 'chatbots',
    queryKey: ['chatbots', user?.id],
    enabled: !!user?.id,
    filter: user?.id ? { column: 'user_id', value: user.id } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: async (newChatbot: any) => {
      const result: any = await supabase
        .from('chatbots')
        .insert([{ ...newChatbot, user_id: user?.id }])
        .select()
        .single();
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots', user?.id] });
      toast({ title: 'Chatbot criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar chatbot', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const result: any = await supabase
        .from('chatbots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots', user?.id] });
      toast({ title: 'Chatbot atualizado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result: any = await supabase.from('chatbots').delete().eq('id', id);
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots', user?.id] });
      toast({ title: 'Chatbot deletado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
    },
  });

  return {
    chatbots,
    isLoading,
    error,
    createChatbot: createMutation.mutateAsync,
    updateChatbot: updateMutation.mutateAsync,
    deleteChatbot: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
