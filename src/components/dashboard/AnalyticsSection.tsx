import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, MessageSquare, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  });
  const [loading, setLoading] = useState(true);
  const { chatbots, academias } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
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

      // Calcular métricas
      const totalLeads = leads?.length || 0;
      const totalAgendamentos = agendamentos?.length || 0;
      const vendasFechadas = vendas?.filter(v => v.status === 'fechada') || [];
      const totalVendas = vendasFechadas.reduce((sum, v) => sum + (Number(v.valor) || 0), 0);
      const ticketMedio = vendasFechadas.length > 0 ? totalVendas / vendasFechadas.length : 0;
      const leadsConvertidos = leads?.filter(l => l.status === 'convertido').length || 0;
      const conversationRate = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">Acompanhe o desempenho da sua operação</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(analytics.conversationRate)}% taxa de conversão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAgendamentos}</div>
            <p className="text-xs text-muted-foreground">
              Agendamentos criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalVendas)}</div>
            <p className="text-xs text-muted-foreground">
              Ticket médio: {formatCurrency(analytics.ticketMedio)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chatbots Ativos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chatbots.filter(c => c.status === 'Ativo').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {chatbots.length} total criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academias</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academias.length}</div>
            <p className="text-xs text-muted-foreground">
              Academias cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.conversationRate)}%</div>
            <p className="text-xs text-muted-foreground">
              Leads para vendas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas do Bot (últimos 7 dias) */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Performance do Bot (últimos 7 dias)</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos via Bot</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.agendamentosPorBot}</div>
              <p className="text-xs text-muted-foreground">
                Agendamentos criados pelo chatbot
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads via Bot</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.leadsPorBot}</div>
              <p className="text-xs text-muted-foreground">
                Leads capturados pelo chatbot
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversão do Bot</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.conversaoBot)}%</div>
              <p className="text-xs text-muted-foreground">
                Leads convertidos em agendamentos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leads por Origem */}
      <Card>
        <CardHeader>
          <CardTitle>Leads por Origem</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(analytics.leadsPorOrigem).length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhum dado disponível ainda
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(analytics.leadsPorOrigem).map(([origem, count]) => (
                <div key={origem} className="flex items-center justify-between">
                  <span className="capitalize">{origem}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${((count as number) / analytics.totalLeads) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendas por Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Período</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(analytics.vendasPorMes).length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhuma venda registrada ainda
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(analytics.vendasPorMes).map(([mes, valor]) => (
                <div key={mes} className="flex items-center justify-between">
                  <span>{mes}</span>
                  <span className="font-medium">{formatCurrency(valor as number)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}