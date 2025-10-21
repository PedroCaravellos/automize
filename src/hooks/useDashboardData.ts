import { useMemo } from 'react';
import { useNegocios, useChatbots, useLeads, useAutomacoes, useAgendamentos } from './useBusinessData';

/**
 * Hook centralizado para buscar todos os dados do dashboard
 * Usa React Query para cache e gerenciamento de estado
 */
export function useDashboardData() {
  // Fetch negócios primeiro
  const { 
    data: negocios = [], 
    isLoading: negociosLoading,
    error: negociosError 
  } = useNegocios();

  // Extrair IDs dos negócios
  const negocioIds = useMemo(
    () => negocios.map(n => n.id),
    [negocios]
  );

  // Fetch dados dependentes (paralelo)
  const { 
    data: chatbots = [], 
    isLoading: chatbotsLoading 
  } = useChatbots(negocioIds);

  const { 
    data: leads = [], 
    isLoading: leadsLoading 
  } = useLeads(negocioIds);

  const { 
    data: automacoes = [], 
    isLoading: automacoesLoading 
  } = useAutomacoes();

  const { 
    data: agendamentos = [], 
    isLoading: agendamentosLoading 
  } = useAgendamentos(negocioIds);

  // Estados de loading e erro combinados
  const isLoading = negociosLoading || chatbotsLoading || leadsLoading || automacoesLoading || agendamentosLoading;
  const hasError = !!negociosError;

  // Métricas calculadas com memoização
  const metrics = useMemo(() => ({
    totalNegocios: negocios.length,
    totalChatbots: chatbots.length,
    chatbotsAtivos: chatbots.filter((c: any) => c.status === 'Ativo').length,
    totalLeads: leads.length,
    leadsNovos: leads.filter((l: any) => l.status === 'novo').length,
    totalAutomacoes: automacoes.length,
    automacoesAtivas: automacoes.filter((a: any) => a.ativa).length,
    totalAgendamentos: agendamentos.length,
    agendamentosHoje: agendamentos.filter((a: any) => {
      const hoje = new Date().toDateString();
      const dataAgendamento = new Date(a.data_hora).toDateString();
      return hoje === dataAgendamento;
    }).length,
  }), [negocios, chatbots, leads, automacoes, agendamentos]);

  return {
    // Dados brutos
    negocios,
    chatbots,
    leads,
    automacoes,
    agendamentos,
    negocioIds,
    
    // Estados
    isLoading,
    hasError,
    
    // Métricas computadas
    metrics,
  };
}
