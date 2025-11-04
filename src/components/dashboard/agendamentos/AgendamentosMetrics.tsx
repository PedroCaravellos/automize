import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Phone } from "lucide-react";

interface Agendamento {
  id: string;
  data_hora: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado';
}

interface AgendamentosMetricsProps {
  agendamentos: Agendamento[];
}

export function AgendamentosMetrics({ agendamentos }: AgendamentosMetricsProps) {
  const hoje = agendamentos.filter(a => {
    const today = new Date().toDateString();
    const agendDate = new Date(a.data_hora).toDateString();
    return today === agendDate && a.status !== 'cancelado';
  }).length;

  const estaSemana = agendamentos.filter(a => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const agendDate = new Date(a.data_hora);
    return agendDate >= now && agendDate <= weekFromNow && a.status !== 'cancelado';
  }).length;

  const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
  const realizados = agendamentos.filter(a => a.status === 'realizado').length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hoje}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estaSemana}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{confirmados}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Realizados</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{realizados}</div>
        </CardContent>
      </Card>
    </div>
  );
}
