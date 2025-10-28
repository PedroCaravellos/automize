import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Phone, MessageCircle, Calendar, Check, Copy, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LeadContextMenuProps {
  children: React.ReactNode;
  lead: any;
  onEdit?: (lead: any) => void;
  onDelete?: (leadId: string) => void;
  onSchedule?: (leadId: string) => void;
  onConvert?: (leadId: string) => void;
}

export default function LeadContextMenu({
  children,
  lead,
  onEdit,
  onDelete,
  onSchedule,
  onConvert,
}: LeadContextMenuProps) {
  const handleCopyPhone = () => {
    if (lead.telefone) {
      navigator.clipboard.writeText(lead.telefone);
      toast({
        title: "Número copiado!",
        description: "O telefone foi copiado para a área de transferência.",
      });
    }
  };

  const handleWhatsApp = () => {
    if (lead.telefone) {
      const phone = lead.telefone.replace(/\D/g, "");
      window.open(`https://wa.me/55${phone}`, "_blank");
    }
  };

  const handleCall = () => {
    if (lead.telefone) {
      window.location.href = `tel:${lead.telefone}`;
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {lead.telefone && (
          <>
            <ContextMenuItem onClick={handleWhatsApp}>
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>Abrir no WhatsApp</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCall}>
              <Phone className="mr-2 h-4 w-4" />
              <span>Ligar</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCopyPhone}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copiar número</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {onSchedule && (
          <ContextMenuItem onClick={() => onSchedule(lead.id)}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Agendar reunião</span>
          </ContextMenuItem>
        )}

        {onConvert && lead.status !== "convertido" && (
          <ContextMenuItem onClick={() => onConvert(lead.id)}>
            <Check className="mr-2 h-4 w-4" />
            <span>Marcar como convertido</span>
          </ContextMenuItem>
        )}

        {onEdit && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onEdit(lead)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </ContextMenuItem>
          </>
        )}

        {onDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => onDelete(lead.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Deletar</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
