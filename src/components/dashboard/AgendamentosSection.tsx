import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Clock, User, Phone, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import NovoAgendamentoModal from "./NovoAgendamentoModal";
import EditAgendamentoModal from "./EditAgendamentoModal";

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

  useEffect(() => {
    fetchAgendamentos();
    fetchNegocios();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      // Ensure we have a valid session before making requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No valid session found for agendamentos');
        return;
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .order('data_hora', { ascending: true });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        throw error;
      }
      setAgendamentos((data as Agendamento[]) || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNegocios = async () => {
    try {
      const { data, error } = await supabase
        .from('negocios')
        .select('id, nome, unidade');
      if (error) throw error;
      setNegociosDb((data as NegocioShort[]) || []);
    } catch (error) {
      console.error('Erro ao buscar negócios:', error);
    }
  };

  const getNegocioNome = (negocioId: string) => {
    const nDb = negociosDb.find(n => n.id === negocioId);
    if (nDb) return `${nDb.nome}${nDb.unidade ? ' - ' + nDb.unidade : ''}`;
    const nLocal = negocios.find(n => n.id === negocioId);
    return nLocal ? `${nLocal.nome}${nLocal.unidade ? ' - ' + nLocal.unidade : ''}` : 'Negócio não encontrado';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      agendado: 'bg-blue-100 text-blue-800',
      confirmado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
      realizado: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

          // Refresh the list
          fetchAgendamentos();
          
          toast({
            title: "Agendamento excluído",
            description: "O agendamento foi removido com sucesso.",
          });
        } catch (error) {
          console.error('Error deleting appointment:', error);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agendamentos</h2>
          <p className="text-muted-foreground">Gerencie agendamentos e consultas</p>
        </div>
        <Button 
          disabled={!hasAccess()} 
          onClick={() => setModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Resumo dos Agendamentos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todosAgendamentos.filter(a => {
                const today = new Date().toDateString();
                const agendDate = new Date(a.data_hora).toDateString();
                return today === agendDate && a.status !== 'cancelado';
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todosAgendamentos.filter(a => {
                const now = new Date();
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                const agendDate = new Date(a.data_hora);
                return agendDate >= now && agendDate <= weekFromNow && a.status !== 'cancelado';
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todosAgendamentos.filter(a => a.status === 'confirmado').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realizados</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todosAgendamentos.filter(a => a.status === 'realizado').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {todosAgendamentos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Nenhum agendamento</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comece criando seu primeiro agendamento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todosAgendamentos.slice(0, 10).map((agendamento) => (
                <div key={agendamento.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{agendamento.cliente_nome}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(agendamento.status)}`}>
                        {agendamento.status}
                      </span>
                      {(agendamento as any).isDemo && (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{agendamento.servico}</p>
                    <p className="text-sm text-muted-foreground">
                      {getNegocioNome(agendamento.negocio_id)}
                    </p>
                    {agendamento.cliente_telefone && (
                      <p className="text-sm text-muted-foreground">
                        📞 {agendamento.cliente_telefone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-medium">{formatDate(agendamento.data_hora)}</p>
                      {agendamento.observacoes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {agendamento.observacoes}
                        </p>
                      )}
                    </div>
                    {!(agendamento as any).isDemo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAgendamento(agendamento)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        disabled={!hasAccess()}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAgendamento(agendamento)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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