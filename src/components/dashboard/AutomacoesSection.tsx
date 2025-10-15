import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workflow, Plus, Zap, Clock, MessageSquare, Target, Calendar, Users, Activity, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import AutomationModal from "./AutomationModal";
import AutomationExecutionsTable from "./AutomationExecutionsTable";

interface Automacao {
  id: string;
  negocio_id: string;
  nome: string;
  descricao?: string;
  trigger_type: 'novo_lead' | 'agendamento' | 'follow_up' | 'tempo_decorrido';
  trigger_config: any;
  actions: any;
  ativo: boolean;
  created_at: string;
}

export default function AutomacoesSection() {
  const [automacoes, setAutomacoes] = useState<Automacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAutomacao, setSelectedAutomacao] = useState<Automacao | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("automacoes");
  const { negocios, hasAccess } = useAuth();

  const waitForPropagation = () => new Promise(resolve => setTimeout(resolve, 200));

  const fetchAutomacoes = useCallback(async () => {
    try {
      // Ensure we have a valid session before making requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No valid session found for automacoes');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('automacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar automações:', error);
        throw error;
      }
      
      setAutomacoes(data as Automacao[] || []);
    } catch (error) {
      console.error('Erro ao buscar automações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as automações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAutomacoes();
  }, [fetchAutomacoes]);

  // Real-time sync
  useRealtimeTable('automacoes', fetchAutomacoes);

  const toggleAutomacao = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('automacoes')
        .update({ ativo })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: ativo ? "Automação Ativada" : "Automação Desativada",
        description: `A automação foi ${ativo ? 'ativada' : 'desativada'} com sucesso.`,
      });

      await waitForPropagation();
      await fetchAutomacoes();
    } catch (error) {
      console.error('Erro ao atualizar automação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a automação.",
        variant: "destructive",
      });
    }
  };

  const getNegocioNome = (negocioId: string) => {
    const negocio = negocios.find(n => n.id === negocioId);
    return negocio ? `${negocio.nome}${negocio.unidade ? ' - ' + negocio.unidade : ''}` : 'Negócio não encontrado';
  };

  const getTriggerIcon = (trigger: string) => {
    const icons = {
      novo_lead: Users,
      agendamento: Calendar,
      follow_up: MessageSquare,
      tempo_decorrido: Clock,
    };
    return icons[trigger as keyof typeof icons] || Zap;
  };

  const getTriggerLabel = (trigger: string) => {
    const labels = {
      novo_lead: 'Novo Lead',
      agendamento: 'Agendamento',
      follow_up: 'Follow-up',
      tempo_decorrido: 'Tempo Decorrido',
    };
    return labels[trigger as keyof typeof labels] || trigger;
  };

  const criarAutomacaoExemplo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Sessão inválida",
          description: "Entre para criar automações.",
          variant: "destructive",
        });
        return;
      }

      // Buscar primeiro negócio do usuário
      const { data: negociosData } = await supabase
        .from('negocios')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!negociosData) {
        toast({
          title: "Nenhum Negócio",
          description: "Crie um negócio primeiro para poder criar automações funcionais.",
          variant: "destructive",
        });
        return;
      }

      // Evitar duplicatas do template por nome + negócio
      const { data: existente } = await supabase
        .from('automacoes')
        .select('id')
        .eq('negocio_id', negociosData.id)
        .eq('nome', 'Welcome Follow-up')
        .maybeSingle();

      if (existente) {
        toast({
          title: "Já existe",
          description: "O template de exemplo já existe para este negócio.",
        });
        return;
      }

      const exemploAutomacao = {
        user_id: session.user.id,
        negocio_id: negociosData.id,
        nome: "Welcome Follow-up",
        descricao: "Enviar mensagem de boas-vindas 1 hora após o primeiro contato",
        trigger_type: 'novo_lead',
        trigger_config: {
          delay_hours: 1,
          conditions: []
        },
        actions: {
          send_message: {
            template: "Olá {nome}! Obrigado pelo interesse em nosso negócio. Em breve entraremos em contato!",
            channel: "whatsapp"
          }
        },
        ativo: true
      };

      const { error } = await supabase
        .from('automacoes')
        .insert([exemploAutomacao as any]);

      if (error) throw error;

      toast({
        title: "Automação Criada",
        description: "Automação de exemplo criada com sucesso! (Só funcionará após integração com WhatsApp)",
      });

      await waitForPropagation();
      await fetchAutomacoes();
    } catch (error) {
      console.error('Erro ao criar automação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a automação.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAutomacao = async (data: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Sessão inválida",
          description: "Entre para salvar automações.",
          variant: "destructive",
        });
        return;
      }

      if (selectedAutomacao) {
        // Atualizar
        const { error } = await supabase
          .from('automacoes')
          .update(data as any)
          .eq('id', selectedAutomacao.id);

        if (error) throw error;

        toast({
          title: "Automação Atualizada",
          description: "Automação atualizada com sucesso!",
        });
      } else {
        // Criar nova
        const { error } = await supabase
          .from('automacoes')
          .insert([{ ...data, ativo: true, user_id: session.user.id } as any]);

        if (error) throw error;

        toast({
          title: "Automação Criada",
          description: "Automação criada com sucesso!",
        });
      }

      setModalOpen(false);
      setSelectedAutomacao(undefined);
      
      await waitForPropagation();
      await fetchAutomacoes();
    } catch (error) {
      console.error('Erro ao salvar automação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a automação.",
        variant: "destructive",
      });
    }
  };

  const handleEditAutomacao = (automacao: Automacao) => {
    setSelectedAutomacao(automacao);
    setModalOpen(true);
  };

  const handleNovaAutomacao = async () => {
    // Verificar se existe pelo menos um negócio no banco
    const { data: negociosData } = await supabase
      .from('negocios')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (!negociosData) {
      toast({
        title: "Nenhum Negócio Cadastrado",
        description: "Você precisa criar um negócio primeiro na aba 'Meus Negócios'.",
        variant: "destructive",
      });
      return;
    }

    setSelectedAutomacao(undefined);
    setModalOpen(true);
  };

  const handleDeleteAutomacao = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a automação "${nome}"?`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Garantir ownership para passar na política de DELETE
      if (session?.user?.id) {
        await supabase
          .from('automacoes')
          .update({ user_id: session.user.id } as any)
          .eq('id', id);
      }

      const { error } = await supabase
        .from('automacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Automação Excluída",
        description: "A automação foi excluída com sucesso.",
      });

      await waitForPropagation();
      await fetchAutomacoes();
    } catch (error) {
      console.error('Erro ao excluir automação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a automação.",
        variant: "destructive",
      });
    }
  };

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
          <h2 className="text-2xl font-bold">Automações</h2>
          <p className="text-muted-foreground">Configure fluxos automáticos para leads e clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={criarAutomacaoExemplo}>
            <Target className="mr-2 h-4 w-4" />
            Criar Exemplo
          </Button>
          <Button onClick={handleNovaAutomacao}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Automação
          </Button>
        </div>
      </div>

      {/* Status das Automações */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automacoes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {automacoes.filter(a => a.ativo).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {automacoes.filter(a => !a.ativo).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Automações e Execuções */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="automacoes">
            <Workflow className="mr-2 h-4 w-4" />
            Automações
          </TabsTrigger>
          <TabsTrigger value="execucoes">
            <Activity className="mr-2 h-4 w-4" />
            Execuções
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automacoes" className="space-y-6">
          {/* Lista de Automações */}
          <Card>
            <CardHeader>
              <CardTitle>Suas Automações</CardTitle>
            </CardHeader>
            <CardContent>
          {automacoes.length === 0 ? (
              <div className="text-center py-8">
                <Workflow className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Nenhuma automação configurada</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crie sua primeira automação para testar o construtor visual de fluxos.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  (As automações só funcionarão após integração com WhatsApp Business)
                </p>
                <Button 
                  className="mt-4" 
                  onClick={criarAutomacaoExemplo}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Automação de Exemplo
                </Button>
              </div>
          ) : (
            <div className="space-y-4">
              {automacoes.map((automacao) => {
                const TriggerIcon = getTriggerIcon(automacao.trigger_type);
                return (
                  <div key={automacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <TriggerIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{automacao.nome}</h4>
                          <Badge variant={automacao.ativo ? "default" : "secondary"}>
                            {automacao.ativo ? "Ativa" : "Inativa"}
                          </Badge>
                          <Badge variant="outline">
                            {getTriggerLabel(automacao.trigger_type)}
                          </Badge>
                        </div>
                        {automacao.descricao && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {automacao.descricao}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {getNegocioNome(automacao.negocio_id)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automacao.ativo}
                        onCheckedChange={(checked) => toggleAutomacao(automacao.id, checked)}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditAutomacao(automacao)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteAutomacao(automacao.id, automacao.nome)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
            </CardContent>
          </Card>

          {/* Templates de Automação */}
          <Card>
        <CardHeader>
          <CardTitle>Templates Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Follow-up de Leads</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Envie mensagens automáticas para leads que não responderam
              </p>
              <Button variant="outline" size="sm" disabled>
                Em breve
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Lembrete de Aula</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Envie lembretes automáticos para agendamentos
              </p>
              <Button variant="outline" size="sm" disabled>
                Em breve
              </Button>
            </div>
          </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execucoes">
          <AutomationExecutionsTable />
        </TabsContent>
      </Tabs>

      {/* Modal de Criação/Edição */}
      <AutomationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        automacao={selectedAutomacao}
        onSave={handleSaveAutomacao}
      />
    </div>
  );
}