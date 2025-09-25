import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { updateUserData } from "@/utils/userStorage";
import { supabase } from "@/integrations/supabase/client";
import ChatbotWizard from "./ChatbotWizard";
import ChatbotTable from "./ChatbotTable";
import ChatbotEditModal from "./ChatbotEditModal";
import ActionBlockModal from "./ActionBlockModal";
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

  const [negociosDb, setNegociosDb] = useState<any[]>([]);

  // Load negócios directly from database for consistency
  useEffect(() => {
    if (user) {
      console.log('Carregando negócios...');
      const fetchNegocios = async () => {
        try {
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
        }
      };
      
      fetchNegocios();
    }
  }, [user]);

  // Map database data to expected format for compatibility
  const negociosFormatted = negociosDb.map(n => ({
    id: n.id,
    nome: n.nome,
    unidade: n.unidade || '',
    segmento: n.segmento || n.tipo_negocio || 'Outros',
    statusChatbot: 'Nenhum' as const,
    createdAt: n.created_at || new Date().toISOString()
  }));

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

const handleToggleStatus = (chatbotId: string) => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }

    const updated = toggleChatbotStatus(chatbotId);
    if (!updated) return;
    const negocio = negociosFormatted.find(n => n.id === updated.negocioId);
    if (updated.status === "Ativo") {
      toast({
        title: "Chatbot ativado",
        description: `O chatbot ${updated.nome} foi ativado com sucesso.`,
      });
    } else {
      toast({
        title: "Chatbot desativado",
        description: `O chatbot ${updated.nome} foi desativado.`,
      });
    }
  };

  const handleDeleteChatbot = (chatbotId: string) => {
    const removed = deleteChatbot(chatbotId);
    if (!removed) return;
    toast({
      title: "Chatbot removido",
      description: "O chatbot foi removido com sucesso.",
    });
  };

  const handleTestChatbot = (chatbot: Chatbot) => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    // Test functionality is handled in the table component
  };


const handleSaveChatbot = (dadosChatbot: {
    negocioId: string;
    template: string;
    mensagens: Chatbot["mensagens"];
  }) => {
    const created = createChatbot(dadosChatbot);
    if (!created) return;
    toast({
      title: "Chatbot criado",
      description: "Chatbot criado em modo básico com sucesso.",
    });
    setIsWizardOpen(false);
  };

const handleUpdateChatbot = (mensagens: Chatbot["mensagens"]) => {
    if (!editingChatbot) return;
    const updated = updateChatbotMessages(editingChatbot.id, mensagens);
    if (updated) {
      toast({
        title: "Chatbot atualizado",
        description: "As mensagens foram atualizadas com sucesso.",
      });
    }
    setIsEditModalOpen(false);
    setEditingChatbot(null);
  };

  const handlePlansClick = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'plan');
    window.history.replaceState({}, '', url.toString());
  };

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
              chatbots={chatbots}
              negocios={negociosFormatted}
              onEdit={handleEditChatbot}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteChatbot}
              onTest={handleTestChatbot}
            />
        </CardContent>
      </Card>

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