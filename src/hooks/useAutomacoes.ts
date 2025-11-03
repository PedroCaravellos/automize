import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useOptimizedRealtime } from './useOptimizedRealtime';
import { automacoesService } from '@/services/automacoesService';

export function useAutomacoes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: automacoes = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['automacoes', user?.id],
    queryFn: () => (user?.id ? automacoesService.getAll(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  useOptimizedRealtime({
    table: 'automacoes',
    queryKey: ['automacoes', user?.id],
    enabled: !!user?.id,
    filter: user?.id ? { column: 'user_id', value: user.id } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (newAutomacao: any) => automacoesService.create({ ...newAutomacao, user_id: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes', user?.id] });
      toast({ title: 'Automação criada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar automação', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => automacoesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes', user?.id] });
      toast({ title: 'Automação atualizada!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => automacoesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes', user?.id] });
      toast({ title: 'Automação deletada!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => automacoesService.toggle(id, ativo),
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
