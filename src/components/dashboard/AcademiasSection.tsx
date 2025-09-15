import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Plus, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  endereco?: string;
  telefone?: string;
  whatsapp?: string;
  horarios?: string;
  modalidades?: string;
  valores?: string;
  promocoes?: string;
  diferenciais?: string;
}

// Using global state from AuthContext; no props needed

const AcademiasSection = () => {
  const { hasAccess, user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcademia, setEditingAcademia] = useState<Academia | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [academiasDb, setAcademiasDb] = useState<Academia[]>([]);

  const mapFromDb = (row: any): Academia => ({
    id: row.id,
    nome: row.nome,
    unidade: row.unidade || "",
    segmento: (row.valores && row.valores.segmento) || "Academia",
    statusChatbot: "Nenhum",
    createdAt: row.created_at,
    endereco: row.endereco || "",
    telefone: row.telefone || "",
    whatsapp: row.whatsapp || "",
    horarios: row.horario_funcionamento || "",
    modalidades: Array.isArray(row.modalidades) ? row.modalidades.join(', ') : "",
    valores: row.valores?.descricao || "",
    promocoes: row.promocoes || "",
    diferenciais: row.diferenciais || "",
  });

  const toDbPayload = (data: Omit<Academia, 'id' | 'createdAt'>, includeUserId = false) => {
    const modalidadesArray = data.modalidades
      ? data.modalidades.split(',').map((m) => m.trim()).filter(Boolean)
      : null;
    const payload: any = {
      nome: data.nome,
      unidade: data.unidade,
      telefone: data.telefone || null,
      endereco: data.endereco || null,
      whatsapp: data.whatsapp || null,
      horario_funcionamento: data.horarios || null,
      modalidades: modalidadesArray,
      valores: (data.valores || data.segmento)
        ? { descricao: data.valores || "", segmento: data.segmento }
        : null,
      promocoes: data.promocoes || null,
      diferenciais: data.diferenciais || null,
    };
    if (includeUserId && user?.id) payload.user_id = user.id;
    return payload;
  };

  const fetchAcademias = async () => {
    try {
      const { data, error } = await supabase
        .from('academias')
        .select('id, nome, unidade, telefone, endereco, whatsapp, horario_funcionamento, modalidades, valores, promocoes, diferenciais, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAcademiasDb((data || []).map(mapFromDb));
    } catch (error) {
      console.error('Erro ao carregar academias:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar suas academias.', variant: 'destructive' });
    }
  };

  useEffect(() => { fetchAcademias(); }, []);

  const handleAddAcademia = () => {
    if (!hasAccess()) { setIsBlockModalOpen(true); return; }
    setEditingAcademia(null);
    setIsModalOpen(true);
  };

  const handleEditAcademia = (academia: Academia) => {
    if (!hasAccess()) { setIsBlockModalOpen(true); return; }
    setEditingAcademia(academia);
    setIsModalOpen(true);
  };

  const handleSaveAcademia = async (academiaData: Omit<Academia, "id" | "createdAt">) => {
    try {
      if (editingAcademia) {
        const { error } = await supabase
          .from('academias')
          .update(toDbPayload(academiaData, false))
          .eq('id', editingAcademia.id);
        if (error) throw error;
        toast({ title: 'Academia atualizada', description: 'Dados atualizados com sucesso.' });
      } else {
        const { error } = await supabase
          .from('academias')
          .insert(toDbPayload(academiaData, true));
        if (error) throw error;
        toast({ title: 'Academia cadastrada', description: 'Academia criada com sucesso.' });
      }
      setIsModalOpen(false);
      setEditingAcademia(null);
      fetchAcademias();
    } catch (error) {
      console.error('Erro ao salvar academia:', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar a academia.', variant: 'destructive' });
    }
  };

  const handleDeleteAcademia = async (id: string) => {
    try {
      const { error } = await supabase.from('academias').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Academia removida', description: 'A academia foi removida com sucesso.' });
      fetchAcademias();
    } catch (error) {
      console.error('Erro ao remover academia:', error);
      toast({ title: 'Erro', description: 'Não foi possível remover a academia.', variant: 'destructive' });
    }
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
            academias={academiasDb}
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