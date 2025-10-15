import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonMetricCard } from "@/components/ui/skeleton-metric-card";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { DollarSign, Plus, Users, TrendingUp, Target, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import ActionBlockModal from "./ActionBlockModal";
import NovoLeadModal from "./NovoLeadModal";
import EditLeadModal from "./EditLeadModal";

interface Lead {
  id: string;
  negocio_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  origem: 'chatbot' | 'whatsapp' | 'site' | 'indicacao' | 'outro';
  status: 'novo' | 'contatado' | 'qualificado' | 'perdido' | 'convertido';
  pipeline_stage: 'inicial' | 'interesse' | 'visita_agendada' | 'proposta' | 'fechamento';
  interesse?: string;
  observacoes?: string;
  valor_estimado?: number;
  data_ultimo_contato?: string;
  created_at: string;
}

interface Venda {
  id: string;
  lead_id?: string;
  negocio_id: string;
  produto_servico: string;
  valor: number;
  tipo_plano?: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  status: 'proposta' | 'fechada' | 'cancelada';
  data_fechamento?: string;
  observacoes?: string;
  created_at: string;
}
interface NegocioRef { id: string; nome: string; unidade: string | null; }

interface VendasCRMSectionProps {
  onRefreshRequest?: () => void;
}

export default function VendasCRMSection({ onRefreshRequest }: VendasCRMSectionProps = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [negociosDb, setNegociosDb] = useState<NegocioRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { negocios, hasAccess } = useAuth();

  const waitForPropagation = () => new Promise(resolve => setTimeout(resolve, 200));

  const fetchData = useCallback(async () => {
    try {
      // Ensure we have a valid session before making requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No valid session found');
        return;
      }

      const [leadsResponse, vendasResponse, negociosResponse] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('vendas').select('*').order('created_at', { ascending: false }),
        supabase.from('negocios').select('id, nome, unidade')
      ]);

      if (leadsResponse.error) {
        console.error('Erro ao buscar leads:', leadsResponse.error);
        throw leadsResponse.error;
      }
      if (vendasResponse.error) {
        console.error('Erro ao buscar vendas:', vendasResponse.error);
        throw vendasResponse.error;
      }
      if (negociosResponse.error) {
        console.error('Erro ao buscar negócios:', negociosResponse.error);
        throw negociosResponse.error;
      }

      // Map the database data to our interface types, handling missing columns
      const mappedLeads = (leadsResponse.data || []).map(lead => ({
        ...lead,
        pipeline_stage: lead.pipeline_stage || 'inicial',
        valor_estimado: lead.valor_estimado || undefined
      })) as Lead[];
      
      const mappedVendas = (vendasResponse.data || []).map(venda => ({
        ...venda,
        produto_servico: venda.produto_servico || 'Não especificado',
        data_fechamento: venda.data_fechamento || undefined
      })) as Venda[];

      const mappedNegocios = (negociosResponse.data || []).map((n: any) => ({
        id: n.id,
        nome: n.nome,
        unidade: n.unidade || null,
      })) as NegocioRef[];

      setLeads(mappedLeads);
      setVendas(mappedVendas);
      setNegociosDb(mappedNegocios);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de vendas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time sync for leads and vendas
  useRealtimeTable('leads', fetchData);
  useRealtimeTable('vendas', fetchData);

  const handleAddLead = () => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    setIsLeadModalOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este lead?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        throw error;
      }

      toast({
        title: "Lead deletado",
        description: "O lead foi removido com sucesso.",
      });

      await waitForPropagation();
      await fetchData();
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o lead.",
        variant: "destructive",
      });
    }
  };

  const handleEditLead = (lead: Lead) => {
    if (!hasAccess()) {
      setIsBlockModalOpen(true);
      return;
    }
    setEditingLead(lead);
    setIsEditLeadModalOpen(true);
  };

  const getNegocioNome = (negocioId: string) => {
    const nDb = negociosDb.find(n => n.id === negocioId);
    if (nDb) return `${nDb.nome}${nDb.unidade ? ' - ' + nDb.unidade : ''}`;
    const nCtx = negocios.find(n => n.id === negocioId);
    return nCtx ? `${nCtx.nome}${nCtx.unidade ? ' - ' + nCtx.unidade : ''}` : 'Negócio';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      novo: 'bg-blue-100 text-blue-800',
      contatado: 'bg-yellow-100 text-yellow-800',
      qualificado: 'bg-green-100 text-green-800',
      perdido: 'bg-red-100 text-red-800',
      convertido: 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPipelineColor = (stage: string) => {
    const colors = {
      inicial: 'bg-gray-100 text-gray-800',
      interesse: 'bg-blue-100 text-blue-800',
      visita_agendada: 'bg-yellow-100 text-yellow-800',
      proposta: 'bg-orange-100 text-orange-800',
      fechamento: 'bg-green-100 text-green-800',
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalVendasMes = vendas
    .filter(v => v.status === 'fechada' && v.data_fechamento)
    .filter(v => {
      const data = new Date(v.data_fechamento!);
      const agora = new Date();
      return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
    })
    .reduce((sum, v) => sum + v.valor, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <SkeletonList items={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendas & CRM</h2>
          <p className="text-muted-foreground">Gerencie leads e acompanhe vendas</p>
        </div>
        <Button onClick={handleAddLead} disabled={!hasAccess()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Métricas de Vendas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              +{leads.filter(l => {
                const created = new Date(l.created_at);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return created > weekAgo;
              }).length} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'convertido').length / leads.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {leads.filter(l => l.status === 'convertido').length} convertidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVendasMes)}</div>
            <p className="text-xs text-muted-foreground">
              {vendas.filter(v => v.status === 'fechada').length} vendas fechadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendas.filter(v => v.status === 'fechada').length > 0
                ? formatCurrency(totalVendasMes / vendas.filter(v => v.status === 'fechada').length)
                : formatCurrency(0)
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {['inicial', 'interesse', 'visita_agendada', 'proposta', 'fechamento'].map(stage => (
              <div key={stage} className="space-y-2">
                <h4 className="font-semibold text-sm capitalize">
                  {stage.replace('_', ' ')} ({leads.filter(l => l.pipeline_stage === stage).length})
                </h4>
                <div className="space-y-2">
                  {leads.filter(l => l.pipeline_stage === stage).slice(0, 3).map(lead => (
                    <div key={lead.id} className="p-2 border rounded-md bg-card">
                      <p className="font-medium text-sm">{lead.nome}</p>
                      <p className="text-xs text-muted-foreground">{lead.interesse || 'Sem interesse definido'}</p>
                      {lead.valor_estimado && (
                        <p className="text-xs font-medium text-green-600">
                          {formatCurrency(lead.valor_estimado)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Leads Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Nenhum lead ainda</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Os leads aparecerão aqui quando seus chatbots começarem a converter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.slice(0, 10).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{lead.nome}</h4>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                      <Badge variant="outline" className={getPipelineColor(lead.pipeline_stage)}>
                        {lead.pipeline_stage.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getNegocioNome(lead.negocio_id)} • {lead.origem}
                    </p>
                    {lead.observacoes && (
                      <p className="text-sm text-blue-600 font-medium">
                        💬 {lead.observacoes}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      {lead.telefone && (
                        <p className="text-sm text-muted-foreground">📞 {lead.telefone}</p>
                      )}
                      {lead.email && (
                        <p className="text-sm text-muted-foreground">📧 {lead.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      {lead.valor_estimado && (
                        <p className="font-medium text-green-600">
                          {formatCurrency(lead.valor_estimado)}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLead(lead)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      disabled={!hasAccess()}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLead(lead.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={!hasAccess()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ActionBlockModal
        open={isBlockModalOpen}
        onOpenChange={setIsBlockModalOpen}
        onPlansClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.set('tab', 'plan');
          window.history.replaceState({}, '', url.toString());
        }}
        action="gerenciar leads"
      />

      <NovoLeadModal
        open={isLeadModalOpen}
        onOpenChange={setIsLeadModalOpen}
        onLeadCriado={fetchData}
      />

      <EditLeadModal
        open={isEditLeadModalOpen}
        onOpenChange={setIsEditLeadModalOpen}
        lead={editingLead}
        onLeadUpdated={fetchData}
      />
    </div>
  );
}