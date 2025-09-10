import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Bot, Play, Pause, MessageSquare } from "lucide-react";
import { Chatbot } from "./ChatbotsSection";
import { Academia } from "./AcademiasSection";
import ChatbotSimulator from "./ChatbotSimulator";

interface ChatbotTableProps {
  chatbots: Chatbot[];
  academias: Academia[];
  onEdit: (chatbot: Chatbot) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (chatbot: Chatbot) => void;
}

const ChatbotTable = ({ chatbots, academias, onEdit, onToggleStatus, onDelete, onTest }: ChatbotTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);

  const getAcademiaNome = (academiaId: string) => {
    const academia = academias.find(a => a.id === academiaId);
    return academia ? `${academia.nome} - ${academia.unidade}` : "Academia não encontrada";
  };

  const getStatusBadge = (status: Chatbot["status"]) => {
    switch (status) {
      case "Ativo":
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
      case "Em configuração":
        return <Badge variant="secondary">Em configuração</Badge>;
      default:
        return <Badge variant="outline">Inativo</Badge>;
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleTestClick = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    onTest(chatbot);
    setSimulatorOpen(true);
  };

  const getSelectedAcademia = () => {
    if (!selectedChatbot) return null;
    return academias.find(a => a.id === selectedChatbot.academiaId) || null;
  };


  if (chatbots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bot className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum chatbot criado</h3>
        <p className="text-muted-foreground mb-4">
          Crie seu primeiro chatbot para automatizar o atendimento da sua academia.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Bot</TableHead>
              <TableHead>Academia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chatbots.map((chatbot) => (
              <TableRow key={chatbot.id}>
                <TableCell className="font-medium">{chatbot.nome}</TableCell>
                <TableCell>{getAcademiaNome(chatbot.academiaId)}</TableCell>
                <TableCell>{getStatusBadge(chatbot.status)}</TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{chatbot.interacoes}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTestClick(chatbot)}
                      aria-label={`Testar ${chatbot.nome}`}
                      className="text-blue-600 hover:text-blue-600"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(chatbot)}
                      aria-label={`Editar ${chatbot.nome}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(chatbot.id)}
                      aria-label={
                        chatbot.status === "Ativo" 
                          ? `Desativar ${chatbot.nome}`
                          : `Ativar ${chatbot.nome}`
                      }
                      className={
                        chatbot.status === "Ativo"
                          ? "text-orange-600 hover:text-orange-600"
                          : "text-green-600 hover:text-green-600"
                      }
                    >
                      {chatbot.status === "Ativo" ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(chatbot.id)}
                      aria-label={`Remover ${chatbot.nome}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este chatbot? Esta ação não pode ser desfeita e todas as configurações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ChatbotSimulator
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
        chatbot={selectedChatbot}
        academia={getSelectedAcademia()}
      />

    </>
  );
};

export default ChatbotTable;