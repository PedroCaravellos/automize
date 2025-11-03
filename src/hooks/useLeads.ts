import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useOptimizedRealtime } from './useOptimizedRealtime';

async function fetchLeads(userId: string): Promise<any[]> {
  const result: any = (supabase as any)
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  const { data, error } = await result;
  if (error) throw error;
  return data || [];
}

export function useLeads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['leads', user?.id],
    queryFn: () => (user?.id ? fetchLeads(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  useOptimizedRealtime({
    table: 'leads',
    queryKey: ['leads', user?.id],
    enabled: !!user?.id,
    filter: user?.id ? { column: 'user_id', value: user.id } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: async (newLead: any) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ ...newLead, user_id: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', user?.id] });
      toast({ title: 'Lead criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar lead', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', user?.id] });
      toast({ title: 'Lead atualizado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', user?.id] });
      toast({ title: 'Lead deletado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: any }) => {
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', user?.id] });
      toast({ title: 'Leads atualizados!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar leads', description: error.message, variant: 'destructive' });
    },
  });

  return {
    leads,
    isLoading,
    error,
    createLead: createMutation.mutateAsync,
    updateLead: updateMutation.mutateAsync,
    deleteLead: deleteMutation.mutateAsync,
    bulkUpdateLeads: bulkUpdateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
