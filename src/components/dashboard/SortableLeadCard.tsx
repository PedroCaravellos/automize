import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Edit, Phone, Mail, DollarSign } from "lucide-react";
import { Lead } from "./VendasCRMSection";

interface SortableLeadCardProps {
  lead: Lead;
  index: number;
  onEdit: (lead: Lead) => void;
  formatCurrency: (value: number) => string;
}

export function SortableLeadCard({
  lead,
  index,
  onEdit,
  formatCurrency,
}: SortableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className={`
        bg-card border rounded-lg p-3 shadow-sm
        hover:shadow-md transition-all duration-200
        ${isDragging ? 'opacity-50 ring-2 ring-primary' : 'cursor-grab active:cursor-grabbing'}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-sm line-clamp-1 flex-1">{lead.nome}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 -mr-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(lead);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Edit className="h-3 w-3" />
          </Button>
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
              <span className="truncate max-w-[100px]">{lead.telefone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
