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
import { Edit2, Trash2, Building2 } from "lucide-react";
import { Negocio } from "./NegociosSection";

interface NegocioTableProps {
  negocios: Negocio[];
  onEdit: (negocio: Negocio) => void;
  onDelete: (id: string) => void;
}

const NegocioTable = ({ negocios, onEdit, onDelete }: NegocioTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getStatusBadge = (status: Negocio["statusChatbot"]) => {
    switch (status) {
      case "Ativo":
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
      case "Em configuração":
        return <Badge variant="secondary">Em configuração</Badge>;
      default:
        return <Badge variant="outline">Nenhum</Badge>;
    }
  };

  const getTipoNegocioLabel = (tipo: string) => {
    const tipos = {
      academia: 'Academia & Fitness',
      clinica: 'Clínica & Saúde',
      barbearia: 'Barbearia & Beleza',
      restaurante: 'Restaurante & Alimentação',
      escola: 'Escola & Educação',
      oficina: 'Oficina & Manutenção',
      loja: 'Loja & Comércio',
      consultoria: 'Consultoria & Serviços',
      outros: 'Outros'
    };
    return tipos[tipo as keyof typeof tipos] || 'Outros';
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

  if (negocios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum negócio cadastrado</h3>
        <p className="text-muted-foreground mb-4">
          Cadastre seu primeiro negócio para começar a usar o Automiza.
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
              <TableHead>Nome</TableHead>
              <TableHead>Unidade/Local</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Status do Chatbot</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {negocios.map((negocio) => (
              <TableRow key={negocio.id}>
                <TableCell className="font-medium">{negocio.nome}</TableCell>
                <TableCell>{negocio.unidade || '-'}</TableCell>
                <TableCell>{getTipoNegocioLabel(negocio.tipoNegocio)}</TableCell>
                <TableCell>{negocio.segmento}</TableCell>
                <TableCell>{getStatusBadge(negocio.statusChatbot)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(negocio)}
                      aria-label={`Editar ${negocio.nome}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(negocio.id)}
                      aria-label={`Remover ${negocio.nome}`}
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
              Tem certeza que deseja remover este negócio? Esta ação não pode ser desfeita.
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

export default NegocioTable;