import { Button } from "@/components/ui/button";
import { Plus, Lightbulb } from "lucide-react";

interface AutomacoesSectionHeaderProps {
  onNovaAutomacao: () => void;
  onCriarExemplo: () => void;
}

export function AutomacoesSectionHeader({ onNovaAutomacao, onCriarExemplo }: AutomacoesSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Automações</h2>
        <p className="text-muted-foreground">Configure fluxos automáticos para leads e clientes</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCriarExemplo}>
          <Lightbulb className="mr-2 h-4 w-4" />
          Exemplo
        </Button>
        <Button onClick={onNovaAutomacao}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Automação
        </Button>
      </div>
    </div>
  );
}
