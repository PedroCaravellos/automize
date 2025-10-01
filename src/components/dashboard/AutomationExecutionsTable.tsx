import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { PlayCircle, CheckCircle, XCircle, Clock } from "lucide-react";

interface Execucao {
  id: string;
  automacao_id: string;
  lead_id: string | null;
  status: string;
  iniciada_em: string;
  concluida_em: string | null;
  automacoes: {
    nome: string;
  };
}

export default function AutomationExecutionsTable() {
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecucoes();
  }, []);

  const fetchExecucoes = async () => {
    try {
      // Temporariamente desabilitado até a tabela estar completamente configurada
      setExecucoes([]);
    } catch (error) {
      console.error('Erro ao buscar execuções:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'executando':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'concluida':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'falhou':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pausada':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      executando: 'default',
      concluida: 'success',
      falhou: 'destructive',
      pausada: 'secondary',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Execuções</CardTitle>
      </CardHeader>
      <CardContent>
        {execucoes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma execução registrada ainda.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Automação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Iniciada</TableHead>
                <TableHead>Concluída</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {execucoes.map((exec) => (
                <TableRow key={exec.id}>
                  <TableCell className="font-medium">
                    {exec.automacoes?.nome || 'Automação'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(exec.status)}
                      {getStatusBadge(exec.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(exec.iniciada_em).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {exec.concluida_em
                      ? new Date(exec.concluida_em).toLocaleString('pt-BR')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
