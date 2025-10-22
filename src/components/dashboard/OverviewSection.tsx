import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonMetricCard } from "@/components/ui/skeleton-metric-card";
import AIAutoTunePanel from "./AIAutoTunePanel";
import SmartSuggestions from "./SmartSuggestions";
import ExpertModeToggle from "./ExpertModeToggle";
import { useExpertMode } from "./ExpertModeToggle";
import { TemplatesLibrary } from "./TemplatesLibrary";
import { 
  Bot, 
  Building, 
  Zap, 
  TrendingUp, 
  Calendar, 
  Users, 
  Plus,
  MessageSquare,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}

interface ActivityItem {
  id: string;
  type: "chatbot" | "lead" | "agendamento" | "venda";
  title: string;
  description: string;
  timestamp: Date;
}

interface PerformanceData {
  date: string;
  leads: number;
  vendas: number;
  agendamentos: number;
}

function MetricCard({ title, value, change, icon, trend = "neutral", onClick }: MetricCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-muted-foreground";
  };

  const getTrendIcon = () => {
    if (trend === "up") return <ArrowUpRight className="h-3 w-3" />;
    if (trend === "down") return <ArrowDownRight className="h-3 w-3" />;
    return null;
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `Ver detalhes de ${title}` : undefined}
    >
      <div className="absolute inset-0 bg-gradient-card opacity-50" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl md:text-3xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            {change > 0 ? "+" : ""}{change}% vs período anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function OverviewSection({ onNavigateTo }: { onNavigateTo: (tab: string) => void }) {
  const { user } = useAuth();
  const isExpertMode = useExpertMode();
  const [loading, setLoading] = useState(true);
  const [firstNegocioId, setFirstNegocioId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    totalVendas: 0,
    totalAgendamentos: 0,
    chatbotsAtivos: 0,
    leadsChange: 0,
    vendasChange: 0,
    agendamentosChange: 0,
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [visibleSeries, setVisibleSeries] = useState({
    leads: true,
    vendas: true,
    agendamentos: true,
  });

  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries(prev => ({ ...prev, [series]: !prev[series] }));
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch negocios do usuário
      const { data: negocios } = await supabase
        .from("negocios")
        .select("id")
        .eq("user_id", user?.id);

      const negocioIds = negocios?.map(n => n.id) || [];
      
      // Armazenar o primeiro negocio para o AI Auto-Tune
      if (negocioIds.length > 0) {
        setFirstNegocioId(negocioIds[0]);
      }

      if (negocioIds.length === 0) {
        setLoading(false);
        return;
      }

      // Período atual e anterior
      const hoje = new Date();
      const seteDiasAtras = subDays(hoje, 7);
      const quatorzeDiasAtras = subDays(hoje, 14);

      // Fetch dados atuais
      const [leadsAtual, vendasAtual, agendamentosAtual, chatbots] = await Promise.all([
        supabase
          .from("leads")
          .select("*", { count: "exact" })
          .in("negocio_id", negocioIds)
          .gte("created_at", seteDiasAtras.toISOString()),
        
        supabase
          .from("vendas")
          .select("*", { count: "exact" })
          .in("negocio_id", negocioIds)
          .gte("created_at", seteDiasAtras.toISOString()),
        
        supabase
          .from("agendamentos")
          .select("*", { count: "exact" })
          .in("negocio_id", negocioIds)
          .gte("created_at", seteDiasAtras.toISOString()),
        
        supabase
          .from("chatbots")
          .select("*")
          .in("negocio_id", negocioIds)
          .eq("ativo", true)
      ]);

      // Fetch dados anteriores para comparação
      const [leadsAnterior, vendasAnterior, agendamentosAnterior] = await Promise.all([
        supabase
          .from("leads")
          .select("*", { count: "exact" })
          .in("negocio_id", negocioIds)
          .gte("created_at", quatorzeDiasAtras.toISOString())
          .lt("created_at", seteDiasAtras.toISOString()),
        
        supabase
          .from("vendas")
          .select("*", { count: "exact" })
          .in("negocio_id", negocioIds)
          .gte("created_at", quatorzeDiasAtras.toISOString())
          .lt("created_at", seteDiasAtras.toISOString()),
        
        supabase
          .from("agendamentos")
          .select("*", { count: "exact" })
          .in("negocio_id", negocioIds)
          .gte("created_at", quatorzeDiasAtras.toISOString())
          .lt("created_at", seteDiasAtras.toISOString())
      ]);

      // Calcular variações percentuais
      const calcChange = (atual: number, anterior: number) => {
        if (anterior === 0) return atual > 0 ? 100 : 0;
        return Math.round(((atual - anterior) / anterior) * 100);
      };

      setMetrics({
        totalLeads: leadsAtual.count || 0,
        totalVendas: vendasAtual.count || 0,
        totalAgendamentos: agendamentosAtual.count || 0,
        chatbotsAtivos: chatbots.data?.length || 0,
        leadsChange: calcChange(leadsAtual.count || 0, leadsAnterior.count || 0),
        vendasChange: calcChange(vendasAtual.count || 0, vendasAnterior.count || 0),
        agendamentosChange: calcChange(agendamentosAtual.count || 0, agendamentosAnterior.count || 0),
      });

      // Fetch dados para gráfico de performance (últimos 7 dias)
      const performancePromises = Array.from({ length: 7 }, async (_, i) => {
        const date = subDays(hoje, 6 - i);
        const startDate = startOfDay(date);
        const endDate = startOfDay(subDays(date, -1));

        const [leads, vendas, agendamentos] = await Promise.all([
          supabase
            .from("leads")
            .select("id", { count: "exact" })
            .in("negocio_id", negocioIds)
            .gte("created_at", startDate.toISOString())
            .lt("created_at", endDate.toISOString()),
          
          supabase
            .from("vendas")
            .select("id", { count: "exact" })
            .in("negocio_id", negocioIds)
            .gte("created_at", startDate.toISOString())
            .lt("created_at", endDate.toISOString()),
          
          supabase
            .from("agendamentos")
            .select("id", { count: "exact" })
            .in("negocio_id", negocioIds)
            .gte("created_at", startDate.toISOString())
            .lt("created_at", endDate.toISOString())
        ]);

        return {
          date: format(date, "dd/MM", { locale: ptBR }),
          leads: leads.count || 0,
          vendas: vendas.count || 0,
          agendamentos: agendamentos.count || 0,
        };
      });

      const performance = await Promise.all(performancePromises);
      setPerformanceData(performance);

      // Fetch atividade recente
      await fetchRecentActivity(negocioIds);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async (negocioIds: string[]) => {
    try {
      const [leads, vendas, agendamentos, chatbots] = await Promise.all([
        supabase
          .from("leads")
          .select("id, nome, created_at")
          .in("negocio_id", negocioIds)
          .order("created_at", { ascending: false })
          .limit(3),
        
        supabase
          .from("vendas")
          .select("id, cliente_nome, created_at")
          .in("negocio_id", negocioIds)
          .order("created_at", { ascending: false })
          .limit(3),
        
        supabase
          .from("agendamentos")
          .select("id, cliente_nome, servico, created_at")
          .in("negocio_id", negocioIds)
          .order("created_at", { ascending: false })
          .limit(3),
        
        supabase
          .from("chatbots")
          .select("id, nome, created_at")
          .in("negocio_id", negocioIds)
          .order("created_at", { ascending: false })
          .limit(3)
      ]);

      const activities: ActivityItem[] = [];

      leads.data?.forEach(lead => {
        activities.push({
          id: lead.id,
          type: "lead",
          title: "Novo Lead",
          description: lead.nome,
          timestamp: new Date(lead.created_at),
        });
      });

      vendas.data?.forEach(venda => {
        activities.push({
          id: venda.id,
          type: "venda",
          title: "Nova Venda",
          description: venda.cliente_nome,
          timestamp: new Date(venda.created_at),
        });
      });

      agendamentos.data?.forEach(agendamento => {
        activities.push({
          id: agendamento.id,
          type: "agendamento",
          title: "Novo Agendamento",
          description: `${agendamento.cliente_nome} - ${agendamento.servico}`,
          timestamp: new Date(agendamento.created_at),
        });
      });

      chatbots.data?.forEach(chatbot => {
        activities.push({
          id: chatbot.id,
          type: "chatbot",
          title: "Chatbot Criado",
          description: chatbot.nome,
          timestamp: new Date(chatbot.created_at),
        });
      });

      // Ordenar por timestamp
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRecentActivity(activities.slice(0, 8));

    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "chatbot": return <Bot className="h-4 w-4 text-primary" />;
      case "lead": return <Users className="h-4 w-4 text-blue-500" />;
      case "agendamento": return <Calendar className="h-4 w-4 text-purple-500" />;
      case "venda": return <DollarSign className="h-4 w-4 text-green-500" />;
    }
  };

  const getActivityBadgeColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "chatbot": return "bg-primary/10 text-primary border-primary/20";
      case "lead": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "agendamento": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "venda": return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Expert Mode Toggle e Smart Suggestions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <TemplatesLibrary />
        </div>
        {!isExpertMode && <ExpertModeToggle />}
      </div>
      
      {!isExpertMode && (
        <SmartSuggestions onNavigateTo={onNavigateTo} />
      )}

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Leads"
          value={metrics.totalLeads}
          change={metrics.leadsChange}
          trend={metrics.leadsChange > 0 ? "up" : metrics.leadsChange < 0 ? "down" : "neutral"}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          onClick={() => onNavigateTo("vendas")}
        />
        <MetricCard
          title="Vendas"
          value={metrics.totalVendas}
          change={metrics.vendasChange}
          trend={metrics.vendasChange > 0 ? "up" : metrics.vendasChange < 0 ? "down" : "neutral"}
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
          onClick={() => onNavigateTo("vendas")}
        />
        <MetricCard
          title="Agendamentos"
          value={metrics.totalAgendamentos}
          change={metrics.agendamentosChange}
          trend={metrics.agendamentosChange > 0 ? "up" : metrics.agendamentosChange < 0 ? "down" : "neutral"}
          icon={<Calendar className="h-5 w-5 text-purple-500" />}
          onClick={() => onNavigateTo("agendamentos")}
        />
        <MetricCard
          title="Chatbots Ativos"
          value={metrics.chatbotsAtivos}
          icon={<Bot className="h-5 w-5 text-primary" />}
          onClick={() => onNavigateTo("chatbots")}
        />
      </div>

      {/* AI Auto-Tune Panel */}
      {firstNegocioId && (
        <AIAutoTunePanel negocioId={firstNegocioId} />
      )}

      {/* Gráfico de Performance e Atividade Recente */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance (7 dias)
            </CardTitle>
            <CardDescription>Evolução de leads, vendas e agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Controles de Legenda Interativa */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={visibleSeries.leads ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSeries("leads")}
                aria-pressed={visibleSeries.leads}
                aria-label="Toggle leads visibility"
              >
                Leads
              </Button>
              <Button
                variant={visibleSeries.vendas ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSeries("vendas")}
                aria-pressed={visibleSeries.vendas}
                aria-label="Toggle vendas visibility"
              >
                Vendas
              </Button>
              <Button
                variant={visibleSeries.agendamentos ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSeries("agendamentos")}
                aria-pressed={visibleSeries.agendamentos}
                aria-label="Toggle agendamentos visibility"
              >
                Agendamentos
              </Button>
            </div>

            <ChartContainer
              config={{
                leads: {
                  label: "Leads",
                  color: "hsl(var(--chart-1))",
                },
                vendas: {
                  label: "Vendas",
                  color: "hsl(var(--chart-2))",
                },
                agendamentos: {
                  label: "Agendamentos",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  {visibleSeries.leads && (
                    <Area
                      type="monotone"
                      dataKey="leads"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  )}
                  {visibleSeries.vendas && (
                    <Area
                      type="monotone"
                      dataKey="vendas"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  )}
                  {visibleSeries.agendamentos && (
                    <Area
                      type="monotone"
                      dataKey="agendamentos"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Atividade Recente
            </CardTitle>
            <CardDescription>Últimas atualizações do seu negócio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma atividade recente
                </p>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/50 cursor-pointer"
                    onClick={() => {
                      switch(activity.type) {
                        case "lead":
                        case "venda":
                          onNavigateTo("vendas");
                          break;
                        case "agendamento":
                          onNavigateTo("agendamentos");
                          break;
                        case "chatbot":
                          onNavigateTo("chatbots");
                          break;
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        switch(activity.type) {
                          case "lead":
                          case "venda":
                            onNavigateTo("vendas");
                            break;
                          case "agendamento":
                            onNavigateTo("agendamentos");
                            break;
                          case "chatbot":
                            onNavigateTo("chatbots");
                            break;
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver detalhes de ${activity.title}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(activity.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant="outline" className={getActivityBadgeColor(activity.type)}>
                      {activity.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>Acesse rapidamente as funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              onClick={() => onNavigateTo("chatbots")} 
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
            >
              <Bot className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">Chatbots</div>
                <div className="text-xs text-muted-foreground font-normal">Criar ou gerenciar</div>
              </div>
            </Button>

            <Button 
              onClick={() => onNavigateTo("vendas")} 
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
            >
              <Users className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">CRM de Vendas</div>
                <div className="text-xs text-muted-foreground font-normal">Gerenciar leads</div>
              </div>
            </Button>

            <Button 
              onClick={() => onNavigateTo("agendamentos")} 
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
            >
              <Calendar className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <div className="font-medium">Agendamentos</div>
                <div className="text-xs text-muted-foreground font-normal">Ver calendário</div>
              </div>
            </Button>

            <Button 
              onClick={() => onNavigateTo("automacoes")} 
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
            >
              <Zap className="h-5 w-5 text-secondary" />
              <div className="text-left">
                <div className="font-medium">Automações</div>
                <div className="text-xs text-muted-foreground font-normal">Criar workflow</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
