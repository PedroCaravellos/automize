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

// Using global state from AuthContext; no props needed

const ChatbotsSection = () => {
  const { hasAccess, academias, chatbots, createChatbot, updateChatbotMessages, toggleChatbotStatus, deleteChatbot } = useAuth();
  const { toast } = useToast();
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

    const updated = toggleChatbotStatus(chatbotId);
    if (!updated) return;
    const academia = academias.find(a => a.id === updated.academiaId);
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

const handleSaveChatbot = (dadosChatbot: {
    academiaId: string;
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