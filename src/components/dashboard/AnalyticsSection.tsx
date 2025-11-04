import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, MessageSquare, Calendar, DollarSign, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SalesFunnel } from "./SalesFunnel";
import { PeriodComparison } from "./PeriodComparison";
import { ReportExport } from "./ReportExport";
import { EnhancedAnalyticsChart } from "./EnhancedAnalyticsChart";
import { AnalyticsSectionHeader } from "./analytics/AnalyticsSectionHeader";
import { AnalyticsKPICards } from "./analytics/AnalyticsKPICards";

interface MetricData {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface ChartDataPoint {
  name: string;
  value: number;
  previousValue?: number;
}

type TrendType = 'up' | 'down' | 'stable';

export default function AnalyticsSection() {
  const [selectedNegocio, setSelectedNegocio] = useState<string>("all");
  const [negocios, setNegocios] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    totalAgendamentos: 0,
    totalVendas: 0,
    conversationRate: 0,
    ticketMedio: 0,
    leadsPorOrigem: {},
    vendasPorMes: {},
    agendamentosPorBot: 0,
    leadsPorBot: 0,
    conversaoBot: 0,
    totalNegocios: 0,
    // Dados para funil
    funnelData: {
      leads: 0,
      contacted: 0,
      scheduled: 0,
      converted: 0,
    },
    // Dados para exportação
    exportData: [] as any[],
    metrics: {
      totalLeads: { value: 0, change: 0, trend: 'stable' as TrendType },
      totalRevenue: { value: 0, change: 0, trend: 'stable' as TrendType },
      conversionRate: { value: 0, change: 0, trend: 'stable' as TrendType },
      avgTicket: { value: 0, change: 0, trend: 'stable' as TrendType },
    },
    chartData: {
      revenue: [] as ChartDataPoint[],
      leads: [] as ChartDataPoint[],
      conversions: [] as ChartDataPoint[],
    }
  });
  const [loading, setLoading] = useState(true);
  const { chatbots, user } = useAuth();

  useEffect(() => {
    fetchNegocios();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedNegocio]);

  const fetchNegocios = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('negocios')
        .select('id, nome, unidade')
        .eq('user_id', session.user.id);

      if (error) throw error;
      setNegocios(data || []);
    } catch (error) {
      // Silent fail - non-critical
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Filtro por negócio
      let leadsQuery = supabase.from('leads').select('origem, status, valor_estimado, created_at, pipeline_stage, negocio_id');
      let agendamentosQuery = supabase.from('agendamentos').select('status, created_at, negocio_id');
      let vendasQuery = supabase.from('vendas').select('valor, status, data_fechamento, created_at, negocio_id');

      if (selectedNegocio !== "all") {
        leadsQuery = leadsQuery.eq('negocio_id', selectedNegocio);
        agendamentosQuery = agendamentosQuery.eq('negocio_id', selectedNegocio);
        vendasQuery = vendasQuery.eq('negocio_id', selectedNegocio);
      }

      const [
        { data: leads, error: leadsError },
        { data: agendamentos, error: agendamentosError },
        { data: vendas, error: vendasError },
        { data: negociosData, error: negociosError }
      ] = await Promise.all([
        leadsQuery,
        agendamentosQuery,
        vendasQuery,
        supabase.from('negocios').select('id, nome, tipo_negocio, segmento').eq('user_id', session.user.id)
      ]);

      if (leadsError || agendamentosError || vendasError || negociosError) {
        throw leadsError || agendamentosError || vendasError || negociosError;
      }

      // Calcular métricas atuais
      const totalLeads = leads?.length || 0;
      const totalAgendamentos = agendamentos?.length || 0;
      const totalNegocios = negociosData?.length || 0;
      const vendasFechadas = vendas?.filter(v => v.status === 'fechada' || v.status === 'ativa') || [];
      const totalVendas = vendasFechadas.reduce((sum, v) => sum + (Number(v.valor) || 0), 0);
      const ticketMedio = vendasFechadas.length > 0 ? totalVendas / vendasFechadas.length : 0;
      const leadsConvertidos = leads?.filter(l => l.status === 'convertido').length || 0;
      const conversationRate = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0;

      // Dados do funil
      const leadsContacted = leads?.filter(l => l.pipeline_stage !== 'novo').length || 0;
      const funnelData = {
        leads: totalLeads,
        contacted: leadsContacted,
        scheduled: totalAgendamentos,
        converted: vendasFechadas.length,
      };

      // Preparar dados para exportação
      const exportData = leads?.map(lead => ({
        data: new Date(lead.created_at).toLocaleDateString('pt-BR'),
        origem: lead.origem || 'N/A',
        status: lead.status,
        pipeline: lead.pipeline_stage || 'N/A',
        valor_estimado: lead.valor_estimado || 0,
      })) || [];

      // Calcular dados do mês anterior para comparação
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const leadsLastMonth = leads?.filter(l => new Date(l.created_at) >= lastMonth && new Date(l.created_at) < new Date()).length || 0;
      const vendasLastMonth = vendas?.filter(v => v.status === 'fechada' && new Date(v.created_at || '') >= lastMonth && new Date(v.created_at || '') < new Date()).reduce((sum, v) => sum + (Number(v.valor) || 0), 0) || 0;
      
      // Calcular tendências
      const leadsChange = leadsLastMonth > 0 ? ((totalLeads - leadsLastMonth) / leadsLastMonth) * 100 : 0;
      const revenueChange = vendasLastMonth > 0 ? ((totalVendas - vendasLastMonth) / vendasLastMonth) * 100 : 0;
      const conversionChange = 0; // Simplificado para esta versão

      // Leads por origem
      const leadsPorOrigem = leads?.reduce((acc: any, lead) => {
        const origem = lead.origem || 'sem origem';
        acc[origem] = (acc[origem] || 0) + 1;
        return acc;
      }, {}) || {};

      // Vendas por mês (últimos 6 meses)
      const vendasPorMes = vendasFechadas.reduce((acc: any, venda) => {
        const data = new Date(venda.data_fechamento || venda.created_at);
        const mes = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        acc[mes] = (acc[mes] || 0) + (Number(venda.valor) || 0);
        return acc;
      }, {});

      // Preparar dados para gráficos
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      }).reverse();

      const revenueChartData: ChartDataPoint[] = last6Months.map(month => ({
        name: month,
        value: vendasPorMes[month] || 0
      }));

      const leadsChartData: ChartDataPoint[] = last6Months.map(month => {
        const monthLeads = leads?.filter(l => {
          const leadDate = new Date(l.created_at);
          const leadMonth = leadDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          return leadMonth === month;
        }).length || 0;
        return { name: month, value: monthLeads };
      });

      // Métricas específicas do bot (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const agendamentosPorBot = agendamentos?.filter(a => 
        new Date(a.created_at) >= sevenDaysAgo
      ).length || 0;

      const leadsPorBot = leads?.filter(l => 
        l.origem === 'chatbot' && new Date(l.created_at) >= sevenDaysAgo
      ).length || 0;

      const conversaoBot = leadsPorBot > 0 ? (agendamentosPorBot / leadsPorBot) * 100 : 0;

      setAnalytics({
        totalLeads,
        totalAgendamentos,
        totalVendas,
        conversationRate,
        ticketMedio,
        leadsPorOrigem,
        vendasPorMes,
        agendamentosPorBot,
        leadsPorBot,
        conversaoBot,
        totalNegocios,
        funnelData,
        exportData,
        metrics: {
          totalLeads: { 
            value: totalLeads, 
            change: leadsChange, 
            trend: leadsChange > 0 ? 'up' : leadsChange < 0 ? 'down' : 'stable' 
          },
          totalRevenue: { 
            value: totalVendas, 
            change: revenueChange, 
            trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable' 
          },
          conversionRate: { 
            value: conversationRate, 
            change: conversionChange, 
            trend: 'stable' 
          },
          avgTicket: { 
            value: ticketMedio, 
            change: 0, 
            trend: 'stable' 
          },
        },
        chartData: {
          revenue: revenueChartData,
          leads: leadsChartData,
          conversions: [],
        }
      });
    } catch (error) {
      // Silent fail - non-critical
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnalyticsSectionHeader 
        selectedNegocio={selectedNegocio}
        onNegocioChange={setSelectedNegocio}
        negocios={negocios}
      />

      <AnalyticsKPICards 
        metrics={analytics.metrics}
        icons={{
          totalLeads: Users,
          totalRevenue: DollarSign,
          conversionRate: Target,
          avgTicket: TrendingUp,
        }}
      />

      {/* Gráficos Interativos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EnhancedAnalyticsChart
          title="Evolução da Receita"
          data={analytics.chartData.revenue}
          color="hsl(var(--primary))"
          icon={BarChart3}
          enableBrush={true}
          showReference={true}
          onDrillDown={(dataPoint) => {
            // Handle drill down
          }}
        />

        <EnhancedAnalyticsChart
          title="Leads Mensais"
          data={analytics.chartData.leads}
          color="hsl(var(--secondary))"
          icon={Users}
          enableBrush={true}
          showReference={true}
          onDrillDown={(dataPoint) => {
            // Handle drill down
          }}
        />
      </div>

      {/* Funil de Vendas */}
      <SalesFunnel
        leads={analytics.funnelData.leads}
        contacted={analytics.funnelData.contacted}
        scheduled={analytics.funnelData.scheduled}
        converted={analytics.funnelData.converted}
      />

      {/* Comparação de Períodos */}
      <PeriodComparison
        currentPeriod="Mês Atual"
        previousPeriod="Mês Anterior"
        metrics={[
          { name: "Leads", current: analytics.metrics.totalLeads.value, previous: Math.round(analytics.metrics.totalLeads.value / (1 + analytics.metrics.totalLeads.change / 100)), format: "number" },
          { name: "Receita", current: analytics.metrics.totalRevenue.value, previous: Math.round(analytics.metrics.totalRevenue.value / (1 + analytics.metrics.totalRevenue.change / 100)), format: "currency" },
          { name: "Taxa de Conversão", current: analytics.metrics.conversionRate.value, previous: analytics.metrics.conversionRate.value, format: "percentage" },
        ]}
      />

      {/* Exportação de Relatórios */}
      <ReportExport 
        data={analytics.exportData} 
        negocioName={selectedNegocio !== "all" ? negocios.find(n => n.id === selectedNegocio)?.nome : undefined}
      />

      {/* Performance do Bot */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Performance do Chatbot
            <div className="ml-auto">
              <span className="inline-flex items-center rounded-full border border-secondary bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                Últimos 7 dias
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-gradient-accent rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Leads Capturados</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">{analytics.leadsPorBot}</div>
              <div className="text-xs text-muted-foreground">via chatbot</div>
            </div>
            
            <div className="bg-gradient-accent rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Agendamentos</span>
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
              <div className="text-2xl font-bold">{analytics.agendamentosPorBot}</div>
              <div className="text-xs text-muted-foreground">criados pelo bot</div>
            </div>
            
            <div className="bg-gradient-accent rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Taxa de Conversão</span>
                <Target className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="text-2xl font-bold">{Math.round(analytics.conversaoBot)}%</div>
              <div className="text-xs text-muted-foreground">lead → agendamento</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise Detalhada */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Leads por Origem
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.leadsPorOrigem).length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                <p className="mt-4 text-muted-foreground">Nenhum lead registrado ainda</p>
                <p className="text-sm text-muted-foreground">Dados aparecerão conforme os leads chegarem</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.leadsPorOrigem).map(([origem, count]) => (
                  <div key={origem} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-medium">{origem}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count as number}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round(((count as number) / analytics.totalLeads) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${((count as number) / analytics.totalLeads) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-secondary" />
              Receita por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.vendasPorMes).length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                <p className="mt-4 text-muted-foreground">Nenhuma venda registrada</p>
                <p className="text-sm text-muted-foreground">Receita será exibida após as primeiras vendas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.vendasPorMes)
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .map(([mes, valor]) => (
                  <div key={mes} className="flex items-center justify-between p-3 rounded-lg bg-gradient-accent">
                    <div>
                      <div className="font-medium">{mes}</div>
                      <div className="text-sm text-muted-foreground">Receita mensal</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(valor as number)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}