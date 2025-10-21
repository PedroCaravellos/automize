import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNegocios, useCreateNegocio, useUpdateNegocio, useDeleteNegocio } from "@/hooks/useBusinessData";
import { useOptimizedRealtime } from "@/hooks/useOptimizedRealtime";
import { businessKeys } from "@/hooks/useBusinessData";
import NegocioTable from "./NegocioTable";
import NegocioModal from "./NegocioModal";
import ActionBlockModal from "./ActionBlockModal";
import { NegocioItem } from "@/types";

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

const OptimizedNegociosSection = React.memo(() => {
  const { user, hasAccess } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingNegocio, setEditingNegocio] = useState<Negocio | undefined>();

  // React Query hooks
  const { data: negociosDb = [], isLoading } = useNegocios();
  const createNegocio = useCreateNegocio();
  const updateNegocio = useUpdateNegocio();
  const deleteNegocio = useDeleteNegocio();

  // Realtime subscription otimizada
  useOptimizedRealtime({
    table: 'negocios',
    queryKey: businessKeys.negocios(user?.id || ''),
    enabled: !!user?.id,
    filter: user?.id ? {
      column: 'user_id',
      value: user.id
    } : undefined,
  });

  const mapFromDb = useCallback((dbNegocio: any): Negocio => ({
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
  }), []);

  const toDbPayload = useCallback((negocio: Partial<Negocio>) => ({
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
  }), [user?.id]);

  const handleNovoNegocio = useCallback(() => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    setEditingNegocio(undefined);
    setIsModalOpen(true);
  }, [hasAccess]);

  const handleEditNegocio = useCallback((negocio: Negocio) => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    setEditingNegocio(negocio);
    setIsModalOpen(true);
  }, [hasAccess]);

  const handleSaveNegocio = useCallback(async (negocio: Partial<Negocio>) => {
    if (editingNegocio?.id) {
      await updateNegocio.mutateAsync({
        id: editingNegocio.id,
        updates: toDbPayload(negocio)
      });
    } else {
      await createNegocio.mutateAsync(toDbPayload(negocio));
    }
    setIsModalOpen(false);
    setEditingNegocio(undefined);
  }, [editingNegocio, updateNegocio, createNegocio, toDbPayload]);

  const handleDeleteNegocio = useCallback(async (id: string) => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    await deleteNegocio.mutateAsync(id);
  }, [hasAccess, deleteNegocio]);

  const negocios = React.useMemo(
    () => negociosDb.map(mapFromDb),
    [negociosDb, mapFromDb]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Negócios</CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonTable />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Negócios</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus negócios cadastrados
            </p>
          </div>
          <Button 
            onClick={handleNovoNegocio}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Novo Negócio
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
        onPlansClick={() => window.location.href = "/dashboard?tab=plan"}
        action="gerenciar negócios"
      />
    </>
  );
});

OptimizedNegociosSection.displayName = 'OptimizedNegociosSection';

export default OptimizedNegociosSection;
