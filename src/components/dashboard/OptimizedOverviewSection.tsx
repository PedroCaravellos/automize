import React, { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonMetricCard } from "@/components/ui/skeleton-metric-card";
import { 
  Bot, 
  Building, 
  Zap, 
  Users, 
  Calendar,
  TrendingUp
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useOptimizedRealtime } from "@/hooks/useOptimizedRealtime";
import { businessKeys } from "@/hooks/useBusinessData";
import { useAuth } from "@/contexts/AuthContext";
import MetricCard from "./MetricCard";

interface OverviewSectionProps {
  onNavigateTo: (tab: string) => void;
}

const OptimizedOverviewSection = React.memo(({ onNavigateTo }: OverviewSectionProps) => {
  const { user } = useAuth();
  const { metrics, isLoading, negocioIds } = useDashboardData();

  // Realtime subscriptions para todas as tabelas
  useOptimizedRealtime({
    table: 'negocios',
    queryKey: businessKeys.negocios(user?.id || ''),
    enabled: !!user?.id,
  });

  useOptimizedRealtime({
    table: 'chatbots',
    queryKey: businessKeys.chatbots(negocioIds),
    enabled: negocioIds.length > 0,
  });

  useOptimizedRealtime({
    table: 'leads',
    queryKey: businessKeys.leads(negocioIds),
    enabled: negocioIds.length > 0,
  });

  useOptimizedRealtime({
    table: 'agendamentos',
    queryKey: businessKeys.agendamentos(negocioIds),
    enabled: negocioIds.length > 0,
  });

  const handleNavigate = useCallback((tab: string) => {
    onNavigateTo(tab);
  }, [onNavigateTo]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Visão Geral</h2>
        <p className="text-muted-foreground">
          Resumo do desempenho do seu negócio
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Negócios Cadastrados"
          value={metrics.totalNegocios}
          icon={<Building className="h-5 w-5 text-muted-foreground" />}
          onClick={() => handleNavigate('negocios')}
        />
        
        <MetricCard
          title="Chatbots Ativos"
          value={`${metrics.chatbotsAtivos}/${metrics.totalChatbots}`}
          icon={<Bot className="h-5 w-5 text-muted-foreground" />}
          onClick={() => handleNavigate('chatbots')}
        />
        
        <MetricCard
          title="Leads Capturados"
          value={metrics.totalLeads}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          trend={metrics.leadsNovos > 0 ? "up" : "neutral"}
          onClick={() => handleNavigate('crm')}
        />
        
        <MetricCard
          title="Agendamentos"
          value={`${metrics.agendamentosHoje} hoje`}
          icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
          onClick={() => handleNavigate('agendamentos')}
        />
      </div>

      {metrics.totalNegocios === 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Comece criando seu primeiro negócio
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure seu negócio para começar a usar todas as funcionalidades
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {metrics.totalNegocios > 0 && metrics.totalChatbots === 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Bot className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Configure seu primeiro chatbot
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatize o atendimento e capture leads 24/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

OptimizedOverviewSection.displayName = 'OptimizedOverviewSection';

export default OptimizedOverviewSection;
