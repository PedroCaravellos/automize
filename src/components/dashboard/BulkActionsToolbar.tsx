import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckSquare, 
  Square, 
  MessageSquare, 
  Archive, 
  Trash2, 
  UserCheck, 
  UserCog,
  X
} from "lucide-react";
import { LeadItem } from "@/types";

interface BulkActionsToolbarProps {
  selectedLeads: string[];
  totalLeads: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkAction: (action: string, status?: string) => void;
}

export default function BulkActionsToolbar({
  selectedLeads,
  totalLeads,
  onSelectAll,
  onClearSelection,
  onBulkAction,
}: BulkActionsToolbarProps) {
  const isAllSelected = selectedLeads.length === totalLeads && totalLeads > 0;
  const hasSelection = selectedLeads.length > 0;

  if (!hasSelection) {
    return (
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
          >
            <Square className="h-4 w-4 mr-2" />
            Selecionar todos ({totalLeads})
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Selecione leads para ações em massa
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-primary/5 animate-in slide-in-from-top">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={isAllSelected ? onClearSelection : onSelectAll}
        >
          {isAllSelected ? (
            <CheckSquare className="h-4 w-4 mr-2 text-primary" />
          ) : (
            <Square className="h-4 w-4 mr-2" />
          )}
          {isAllSelected ? 'Desmarcar todos' : 'Selecionar todos'}
        </Button>
        
        <Badge variant="secondary" className="font-semibold">
          {selectedLeads.length} selecionado{selectedLeads.length !== 1 ? 's' : ''}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <UserCheck className="h-4 w-4 mr-2" />
              Alterar Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onBulkAction('update_status', 'novo')}>
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              Novo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkAction('update_status', 'contatado')}>
              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
              Contatado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkAction('update_status', 'qualificado')}>
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
              Qualificado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkAction('update_status', 'ganho')}>
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              Ganho
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkAction('update_status', 'perdido')}>
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              Perdido
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction('send_followup')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Enviar Follow-up
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction('archive')}
        >
          <Archive className="h-4 w-4 mr-2" />
          Arquivar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <UserCog className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => onBulkAction('delete')}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir selecionados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
