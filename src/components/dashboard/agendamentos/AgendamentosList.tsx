import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2 } from "lucide-react";

interface Agendamento {
  id: string;
  negocio_id: string;
  cliente_nome: string;
  cliente_telefone?: string;
  data_hora: string;
  servico: string;
  observacoes?: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado';
}

interface AgendamentosListProps {
  agendamentos: Agendamento[];
  getNegocioNome: (id: string) => string;
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (agendamento: Agendamento) => void;
  hasAccess: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getStatusColor = (status: string) => {
  const colors = {
    agendado: 'bg-blue-100 text-blue-800',
    confirmado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
    realizado: 'bg-gray-100 text-gray-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export function AgendamentosList({ agendamentos, getNegocioNome, onEdit, onDelete, hasAccess }: AgendamentosListProps) {
  if (agendamentos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">Nenhum agendamento</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Comece criando seu primeiro agendamento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agendamentos.slice(0, 10).map((agendamento) => (
            <div key={agendamento.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{agendamento.cliente_nome}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(agendamento.status)}`}>
                    {agendamento.status}
                  </span>
                  {(agendamento as any).isDemo && (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      DEMO
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{agendamento.servico}</p>
                <p className="text-sm text-muted-foreground">
                  {getNegocioNome(agendamento.negocio_id)}
                </p>
                {agendamento.cliente_telefone && (
                  <p className="text-sm text-muted-foreground">
                    📞 {agendamento.cliente_telefone}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-medium">{formatDate(agendamento.data_hora)}</p>
                  {agendamento.observacoes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {agendamento.observacoes}
                    </p>
                  )}
                </div>
                {!(agendamento as any).isDemo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(agendamento)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    disabled={!hasAccess}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(agendamento)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
