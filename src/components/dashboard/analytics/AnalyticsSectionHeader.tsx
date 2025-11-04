import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsSectionHeaderProps {
  selectedNegocio: string;
  onNegocioChange: (value: string) => void;
  negocios: Array<{ id: string; nome: string; unidade?: string }>;
}

export function AnalyticsSectionHeader({ selectedNegocio, onNegocioChange, negocios }: AnalyticsSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Analytics</h2>
        <p className="text-muted-foreground mt-1">Visão completa do desempenho do seu negócio</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedNegocio} onValueChange={onNegocioChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por negócio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os negócios</SelectItem>
              {negocios.map((negocio) => (
                <SelectItem key={negocio.id} value={negocio.id}>
                  {negocio.nome}
                  {negocio.unidade && ` - ${negocio.unidade}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Última atualização</div>
          <div className="text-sm font-medium">
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}
