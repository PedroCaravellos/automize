import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LeadItem } from "@/types";
import { Phone, Calendar, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import { useUpdateLead } from "@/hooks/useBusinessData";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InlineActionCardProps {
  lead: LeadItem;
  onWhatsAppClick?: (phone: string) => void;
  onScheduleClick?: (leadId: string) => void;
}

export default function InlineActionCard({ 
  lead, 
  onWhatsAppClick,
  onScheduleClick 
}: InlineActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState(lead);
  const updateLead = useUpdateLead();

  const handleWhatsApp = () => {
    if (lead.telefone) {
      const phone = lead.telefone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}`, '_blank');
      onWhatsAppClick?.(phone);
    }
  };

  const handleSchedule = () => {
    onScheduleClick?.(lead.id);
  };

  const handleMarkAsDone = () => {
    updateLead.mutate({
      id: lead.id,
      updates: { status: 'ganho', pipeline_stage: 'ganho' }
    });
  };

  const handleSave = () => {
    updateLead.mutate({
      id: lead.id,
      updates: {
        observacoes: editedLead.observacoes,
        valor_estimado: editedLead.valor_estimado
      }
    }, {
      onSuccess: () => {
        setIsEditing(false);
        toast({
          title: "Sucesso!",
          description: "Lead atualizado.",
        });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'contatado': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'qualificado': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'ganho': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'perdido': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {/* Header compacto */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{lead.nome}</h3>
            <Badge variant="secondary" className={getStatusColor(lead.status)}>
              {lead.status}
            </Badge>
          </div>
          {lead.telefone && (
            <p className="text-sm text-muted-foreground">📱 {lead.telefone}</p>
          )}
          {lead.observacoes && !isExpanded && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              💬 {lead.observacoes}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Ações rápidas sempre visíveis */}
      <div className="flex gap-2 flex-wrap">
        {lead.telefone && (
          <Button 
            size="sm" 
            onClick={handleWhatsApp}
            className="flex-1 min-w-[120px]"
          >
            <Phone className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
        )}
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleSchedule}
          className="flex-1 min-w-[120px]"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Agendar
        </Button>
        {lead.status !== 'ganho' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleMarkAsDone}
            className="flex-1 min-w-[120px]"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        )}
      </div>

      {/* Área expandida */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  value={editedLead.observacoes || ''}
                  onChange={(e) => setEditedLead({ ...editedLead, observacoes: e.target.value })}
                  placeholder="Adicione observações sobre o lead..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Estimado</label>
                <Input
                  type="number"
                  value={editedLead.valor_estimado || ''}
                  onChange={(e) => setEditedLead({ ...editedLead, valor_estimado: parseFloat(e.target.value) })}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 text-sm">
                {lead.email && (
                  <p className="text-muted-foreground">✉️ {lead.email}</p>
                )}
                {lead.origem && (
                  <p className="text-muted-foreground">🔗 Origem: {lead.origem}</p>
                )}
                {lead.valor_estimado && (
                  <p className="text-muted-foreground">
                    💰 Valor estimado: R$ {lead.valor_estimado.toFixed(2)}
                  </p>
                )}
                {lead.observacoes && (
                  <div>
                    <p className="font-medium mb-1">Observações:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{lead.observacoes}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Criado em {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar detalhes
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
