import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { Workflow, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRealtimeTable } from "@/hooks/useOptimizedRealtime";
import AutomationModal from "./AutomationModal";
import AutomationExecutionsTable from "./AutomationExecutionsTable";
import { AutomacoesSectionHeader } from "./automacoes/AutomacoesSectionHeader";
import { AutomacoesMetrics } from "./automacoes/AutomacoesMetrics";
import { AutomacoesAICreator } from "./automacoes/AutomacoesAICreator";
import { AutomacoesList } from "./automacoes/AutomacoesList";

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
  const [nlDescription, setNlDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { negocios, hasAccess, user } = useAuth();

  const waitForPropagation = () => new Promise(resolve => setTimeout(resolve, 200));

  const fetchAutomacoes = useCallback(async () => {
    try {
      // Ensure we have a valid session before making requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('automacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAutomacoes(data as Automacao[] || []);
    } catch (error) {
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
    return trigger;
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

  const handleGenerateFromNL = async () => {
    if (!nlDescription.trim()) {
      toast({
        title: "Descrição vazia",
        description: "Descreva o que você quer automatizar.",
        variant: "destructive",
      });
      return;
    }

    if (negocios.length === 0) {
      toast({
        title: "Nenhum negócio cadastrado",
        description: "Crie um negócio primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      const { data, error } = await supabase.functions.invoke('generate-automation', {
        body: {
          description: nlDescription,
          negocioInfo: {
            nome: negocios[0].nome,
            segmento: negocios[0].segmento,
            tipo: (negocios[0] as any).tipo_negocio || 'outros',
          }
        }
      });

      if (error) throw error;
      if (!data?.automation) throw new Error('Falha ao gerar automação');

      const automation = data.automation;
      const automacaoData = {
        user_id: user?.id,
        negocio_id: negocios[0].id,
        nome: automation.nome,
        descricao: automation.descricao,
        trigger_type: automation.trigger_type,
        trigger_config: automation.trigger_config,
        actions: automation.actions,
        ativo: false,
      };

      const { error: insertError } = await supabase
        .from('automacoes')
        .insert([automacaoData]);

      if (insertError) throw insertError;

      toast({
        title: "✨ Automação criada com IA!",
        description: "Revise e ative quando estiver pronta.",
      });

      setNlDescription('');
      await waitForPropagation();
      await fetchAutomacoes();

    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar a automação.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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
      toast({
        title: "Erro",
        description: "Não foi possível excluir a automação.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} lines={4} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AutomacoesSectionHeader 
        onNovaAutomacao={handleNovaAutomacao}
        onCriarExemplo={criarAutomacaoExemplo}
      />

      <AutomacoesAICreator 
        onGenerate={handleGenerateFromNL}
        isGenerating={isGenerating}
      />

      <AutomacoesMetrics 
        total={automacoes.length}
        ativas={automacoes.filter(a => a.ativo).length}
        inativas={automacoes.filter(a => !a.ativo).length}
        execucoes={0}
      />

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
          <AutomacoesList 
            automacoes={automacoes}
            onToggle={toggleAutomacao}
            onEdit={handleEditAutomacao}
            onDelete={handleDeleteAutomacao}
            getNegocioNome={getNegocioNome}
          />
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