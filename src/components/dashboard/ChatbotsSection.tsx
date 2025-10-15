import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { Bot, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { updateUserData } from "@/utils/userStorage";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import ChatbotWizard from "./ChatbotWizard";
import ChatbotTable from "./ChatbotTable";
import ChatbotEditModal from "./ChatbotEditModal";
import ActionBlockModal from "./ActionBlockModal";
import { ChatbotAnalytics } from "./ChatbotAnalytics";
import { ConversationHistory } from "./ConversationHistory";
import { NegocioItem } from "@/contexts/AuthContext";

export interface ChatbotTemplate {
  id: string;
  nome: string;
  descricao: string;
  mensagens: {
    boasVindas: string;
    faqs: { pergunta: string; resposta: string }[];
    encerramento: string;
  };
}

export interface Chatbot {
  id: string;
  nome: string;
  negocioId: string;
  template: string;
  status: "Em configuração" | "Ativo";
  interacoes: number;
  mensagens: {
    boasVindas: string;
    faqs: { pergunta: string; resposta: string }[];
    encerramento: string;
  };
  createdAt: string;
}

export interface AtividadeRecente {
  id: string;
  tipo: string;
  descricao: string;
  timestamp: string;
}

// Using global state from AuthContext; no props needed

const templates: ChatbotTemplate[] = [
  {
    id: "boas-vindas-faq",
    nome: "Boas-vindas + FAQ",
    descricao: "Atendimento básico com perguntas frequentes",
    mensagens: {
      boasVindas: "Olá! 👋 Bem-vindo(a) à nossa academia! Como posso ajudá-lo hoje?",
      faqs: [
        { pergunta: "Qual o horário de funcionamento?", resposta: "Funcionamos de segunda a sexta das 6h às 22h, e aos sábados das 8h às 18h." },
        { pergunta: "Como faço para me matricular?", resposta: "Você pode se matricular presencialmente na recepção ou pelo nosso WhatsApp. Precisará de RG, CPF e comprovante de residência." },
        { pergunta: "Quais modalidades vocês oferecem?", resposta: "Oferecemos musculação, aulas funcionais, spinning, pilates e natação. Consulte nossa grade de horários!" }
      ],
      encerramento: "Obrigado pelo contato! Se precisar de mais alguma coisa, estarei aqui para ajudar. 💪"
    }
  },
  {
    id: "agendamentos",
    nome: "Agendamentos simples",
    descricao: "Gestão básica de horários e reservas",
    mensagens: {
      boasVindas: "Olá! 📅 Gostaria de agendar um horário ou tirar dúvidas sobre nossa academia?",
      faqs: [
        { pergunta: "Como agendar uma aula?", resposta: "Você pode agendar através do nosso app ou presencialmente na recepção. As aulas têm limite de vagas." },
        { pergunta: "Posso cancelar um agendamento?", resposta: "Sim! Você pode cancelar até 2 horas antes do início da aula sem penalidades." },
        { pergunta: "E se a aula estiver lotada?", resposta: "Você pode entrar na lista de espera. Te avisaremos se abrir uma vaga!" }
      ],
      encerramento: "Seu agendamento é importante para nós! Qualquer dúvida, estarei aqui. 🏋️‍♀️"
    }
  },
  {
    id: "cobranca",
    nome: "Cobrança básica",
    descricao: "Esclarecimentos sobre pagamentos e planos",
    mensagens: {
      boasVindas: "Olá! 💳 Precisa de informações sobre pagamentos ou planos? Estou aqui para ajudar!",
      faqs: [
        { pergunta: "Quais formas de pagamento vocês aceitam?", resposta: "Aceitamos cartão de crédito, débito, PIX e boleto bancário. Parcelamento em até 12x no cartão." },
        { pergunta: "Como funciona o vencimento?", resposta: "A mensalidade vence todo dia 10. Após o vencimento, há 5 dias de tolerância antes da suspensão." },
        { pergunta: "Posso pausar minha matrícula?", resposta: "Sim! Você pode pausar por até 3 meses mediante apresentação de atestado médico." }
      ],
      encerramento: "Espero ter esclarecido suas dúvidas sobre pagamentos. Conte conosco! 💙"
    }
  }
];

const ChatbotsSection = () => {
  const { 
    user, 
    hasAccess, 
    academias, 
    negocios, 
    chatbots, 
    addActivity,
    createChatbot, 
    updateChatbotMessages, 
    toggleChatbotStatus, 
    deleteChatbot,
    syncNegociosFromDB
  } = useAuth();
  const { toast } = useToast();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedChatbotForAnalytics, setSelectedChatbotForAnalytics] = useState<string | null>(null);

  const [negociosDb, setNegociosDb] = useState<any[]>([]);
  const [chatbotsDb, setChatbotsDb] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to wait for database propagation
  const waitForPropagation = () => new Promise(resolve => setTimeout(resolve, 200));

  // Load negócios directly from database for consistency
  const fetchNegocios = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNegociosDb(data || []);
      console.log('ChatbotsSection - Negócios carregados:', data?.length || 0);
    } catch (error) {
      console.error('Erro ao buscar negócios:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load chatbots from database
  const fetchChatbots = useCallback(async () => {
    if (!user || negociosDb.length === 0) return;

    try {
      const negocioIds = negociosDb.map(n => n.id);
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .in('negocio_id', negocioIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChatbotsDb(data || []);
      console.log('ChatbotsSection - Chatbots carregados:', data?.length || 0);
    } catch (error) {
      console.error('Erro ao buscar chatbots:', error);
    }
  }, [user, negociosDb]);

  useEffect(() => {
    fetchNegocios();
  }, [fetchNegocios]);

  useEffect(() => {
    fetchChatbots();
  }, [fetchChatbots]);

  // Real-time sync for negocios and chatbots
  useRealtimeTable('negocios', fetchNegocios);
  useRealtimeTable('chatbots', fetchChatbots);

  // Map database data to expected format for compatibility
  const negociosFormatted = negociosDb.map(n => ({
    id: n.id,
    nome: n.nome,
    unidade: n.unidade || '',
    segmento: n.segmento || n.tipo_negocio || 'Outros',
    statusChatbot: 'Nenhum' as const,
    createdAt: n.created_at || new Date().toISOString()
  }));

  // Map chatbots from database to expected format, merged with localStorage chatbots
  const chatbotsFromDb: Chatbot[] = chatbotsDb.map(c => ({
    id: c.id,
    nome: c.nome,
    negocioId: c.negocio_id,
    template: c.template || '',
    status: c.status || 'Em configuração',
    interacoes: c.interacoes || 0,
    mensagens: c.mensagens || { boasVindas: '', faqs: [], encerramento: '' },
    createdAt: c.created_at
  }));

  // Merge chatbots from DB with chatbots from context (removing duplicates by ID)
  const allChatbots = [...chatbotsFromDb];
  chatbots.forEach(chatbot => {
    if (!allChatbots.find(c => c.id === chatbot.id)) {
      allChatbots.push(chatbot);
    }
  });

  // Use merged chatbots list
  const chatbotsList = allChatbots;

  const handleCreateChatbot = () => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    setIsWizardOpen(true);
  };

  const handleEditChatbot = (chatbot: Chatbot) => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    setEditingChatbot(chatbot);
    setIsEditModalOpen(true);
  };

const handleToggleStatus = async (chatbotId: string) => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }

    try {
      // Buscar chatbot atual
      const chatbot = chatbotsList.find(c => c.id === chatbotId);
      if (!chatbot) return;

      const novoStatus = chatbot.status === "Ativo" ? "Em configuração" : "Ativo";
      
      // Atualizar no banco
      const { error } = await supabase
        .from('chatbots')
        .update({ 
          status: novoStatus,
          ativo: novoStatus === "Ativo"
        })
        .eq('id', chatbotId);

      if (error) {
        console.error('Erro ao atualizar status do chatbot:', error);
        toast({
          title: "Erro",
          description: "Não foi possível alterar o status do chatbot.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar estado local
      toggleChatbotStatus(chatbotId);
      
      toast({
        title: novoStatus === "Ativo" ? "Chatbot ativado" : "Chatbot desativado",
        description: `O chatbot foi ${novoStatus === "Ativo" ? 'ativado' : 'desativado'} com sucesso.`,
      });

      // Recarregar lista completa
      await waitForPropagation();
      await fetchChatbots();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDeleteChatbot = async (chatbotId: string) => {
    try {
      // Deletar do banco primeiro
      const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', chatbotId);

      if (error) {
        console.error('Erro ao deletar chatbot:', error);
        toast({
          title: "Erro ao deletar",
          description: "Não foi possível deletar o chatbot.",
          variant: "destructive"
        });
        return;
      }

      // Remover do estado local
      deleteChatbot(chatbotId);
      
      toast({
        title: "Chatbot removido",
        description: "O chatbot foi removido com sucesso.",
      });

      // Recarregar lista completa
      await waitForPropagation();
      await fetchChatbots();
    } catch (error) {
      console.error('Erro ao deletar chatbot:', error);
    }
  };

  const handleTestChatbot = (chatbot: Chatbot) => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    // Test functionality is handled in the table component
  };


const handleSaveChatbot = async (dadosChatbot: {
    negocioId: string;
    template: string;
    mensagens: Chatbot["mensagens"];
  }) => {
    if (!user) return;

    try {
      // Buscar o nome do negócio
      const negocio = negociosDb.find(n => n.id === dadosChatbot.negocioId);
      const nomeChatbot = `Bot – ${negocio?.nome || 'Negócio'}`;

      // Salvar no Supabase primeiro
      const { data, error } = await supabase
        .from('chatbots')
        .insert({
          negocio_id: dadosChatbot.negocioId,
          nome: nomeChatbot,
          template: dadosChatbot.template,
          mensagens: dadosChatbot.mensagens,
          status: 'Em configuração',
          interacoes: 0,
          ativo: false,
          personalidade: null,
          instrucoes: null
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar chatbot:', error);
        toast({
          title: "Erro ao criar chatbot",
          description: "Não foi possível criar o chatbot. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar estado local
      createChatbot(dadosChatbot);
      
      toast({
        title: "Chatbot criado",
        description: "Chatbot criado com sucesso e salvo no banco de dados.",
      });
      setIsWizardOpen(false);

      // Recarregar lista completa
      await waitForPropagation();
      await fetchChatbots();
    } catch (error) {
      console.error('Erro ao criar chatbot:', error);
      toast({
        title: "Erro ao criar chatbot",
        description: "Ocorreu um erro ao criar o chatbot.",
        variant: "destructive"
      });
    }
  };

const handleUpdateChatbot = async (mensagens: Chatbot["mensagens"]) => {
    if (!editingChatbot) return;

    try {
      // Atualizar no banco
      const { error } = await supabase
        .from('chatbots')
        .update({ mensagens })
        .eq('id', editingChatbot.id);

      if (error) {
        console.error('Erro ao atualizar chatbot:', error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar o chatbot.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar estado local
      updateChatbotMessages(editingChatbot.id, mensagens);
      
      toast({
        title: "Chatbot atualizado",
        description: "As mensagens foram atualizadas com sucesso.",
      });
      
      setIsEditModalOpen(false);
      setEditingChatbot(null);

      // Recarregar lista completa
      await waitForPropagation();
      await fetchChatbots();
    } catch (error) {
      console.error('Erro ao atualizar chatbot:', error);
    }
  };

  const handlePlansClick = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'plan');
    window.history.replaceState({}, '', url.toString());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <SkeletonTable rows={3} columns={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Chatbots
            </div>
            <Button onClick={handleCreateChatbot}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Chatbot
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <ChatbotTable
              chatbots={chatbotsList}
              negocios={negociosFormatted}
              onEdit={handleEditChatbot}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteChatbot}
              onTest={handleTestChatbot}
              onViewAnalytics={setSelectedChatbotForAnalytics}
            />
        </CardContent>
      </Card>

      {selectedChatbotForAnalytics && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Analytics - {chatbotsList.find(c => c.id === selectedChatbotForAnalytics)?.nome}
            </h2>
            <Button variant="outline" onClick={() => setSelectedChatbotForAnalytics(null)}>
              Voltar
            </Button>
          </div>
          <ChatbotAnalytics chatbotId={selectedChatbotForAnalytics} />
          <ConversationHistory chatbotId={selectedChatbotForAnalytics} />
        </div>
      )}

      <ChatbotWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        negocios={negociosFormatted}
        templates={templates}
        onSave={handleSaveChatbot}
        onNavigateToNegocios={() => {
          console.log('Navegando para negócios...');
          // Redirect to negocios tab
          const event = new CustomEvent('navigate-to-tab', { detail: 'negocios' });
          window.dispatchEvent(event);
        }}
      />

      <ChatbotEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        chatbot={editingChatbot}
        onSave={handleUpdateChatbot}
      />

      <ActionBlockModal
        open={isBlockModalOpen}
        onOpenChange={setIsBlockModalOpen}
        onPlansClick={handlePlansClick}
        action="criar e gerenciar chatbots"
      />
    </div>
  );
};

export default ChatbotsSection;