import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Building2 } from "lucide-react";
import { Negocio } from "./NegociosSection";
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

interface NegocioTableEnhancedProps {
  negocios: Negocio[];
  onEdit: (negocio: Negocio) => void;
  onDelete: (id: string) => void;
}

const NegocioTableEnhanced = ({
  negocios,
  onEdit,
  onDelete,
}: NegocioTableEnhancedProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getStatusBadge = (status: Negocio["statusChatbot"]) => {
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
        return <Badge variant="outline">Nenhum</Badge>;
    }
  };

  const getTipoNegocioLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      academia: "Academia & Fitness",
      clinica: "Clínica & Saúde",
      barbearia: "Barbearia & Beleza",
      restaurante: "Restaurante & Alimentação",
      escola: "Escola & Educação",
      oficina: "Oficina & Manutenção",
      loja: "Loja & Comércio",
      consultoria: "Consultoria & Serviços",
      outros: "Outros",
    };
    return tipos[tipo] || "Outros";
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<Negocio>[] = [
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue("nome")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "unidade",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unidade/Local" />
      ),
      cell: ({ row }) => {
        const unidade = row.getValue("unidade") as string | undefined;
        return <span>{unidade || "-"}</span>;
      },
    },
    {
      accessorKey: "tipoNegocio",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => {
        return (
          <span>{getTipoNegocioLabel(row.getValue("tipoNegocio"))}</span>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "segmento",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Segmento" />
      ),
    },
    {
      accessorKey: "statusChatbot",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status do Chatbot" />
      ),
      cell: ({ row }) => {
        return getStatusBadge(row.getValue("statusChatbot"));
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const negocio = row.original;

        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(negocio)}
              aria-label={`Editar ${negocio.nome}`}
              className="hover:bg-muted"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteId(negocio.id)}
              aria-label={`Remover ${negocio.nome}`}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (negocios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Nenhum negócio cadastrado
        </h3>
        <p className="text-muted-foreground mb-4">
          Cadastre seu primeiro negócio para começar a usar o Automiza.
        </p>
      </div>
    );
  }

  return (
    <>
      <DataTable columns={columns} data={negocios} pageSize={10} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este negócio? Esta ação não pode
              ser desfeita.
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

export default NegocioTableEnhanced;
