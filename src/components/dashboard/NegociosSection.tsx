import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import NegocioTable from "./NegocioTable";
import NegocioModal from "./NegocioModal";
import ActionBlockModal from "./ActionBlockModal";

export interface Negocio {
  id: string;
  nome: string;
  unidade?: string;
  segmento: string;
  tipoNegocio: string;
  endereco?: string;
  telefone?: string;
  whatsapp?: string;
  horario_funcionamento?: string;
  servicos_oferecidos?: string[];
  valores?: {
    planos?: Array<{nome: string; preco: number; periodo: string; descricao?: string}>;
    servicosAvulsos?: Array<{nome: string; preco: number; descricao?: string}>;
    observacoes?: string;
  };
  promocoes?: string;
  diferenciais?: string;
  statusChatbot: "Ativo" | "Em configuração" | "Nenhum";
}

const NegociosSection = () => {
  const { user, hasAccess, syncNegociosFromDB } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingNegocio, setEditingNegocio] = useState<Negocio | undefined>();
  const [negociosDb, setNegociosDb] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mapFromDb = (dbNegocio: any): Negocio => ({
    id: dbNegocio.id,
    nome: dbNegocio.nome,
    unidade: dbNegocio.unidade,
    segmento: dbNegocio.segmento,
    tipoNegocio: dbNegocio.tipo_negocio || 'outros',
    endereco: dbNegocio.endereco,
    telefone: dbNegocio.telefone,
    whatsapp: dbNegocio.whatsapp,
    horario_funcionamento: dbNegocio.horario_funcionamento,
    servicos_oferecidos: dbNegocio.servicos_oferecidos,
    valores: dbNegocio.valores,
    promocoes: dbNegocio.promocoes,
    diferenciais: dbNegocio.diferenciais,
    statusChatbot: "Nenhum" as const
  });

  const toDbPayload = (negocio: Partial<Negocio>) => ({
    nome: negocio.nome,
    unidade: negocio.unidade,
    segmento: negocio.segmento,
    tipo_negocio: negocio.tipoNegocio,
    endereco: negocio.endereco,
    telefone: negocio.telefone,
    whatsapp: negocio.whatsapp,
    horario_funcionamento: negocio.horario_funcionamento,
    servicos_oferecidos: negocio.servicos_oferecidos,
    valores: negocio.valores,
    promocoes: negocio.promocoes,
    diferenciais: negocio.diferenciais,
    user_id: user?.id
  });

  const waitForPropagation = () => new Promise(resolve => setTimeout(resolve, 200));

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
    } catch (error) {
      console.error('Erro ao buscar negócios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os negócios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchNegocios();
  }, [fetchNegocios]);

  // Real-time sync
  useRealtimeTable('negocios', fetchNegocios);

  const handleAddNegocio = () => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }

    setEditingNegocio(undefined);
    setIsModalOpen(true);
  };

  const handleEditNegocio = (negocio: Negocio) => {
    setEditingNegocio(negocio);
    setIsModalOpen(true);
  };

  const handleSaveNegocio = async (negocioData: Partial<Negocio>) => {
    if (!user) return;

    try {
      const payload = toDbPayload(negocioData);

      if (editingNegocio) {
        const { error } = await supabase
          .from('negocios')
          .update(payload)
          .eq('id', editingNegocio.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Negócio atualizado com sucesso! Os preços serão utilizados pelo chatbot.",
        });
      } else {
        const { error } = await supabase
          .from('negocios')
          .insert([payload]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Negócio cadastrado com sucesso! Os preços serão utilizados pelo chatbot.",
        });
      }

      setIsModalOpen(false);
      setEditingNegocio(undefined);
      
      await waitForPropagation();
      await fetchNegocios();
      await syncNegociosFromDB(); // Sync with global context
    } catch (error) {
      console.error('Erro ao salvar negócio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o negócio.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNegocio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('negocios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Negócio removido com sucesso!",
      });

      await waitForPropagation();
      await fetchNegocios();
      await syncNegociosFromDB(); // Sync with global context
    } catch (error) {
      console.error('Erro ao deletar negócio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o negócio.",
        variant: "destructive",
      });
    }
  };

  const handlePlansClick = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'plans');
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  const negocios = negociosDb.map(mapFromDb);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </CardHeader>
        <CardContent>
          <SkeletonTable rows={3} columns={4} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Meus Negócios</CardTitle>
          <Button onClick={handleAddNegocio} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Negócio
          </Button>
        </CardHeader>
        <CardContent>
          <NegocioTable
            negocios={negocios}
            onEdit={handleEditNegocio}
            onDelete={handleDeleteNegocio}
          />
        </CardContent>
      </Card>

      <NegocioModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        negocio={editingNegocio}
        onSave={handleSaveNegocio}
      />

        <ActionBlockModal
          open={isBlockModalOpen}
          onOpenChange={setIsBlockModalOpen}
          onPlansClick={handlePlansClick}
          action="gerenciar negócios"
        />
    </>
  );
};

export default NegociosSection;