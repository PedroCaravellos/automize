import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Phone, Mail, DollarSign } from "lucide-react";
import { SortableLeadCard } from "./SortableLeadCard";
import { Lead } from "./VendasCRMSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SalesPipelineKanbanProps {
  leads: Lead[];
  onLeadUpdate: () => void;
  onEditLead: (lead: Lead) => void;
  formatCurrency: (value: number) => string;
}

const PIPELINE_STAGES = [
  { id: 'inicial', label: 'Inicial', color: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'interesse', label: 'Interesse', color: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'visita_agendada', label: 'Visita Agendada', color: 'bg-yellow-100 dark:bg-yellow-900' },
  { id: 'proposta', label: 'Proposta', color: 'bg-orange-100 dark:bg-orange-900' },
  { id: 'fechamento', label: 'Fechamento', color: 'bg-green-100 dark:bg-green-900' },
];

export default function SalesPipelineKanban({
  leads,
  onLeadUpdate,
  onEditLead,
  formatCurrency,
}: SalesPipelineKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeLead = activeId
    ? leads.find((lead) => lead.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setIsDragging(false);

    if (!over) {
      setActiveId(null);
      return;
    }

    const leadId = active.id as string;
    const newStage = over.id as Lead['pipeline_stage'];

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.pipeline_stage === newStage) {
      setActiveId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({ pipeline_stage: newStage })
        .eq('id', leadId);

      if (error) throw error;

      toast.success("Lead atualizado!", {
        description: `${lead.nome} movido para ${PIPELINE_STAGES.find(s => s.id === newStage)?.label}`,
      });

      // Atualizar dados após sucesso
      await onLeadUpdate();
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast.error("Erro ao atualizar lead", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setActiveId(null);
    }
  };

  const getLeadsByStage = (stage: string) => {
    return leads.filter((lead) => lead.pipeline_stage === stage);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);
          const totalValue = stageLeads.reduce(
            (sum, lead) => sum + (lead.valor_estimado || 0),
            0
          );

          return (
            <SortableContext
              key={stage.id}
              id={stage.id}
              items={stageLeads.map((lead) => lead.id)}
              strategy={verticalListSortingStrategy}
            >
              <Card className={`${stage.color} border-2 transition-all duration-200 ${isDragging ? 'ring-2 ring-primary/20' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>{stage.label}</span>
                    <Badge variant="secondary" className="ml-2">
                      {stageLeads.length}
                    </Badge>
                  </CardTitle>
                  {totalValue > 0 && (
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatCurrency(totalValue)}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 min-h-[200px]">
                  {stageLeads.map((lead, index) => (
                    <SortableLeadCard
                      key={lead.id}
                      lead={lead}
                      index={index}
                      onEdit={onEditLead}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </CardContent>
              </Card>
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay>
        {activeLead ? (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.05, rotate: 2 }}
            className="bg-card border-2 border-primary rounded-lg p-3 shadow-2xl opacity-90"
          >
            <LeadCardPreview lead={activeLead} formatCurrency={formatCurrency} />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function LeadCardPreview({
  lead,
  formatCurrency,
}: {
  lead: Lead;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <p className="font-semibold text-sm line-clamp-1">{lead.nome}</p>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {lead.interesse || 'Sem interesse definido'}
      </p>
      {lead.valor_estimado && (
        <div className="flex items-center gap-1 text-xs font-semibold text-success">
          <DollarSign className="h-3 w-3" />
          {formatCurrency(lead.valor_estimado)}
        </div>
      )}
      <div className="flex gap-2 text-xs text-muted-foreground">
        {lead.telefone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  );
}
