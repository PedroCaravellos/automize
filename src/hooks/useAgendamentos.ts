import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useOptimizedRealtime } from './useOptimizedRealtime';

async function fetchAgendamentos(userId: string): Promise<any[]> {
  const result: any = (supabase as any)
    .from('agendamentos')
    .select('*')
    .eq('user_id', userId)
    .order('data_hora', { ascending: true });
  
  const { data, error } = await result;
  if (error) throw error;
  return data || [];
}

export function useAgendamentos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: agendamentos = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['agendamentos', user?.id],
    queryFn: () => (user?.id ? fetchAgendamentos(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  useOptimizedRealtime({
    table: 'agendamentos',
    queryKey: ['agendamentos', user?.id],
    enabled: !!user?.id,
    filter: user?.id ? { column: 'user_id', value: user.id } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: async (newAgendamento: any) => {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert([{ ...newAgendamento, user_id: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos', user?.id] });
      toast({ title: 'Agendamento criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar agendamento', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('agendamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos', user?.id] });
      toast({ title: 'Agendamento atualizado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agendamentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos', user?.id] });
      toast({ title: 'Agendamento deletado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
    },
  });

  return {
    agendamentos,
    isLoading,
    error,
    createAgendamento: createMutation.mutateAsync,
    updateAgendamento: updateMutation.mutateAsync,
    deleteAgendamento: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
