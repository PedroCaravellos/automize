import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Workflow, Plus, Zap, Clock, MessageSquare, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Automacao {
  id: string;
  academia_id: string;
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
  const { academias, hasAccess } = useAuth();

  useEffect(() => {
    fetchAutomacoes();
  }, []);

  const fetchAutomacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('automacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomacoes((data as Automacao[]) || []);
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
  };

  const toggleAutomacao = async (id: string, ativo: boolean) => {
    if (!hasAccess()) {
      toast({
        title: "Acesso Restrito",
        description: "Faça upgrade do seu plano para usar automações.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('automacoes')
        .update({ ativo })
        .eq('id', id);

      if (error) throw error;

      setAutomacoes(prev => 
        prev.map(auto => 
          auto.id === id ? { ...auto, ativo } : auto
        )
      );

      toast({
        title: ativo ? "Automação Ativada" : "Automação Desativada",
        description: `A automação foi ${ativo ? 'ativada' : 'desativada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar automação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a automação.",
        variant: "destructive",
      });
    }
  };

  const getAcademiaNome = (academiaId: string) => {
    const academia = academias.find(a => a.id === academiaId);
    return academia ? `${academia.nome} - ${academia.unidade}` : 'Academia não encontrada';
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
    if (!hasAccess()) {
      toast({
        title: "Acesso Restrito",
        description: "Faça upgrade do seu plano para criar automações.",
        variant: "destructive",
      });
      return;
    }

    if (academias.length === 0) {
      toast({
        title: "Nenhuma Academia",
        description: "Crie uma academia primeiro para usar automações.",
        variant: "destructive",
      });
      return;
    }

    try {
      const exemploAutomacao = {
        academia_id: academias[0].id,
        nome: "Welcome Follow-up",
        descricao: "Enviar mensagem de boas-vindas 1 hora após o primeiro contato",
        trigger_type: 'novo_lead',
        trigger_config: {
          delay_hours: 1,
          conditions: []
        },
        actions: {
          send_message: {
            template: "Olá {nome}! Obrigado pelo interesse em nossa academia. Em breve entraremos em contato!",
            channel: "whatsapp"
          }
        },
        ativo: true
      };

      const { error } = await supabase
        .from('automacoes')
        .insert([exemploAutomacao]);

      if (error) throw error;

      await fetchAutomacoes();
      toast({
        title: "Automação Criada",
        description: "Automação de exemplo criada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar automação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a automação.",
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
          <Button variant="outline" onClick={criarAutomacaoExemplo} disabled={!hasAccess()}>
            <Target className="mr-2 h-4 w-4" />
            Exemplo
          </Button>
          <Button disabled={!hasAccess()}>
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
                Crie sua primeira automação para melhorar o engajamento com leads.
              </p>
              <Button 
                className="mt-4" 
                onClick={criarAutomacaoExemplo}
                disabled={!hasAccess()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Automação
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
                          {getAcademiaNome(automacao.academia_id)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automacao.ativo}
                        onCheckedChange={(checked) => toggleAutomacao(automacao.id, checked)}
                        disabled={!hasAccess()}
                      />
                      <Button variant="ghost" size="sm" disabled={!hasAccess()}>
                        Editar
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
              <Button variant="outline" size="sm" disabled={!hasAccess()}>
                Usar Template
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
              <Button variant="outline" size="sm" disabled={!hasAccess()}>
                Usar Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Importações faltantes para o componente funcionar
import { Calendar, Users } from "lucide-react";