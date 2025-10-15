import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Play, Pause, MessageSquare, BarChart3, Bot } from "lucide-react";
import { Chatbot } from "./ChatbotsSection";
import { NegocioItem } from "@/contexts/AuthContext";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
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
import { useState } from "react";

interface ChatbotTableEnhancedProps {
  chatbots: Chatbot[];
  negocios: NegocioItem[];
  onEdit: (chatbot: Chatbot) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (chatbot: Chatbot) => void;
  onViewAnalytics?: (chatbotId: string) => void;
}

const ChatbotTableEnhanced = ({
  chatbots,
  negocios,
  onEdit,
  onToggleStatus,
  onDelete,
  onTest,
  onViewAnalytics,
}: ChatbotTableEnhancedProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getNegocioNome = (negocioId: string) => {
    const negocio = negocios.find((n) => n.id === negocioId);
    return negocio
      ? `${negocio.nome}${negocio.unidade ? ` - ${negocio.unidade}` : ""}`
      : "Negócio não encontrado";
  };

  const getStatusBadge = (status: Chatbot["status"]) => {
    switch (status) {
      case "Ativo":
        return (
          <Badge variant="default" className="bg-success">
            Ativo
          </Badge>
        );
      case "Em configuração":
        return <Badge variant="secondary">Em configuração</Badge>;
      default:
        return <Badge variant="outline">Inativo</Badge>;
    }
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<Chatbot>[] = [
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome do Bot" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue("nome")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "negocioId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Negócio" />
      ),
      cell: ({ row }) => {
        return <span>{getNegocioNome(row.getValue("negocioId"))}</span>;
      },
      filterFn: (row, id, value) => {
        return getNegocioNome(row.getValue(id))
          .toLowerCase()
          .includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        return getStatusBadge(row.getValue("status"));
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "interacoes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Interações" />
      ),
      cell: ({ row }) => {
        return (
          <span className="text-muted-foreground">
            {row.getValue("interacoes")}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const chatbot = row.original;

        return (
          <div className="flex justify-end gap-2">
            {onViewAnalytics && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewAnalytics(chatbot.id)}
                aria-label={`Ver analytics ${chatbot.nome}`}
                className="text-purple-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTest(chatbot)}
              aria-label={`Testar ${chatbot.nome}`}
              className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(chatbot)}
              aria-label={`Editar ${chatbot.nome}`}
              className="hover:bg-muted"
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
                  ? "text-orange-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                  : "text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
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
              onClick={() => setDeleteId(chatbot.id)}
              aria-label={`Remover ${chatbot.nome}`}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (chatbots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bot className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum chatbot criado</h3>
        <p className="text-muted-foreground mb-4">
          Crie seu primeiro chatbot para automatizar o atendimento do seu
          negócio.
        </p>
      </div>
    );
  }

  return (
    <>
      <DataTable columns={columns} data={chatbots} pageSize={10} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este chatbot? Esta ação não pode
              ser desfeita e todas as configurações serão perdidas.
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
    </>
  );
};

export default ChatbotTableEnhanced;
