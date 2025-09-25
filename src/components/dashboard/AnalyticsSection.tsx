import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Users, MessageSquare, Calendar, DollarSign, Target, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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
    // Novos dados para métricas avançadas
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
  const { chatbots, academias } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Ensure we have a valid session before making requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No valid session found for analytics');
        return;
      }

      // Buscar dados de leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('origem, status, valor_estimado, created_at');

      // Buscar dados de agendamentos
      const { data: agendamentos, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select('status, created_at');

      // Buscar dados de vendas
      const { data: vendas, error: vendasError } = await supabase
        .from('vendas')
        .select('valor, status, data_fechamento, created_at');

      if (leadsError || agendamentosError || vendasError) {
        throw leadsError || agendamentosError || vendasError;
      }

      // Calcular métricas atuais
      const totalLeads = leads?.length || 0;
      const totalAgendamentos = agendamentos?.length || 0;
      const vendasFechadas = vendas?.filter(v => v.status === 'fechada') || [];
      const totalVendas = vendasFechadas.reduce((sum, v) => sum + (Number(v.valor) || 0), 0);
      const ticketMedio = vendasFechadas.length > 0 ? totalVendas / vendasFechadas.length : 0;
      const leadsConvertidos = leads?.filter(l => l.status === 'convertido').length || 0;
      const conversationRate = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0;

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
      console.error('Erro ao buscar analytics:', error);
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

  const MetricCard = ({ title, value, change, trend, icon: Icon, format = 'number' }: {
    title: string;
    value: number;
    change: number;
    trend: TrendType;
    icon: any;
    format?: 'number' | 'currency' | 'percentage';
  }) => {
    const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;
    const trendColor = trend === 'up' ? 'text-secondary' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
    
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-card opacity-50" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold text-foreground mb-2">
            {format === 'currency' ? formatCurrency(value) : 
             format === 'percentage' ? `${value.toFixed(1)}%` : 
             value.toLocaleString('pt-BR')}
          </div>
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span>{formatPercentage(change)}</span>
            <span className="text-muted-foreground text-xs">vs mês anterior</span>
          </div>
        </CardContent>
      </Card>
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Analytics</h2>
          <p className="text-muted-foreground mt-1">Visão completa do desempenho do seu negócio</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Última atualização</div>
          <div className="text-sm font-medium">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Leads"
          value={analytics.metrics.totalLeads.value}
          change={analytics.metrics.totalLeads.change}
          trend={analytics.metrics.totalLeads.trend}
          icon={Users}
        />
        <MetricCard
          title="Receita Total"
          value={analytics.metrics.totalRevenue.value}
          change={analytics.metrics.totalRevenue.change}
          trend={analytics.metrics.totalRevenue.trend}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={analytics.metrics.conversionRate.value}
          change={analytics.metrics.conversionRate.change}
          trend={analytics.metrics.conversionRate.trend}
          icon={Target}
          format="percentage"
        />
        <MetricCard
          title="Ticket Médio"
          value={analytics.metrics.avgTicket.value}
          change={analytics.metrics.avgTicket.change}
          trend={analytics.metrics.avgTicket.trend}
          icon={TrendingUp}
          format="currency"
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Evolução da Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.chartData.revenue.length > 0 ? (
              <div className="h-[200px] w-full">
                <ChartContainer
                  config={{
                    value: {
                      label: "Receita",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.chartData.revenue}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Dados insuficientes para exibir gráfico</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              Leads Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.chartData.leads.length > 0 ? (
              <div className="h-[200px] w-full">
                <ChartContainer
                  config={{
                    value: {
                      label: "Leads",
                      color: "hsl(var(--secondary))",
                    },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.chartData.leads}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--secondary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Dados insuficientes para exibir gráfico</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chatbots Ativos</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatbots.filter(c => c.status === 'Ativo').length}</div>
            <p className="text-xs text-muted-foreground">
              {chatbots.length} total criados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAgendamentos}</div>
            <p className="text-xs text-muted-foreground">
              Total de agendamentos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negócios</CardTitle>
            <BarChart3 className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academias.length}</div>
            <p className="text-xs text-muted-foreground">
              Negócios cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

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