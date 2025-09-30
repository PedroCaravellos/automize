import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, Pause, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AutomationExecution {
  id: string;
  automacao_id: string;
  lead_id: string;
  status: string;
  etapa_atual_id?: string;
  dados_contexto: any;
  iniciada_em: string;
  concluida_em?: string;
  automacao: {
    nome: string;
  };
  lead: {
    nome: string;
    telefone?: string;
  };
}

export default function AutomationExecutionsTable() {
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('automacao_execucoes')
        .select(`
          *,
          automacao:automacoes(nome),
          lead:leads(nome, telefone)
        `)
        .order('iniciada_em', { ascending: false })
        .limit(50);

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Erro ao buscar execuções:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as execuções.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      executando: { variant: 'default' as const, icon: Play, text: 'Executando' },
      pausada: { variant: 'secondary' as const, icon: Pause, text: 'Pausada' },
      concluida: { variant: 'default' as const, icon: CheckCircle, text: 'Concluída' },
      falhou: { variant: 'destructive' as const, icon: XCircle, text: 'Falhou' }
    };

    const config = variants[status as keyof typeof variants];
    if (!config) return <Badge variant="outline">{status}</Badge>;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getDuration = (iniciada: string, concluida?: string) => {
    const start = new Date(iniciada);
    const end = concluida ? new Date(concluida) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60); // minutos
    
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    return `${Math.floor(diff / 1440)}d ${Math.floor((diff % 1440) / 60)}h`;
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
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Execuções de Automações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">Nenhuma execução encontrada</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              As execuções das automações aparecerão aqui.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Automação</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Iniciada</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{execution.automacao?.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {execution.automacao_id.slice(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{execution.lead?.nome}</div>
                      {execution.lead?.telefone && (
                        <div className="text-sm text-muted-foreground">
                          {execution.lead.telefone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(execution.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(execution.iniciada_em), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {getDuration(execution.iniciada_em, execution.concluida_em)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
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