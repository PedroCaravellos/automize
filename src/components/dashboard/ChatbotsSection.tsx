import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ChatbotWizard from "./ChatbotWizard";
import ChatbotTable from "./ChatbotTable";
import ChatbotEditModal from "./ChatbotEditModal";
import ActionBlockModal from "./ActionBlockModal";
import { Academia } from "./AcademiasSection";

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
  academiaId: string;
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

interface ChatbotsSectionProps {
  academias: Academia[];
  onUpdateAcademiaStatus: (academiaId: string, status: Academia["statusChatbot"]) => void;
  onAddAtividade: (atividade: Omit<AtividadeRecente, "id">) => void;
}

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

const ChatbotsSection = ({ academias, onUpdateAcademiaStatus, onAddAtividade }: ChatbotsSectionProps) => {
  const { hasAccess } = useAuth();
  const { toast } = useToast();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

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

    setChatbots(prev => prev.map(bot => {
      if (bot.id === chatbotId) {
        const newStatus = bot.status === "Ativo" ? "Em configuração" : "Ativo";
        const academia = academias.find(a => a.id === bot.academiaId);
        
        // Atualizar status da academia
        if (newStatus === "Ativo") {
          onUpdateAcademiaStatus(bot.academiaId, "Ativo");
          toast({
            title: "Chatbot ativado",
            description: `O chatbot ${bot.nome} foi ativado com sucesso.`,
          });
          onAddAtividade({
            tipo: "chatbot",
            descricao: `Chatbot ativado – ${bot.nome} – ${academia?.nome}`,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Verificar se há outros bots ativos para esta academia
          const outrosBotAtivos = prev.some(b => 
            b.academiaId === bot.academiaId && 
            b.id !== chatbotId && 
            b.status === "Ativo"
          );
          
          if (!outrosBotAtivos) {
            onUpdateAcademiaStatus(bot.academiaId, "Em configuração");
          }
          
          toast({
            title: "Chatbot desativado",
            description: `O chatbot ${bot.nome} foi desativado.`,
          });
          onAddAtividade({
            tipo: "chatbot",
            descricao: `Chatbot desativado – ${bot.nome} – ${academia?.nome}`,
            timestamp: new Date().toISOString(),
          });
        }
        
        return { ...bot, status: newStatus };
      }
      return bot;
    }));
  };

  const handleDeleteChatbot = (chatbotId: string) => {
    const chatbot = chatbots.find(b => b.id === chatbotId);
    if (!chatbot) return;

    setChatbots(prev => {
      const filtered = prev.filter(bot => bot.id !== chatbotId);
      
      // Verificar se há outros bots ativos para esta academia
      const outrosBotAtivos = filtered.some(b => 
        b.academiaId === chatbot.academiaId && 
        b.status === "Ativo"
      );
      
      if (!outrosBotAtivos) {
        onUpdateAcademiaStatus(chatbot.academiaId, "Nenhum");
      }
      
      return filtered;
    });

    const academia = academias.find(a => a.id === chatbot.academiaId);
    toast({
      title: "Chatbot removido",
      description: "O chatbot foi removido com sucesso.",
    });
    onAddAtividade({
      tipo: "chatbot",
      descricao: `Chatbot removido – ${chatbot.nome} – ${academia?.nome}`,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSaveChatbot = (dadosChatbot: {
    academiaId: string;
    template: string;
    mensagens: Chatbot["mensagens"];
  }) => {
    const academia = academias.find(a => a.id === dadosChatbot.academiaId);
    if (!academia) return;

    const novoChatbot: Chatbot = {
      id: Date.now().toString(),
      nome: `Bot – ${academia.nome}`,
      academiaId: dadosChatbot.academiaId,
      template: dadosChatbot.template,
      status: "Em configuração",
      interacoes: 0,
      mensagens: dadosChatbot.mensagens,
      createdAt: new Date().toISOString(),
    };

    setChatbots(prev => [...prev, novoChatbot]);
    
    // Atualizar status da academia se ainda for "Nenhum"
    if (academia.statusChatbot === "Nenhum") {
      onUpdateAcademiaStatus(dadosChatbot.academiaId, "Em configuração");
    }

    toast({
      title: "Chatbot criado",
      description: "Chatbot criado em modo básico com sucesso.",
    });
    
    onAddAtividade({
      tipo: "chatbot",
      descricao: `Chatbot criado – ${novoChatbot.nome} – ${academia.nome}`,
      timestamp: new Date().toISOString(),
    });

    setIsWizardOpen(false);
  };

  const handleUpdateChatbot = (mensagens: Chatbot["mensagens"]) => {
    if (!editingChatbot) return;

    setChatbots(prev => prev.map(bot => 
      bot.id === editingChatbot.id 
        ? { ...bot, mensagens }
        : bot
    ));

    const academia = academias.find(a => a.id === editingChatbot.academiaId);
    toast({
      title: "Chatbot atualizado",
      description: "As mensagens foram atualizadas com sucesso.",
    });
    
    onAddAtividade({
      tipo: "chatbot",
      descricao: `Chatbot editado – ${editingChatbot.nome} – ${academia?.nome}`,
      timestamp: new Date().toISOString(),
    });

    setIsEditModalOpen(false);
    setEditingChatbot(null);
  };

  const handlePlansClick = () => {
    window.location.href = "/#planos";
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
            academias={academias}
            onEdit={handleEditChatbot}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteChatbot}
          />
        </CardContent>
      </Card>

      <ChatbotWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        academias={academias}
        templates={templates}
        onSave={handleSaveChatbot}
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