import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users, Calendar, MessageSquare, Clock, Zap, Edit, Trash2 } from "lucide-react";

interface Automacao {
  id: string;
  negocio_id: string;
  nome: string;
  descricao?: string;
  trigger_type: 'novo_lead' | 'agendamento' | 'follow_up' | 'tempo_decorrido';
  ativo: boolean;
}

interface AutomacoesListProps {
  automacoes: Automacao[];
  onToggle: (id: string, ativo: boolean) => Promise<void>;
  onEdit: (automacao: Automacao) => void;
  onDelete: (id: string, nome: string) => Promise<void>;
  getNegocioNome: (id: string) => string;
}

const getTriggerIcon = (trigger: string) => {
  const icons = {
    novo_lead: Users,
    agendamento: Calendar,
    follow_up: MessageSquare,
    tempo_decorrido: Clock,
  };
  return icons[trigger as keyof typeof icons] || Zap;
};

const getTriggerLabel = (trigger: string) => {
  const labels = {
    novo_lead: 'Novo Lead',
    agendamento: 'Agendamento',
    follow_up: 'Follow-up',
    tempo_decorrido: 'Tempo Decorrido',
  };
  return labels[trigger as keyof typeof labels] || trigger;
};

export function AutomacoesList({ automacoes, onToggle, onEdit, onDelete, getNegocioNome }: AutomacoesListProps) {
  if (automacoes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma automação criada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie sua primeira automação para começar a automatizar seus processos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {automacoes.map((automacao) => {
        const TriggerIcon = getTriggerIcon(automacao.trigger_type);
        
        return (
          <Card key={automacao.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TriggerIcon className="h-5 w-5 text-primary" />
                  <Badge variant={automacao.ativo ? "default" : "secondary"}>
                    {getTriggerLabel(automacao.trigger_type)}
                  </Badge>
                </div>
                <Switch
                  checked={automacao.ativo}
                  onCheckedChange={(checked) => onToggle(automacao.id, checked)}
                />
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{automacao.nome}</h3>
              
              {automacao.descricao && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {automacao.descricao}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground mb-4">
                {getNegocioNome(automacao.negocio_id)}
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(automacao)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(automacao.id, automacao.nome)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
