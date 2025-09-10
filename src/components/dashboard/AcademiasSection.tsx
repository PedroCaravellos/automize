import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Plus, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AcademiaModal from "./AcademiaModal";
import AcademiaTable from "./AcademiaTable";
import ActionBlockModal from "./ActionBlockModal";

export interface Academia {
  id: string;
  nome: string;
  unidade: string;
  segmento: "Academia" | "Estúdio" | "Box";
  statusChatbot: "Nenhum" | "Em configuração" | "Ativo";
  createdAt: string;
}

const AcademiasSection = () => {
  const { hasAccess } = useAuth();
  const { toast } = useToast();
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcademia, setEditingAcademia] = useState<Academia | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const handleAddAcademia = () => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    setEditingAcademia(null);
    setIsModalOpen(true);
  };

  const handleEditAcademia = (academia: Academia) => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    setEditingAcademia(academia);
    setIsModalOpen(true);
  };

  const handleSaveAcademia = (academiaData: Omit<Academia, "id" | "createdAt">) => {
    if (editingAcademia) {
      // Editar academia existente
      setAcademias(prev => prev.map(academia => 
        academia.id === editingAcademia.id 
          ? { ...academia, ...academiaData }
          : academia
      ));
      toast({
        title: "Academia atualizada",
        description: "Os dados da academia foram atualizados com sucesso.",
      });
    } else {
      // Adicionar nova academia
      const novaAcademia: Academia = {
        id: Date.now().toString(),
        ...academiaData,
        statusChatbot: "Nenhum",
        createdAt: new Date().toISOString(),
      };
      setAcademias(prev => [...prev, novaAcademia]);
      toast({
        title: "Academia cadastrada",
        description: "A academia foi cadastrada com sucesso.",
      });
    }
    setIsModalOpen(false);
    setEditingAcademia(null);
  };

  const handleDeleteAcademia = (id: string) => {
    setAcademias(prev => prev.filter(academia => academia.id !== id));
    toast({
      title: "Academia removida",
      description: "A academia foi removida com sucesso.",
    });
  };

  const handlePlansClick = () => {
    // Navegar para seção de planos na landing page
    window.location.href = "/#planos";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Minhas Academias
            </div>
            <Button onClick={handleAddAcademia}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar academia
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AcademiaTable
            academias={academias}
            onEdit={handleEditAcademia}
            onDelete={handleDeleteAcademia}
          />
        </CardContent>
      </Card>

      <AcademiaModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        academia={editingAcademia}
        onSave={handleSaveAcademia}
      />

      <ActionBlockModal
        open={isBlockModalOpen}
        onOpenChange={setIsBlockModalOpen}
        onPlansClick={handlePlansClick}
        action="gerenciar academias"
      />
    </div>
  );
};

export default AcademiasSection;