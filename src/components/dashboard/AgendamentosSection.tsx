import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonMetricCard } from "@/components/ui/skeleton-metric-card";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRealtimeTable } from "@/hooks/useOptimizedRealtime";
import NovoAgendamentoModal from "./NovoAgendamentoModal";
import EditAgendamentoModal from "./EditAgendamentoModal";
import { AgendamentosSectionHeader } from "./agendamentos/AgendamentosSectionHeader";
import { AgendamentosMetrics } from "./agendamentos/AgendamentosMetrics";
import { AgendamentosList } from "./agendamentos/AgendamentosList";

interface Agendamento {
  id: string;
  negocio_id: string;
  cliente_nome: string;
  cliente_telefone?: string;
  cliente_email?: string;
  data_hora: string;
  servico: string;
  observacoes?: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado';
  created_at: string;
}

export default function AgendamentosSection() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  const [negociosDb, setNegociosDb] = useState<NegocioShort[]>([]);
  const { negocios, hasAccess, agendamentosDemo, removeAgendamentoDemo } = useAuth();

  const waitForPropagation = () => new Promise(resolve => setTimeout(resolve, 200));

  const fetchAgendamentos = useCallback(async () => {
    try {
      // Ensure we have a valid session before making requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .order('data_hora', { ascending: true });

      if (error) throw error;
      setAgendamentos((data as Agendamento[]) || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchNegocios = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('negocios')
        .select('id, nome, unidade');
      if (error) throw error;
      setNegociosDb((data as NegocioShort[]) || []);
    } catch (error) {
      console.error('Erro ao buscar negócios:', error);
    }
  }, []);

  useEffect(() => {
    fetchAgendamentos();
    fetchNegocios();
  }, [fetchAgendamentos, fetchNegocios]);

  // Real-time sync
  useRealtimeTable('agendamentos', fetchAgendamentos);

  const getNegocioNome = (negocioId: string) => {
    const nDb = negociosDb.find(n => n.id === negocioId);
    if (nDb) return `${nDb.nome}${nDb.unidade ? ' - ' + nDb.unidade : ''}`;
    const nLocal = negocios.find(n => n.id === negocioId);
    return nLocal ? `${nLocal.nome}${nLocal.unidade ? ' - ' + nLocal.unidade : ''}` : 'Negócio não encontrado';
  };

  const handleDeleteAgendamento = async (agendamento: any) => {
    if (confirm(`Tem certeza que deseja excluir o agendamento de ${agendamento.cliente_nome}?`)) {
      if ((agendamento as any).isDemo) {
        removeAgendamentoDemo(agendamento.id);
        toast({
          title: "Agendamento excluído",
          description: "O agendamento de demonstração foi removido com sucesso.",
        });
      } else {
        try {
          const { error } = await supabase
            .from('agendamentos')
            .delete()
            .eq('id', agendamento.id);

          if (error) {
            throw error;
          }

          toast({
            title: "Agendamento excluído",
            description: "O agendamento foi removido com sucesso.",
          });
          
          await waitForPropagation();
          await fetchAgendamentos();
        } catch (error) {
          toast({
            title: "Erro ao excluir",
            description: "Não foi possível excluir o agendamento.",
            variant: "destructive"
          });
        }
      }
    }
  };

  const handleEditAgendamento = (agendamento: any) => {
    // Don't allow editing demo agendamentos
    if ((agendamento as any).isDemo) {
      toast({
        title: "Não é possível editar",
        description: "Agendamentos de demonstração não podem ser editados.",
        variant: "destructive"
      });
      return;
    }
    
    if (!hasAccess()) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para editar agendamentos.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingAgendamento(agendamento);
    setEditModalOpen(true);
  };

interface NegocioShort {
  id: string;
  nome: string;
  unidade: string | null;
}

  // Combine real agendamentos with demo ones
  const todosAgendamentos = [
    ...agendamentos,
    ...agendamentosDemo.map(demo => ({
      ...demo,
      isDemo: true
    }))
  ].sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <SkeletonList items={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AgendamentosSectionHeader 
        onNovoAgendamento={() => setModalOpen(true)}
        hasAccess={hasAccess()}
      />

      <AgendamentosMetrics agendamentos={todosAgendamentos} />

      <AgendamentosList 
        agendamentos={todosAgendamentos}
        getNegocioNome={getNegocioNome}
        onEdit={handleEditAgendamento}
        onDelete={handleDeleteAgendamento}
        hasAccess={hasAccess()}
      />

      <NovoAgendamentoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAgendamentoCriado={fetchAgendamentos}
      />

      <EditAgendamentoModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        agendamento={editingAgendamento}
        onAgendamentoUpdated={fetchAgendamentos}
      />
    </div>
  );
}