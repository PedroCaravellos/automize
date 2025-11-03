import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useOptimizedRealtime } from './useOptimizedRealtime';
import { agendamentosService } from '@/services/agendamentosService';

export function useAgendamentos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: agendamentos = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['agendamentos', user?.id],
    queryFn: () => (user?.id ? agendamentosService.getAll(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  useOptimizedRealtime({
    table: 'agendamentos',
    queryKey: ['agendamentos', user?.id],
    enabled: !!user?.id,
    filter: user?.id ? { column: 'user_id', value: user.id } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (newAgendamento: any) => agendamentosService.create({ ...newAgendamento, user_id: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos', user?.id] });
      toast({ title: 'Agendamento criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar agendamento', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => agendamentosService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos', user?.id] });
      toast({ title: 'Agendamento atualizado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => agendamentosService.delete(id),
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
