import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AgendamentosSectionHeaderProps {
  onNovoAgendamento: () => void;
  hasAccess: boolean;
}

export function AgendamentosSectionHeader({ onNovoAgendamento, hasAccess }: AgendamentosSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Agendamentos</h2>
        <p className="text-muted-foreground">Gerencie agendamentos e consultas</p>
      </div>
      <Button 
        disabled={!hasAccess} 
        onClick={onNovoAgendamento}
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo Agendamento
      </Button>
    </div>
  );
}
