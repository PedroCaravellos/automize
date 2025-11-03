import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useOptimizedRealtime } from './useOptimizedRealtime';
import { leadsService } from '@/services/leadsService';

export function useLeads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['leads', user?.id],
    queryFn: () => (user?.id ? leadsService.getAll(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  useOptimizedRealtime({
    table: 'leads',
    queryKey: ['leads', user?.id],
    enabled: !!user?.id,
    filter: user?.id ? { column: 'user_id', value: user.id } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (newLead: any) => leadsService.create({ ...newLead, user_id: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', user?.id] });
      toast({ title: 'Lead criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar lead', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => leadsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', user?.id] });
      toast({ title: 'Lead atualizado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', user?.id] });
      toast({ title: 'Lead deletado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: any }) => leadsService.bulkUpdate(ids, updates),
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
