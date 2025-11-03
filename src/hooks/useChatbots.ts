import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useOptimizedRealtime } from './useOptimizedRealtime';
import { chatbotsService } from '@/services/chatbotsService';

export function useChatbots() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: chatbots = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['chatbots', user?.id],
    queryFn: () => (user?.id ? chatbotsService.getAll(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  useOptimizedRealtime({
    table: 'chatbots',
    queryKey: ['chatbots', user?.id],
    enabled: !!user?.id,
    filter: user?.id ? { column: 'user_id', value: user.id } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (newChatbot: any) => chatbotsService.create({ ...newChatbot, user_id: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots', user?.id] });
      toast({ title: 'Chatbot criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar chatbot', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => chatbotsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots', user?.id] });
      toast({ title: 'Chatbot atualizado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => chatbotsService.delete(id),
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
