import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useOptimizedRealtime } from './useOptimizedRealtime';

export function useAutomacoes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: automacoes = [], isLoading, error } = useQuery({
    queryKey: ['automacoes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('automacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  useOptimizedRealtime({
    table: 'automacoes',
    queryKey: ['automacoes', user?.id],
    enabled: !!user?.id,
    filter: user?.id ? { column: 'user_id', value: user.id } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: async (newAutomacao: any) => {
      const { data, error } = await supabase
        .from('automacoes')
        .insert([{ ...newAutomacao, user_id: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes', user?.id] });
      toast({ title: 'Automação criada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar automação', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('automacoes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes', user?.id] });
      toast({ title: 'Automação atualizada!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('automacoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes', user?.id] });
      toast({ title: 'Automação deletada!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { data, error } = await supabase
        .from('automacoes')
        .update({ ativo })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes', user?.id] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao alternar status', description: error.message, variant: 'destructive' });
    },
  });

  return {
    automacoes,
    isLoading,
    error,
    createAutomacao: createMutation.mutateAsync,
    updateAutomacao: updateMutation.mutateAsync,
    deleteAutomacao: deleteMutation.mutateAsync,
    toggleAutomacao: toggleMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
