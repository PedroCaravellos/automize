import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

type TrendType = 'up' | 'down' | 'stable';

interface MetricData {
  value: number;
  change: number;
  trend: TrendType;
}

interface AnalyticsKPICardsProps {
  metrics: {
    totalLeads: MetricData;
    totalRevenue: MetricData;
    conversionRate: MetricData;
    avgTicket: MetricData;
  };
  icons: {
    totalLeads: any;
    totalRevenue: any;
    conversionRate: any;
    avgTicket: any;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  trend: TrendType;
  icon: any;
  format?: 'number' | 'currency' | 'percentage';
}

function MetricCard({ title, value, change, trend, icon: Icon, format = 'number' }: MetricCardProps) {
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
}

export function AnalyticsKPICards({ metrics, icons }: AnalyticsKPICardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total de Leads"
        value={metrics.totalLeads.value}
        change={metrics.totalLeads.change}
        trend={metrics.totalLeads.trend}
        icon={icons.totalLeads}
      />
      <MetricCard
        title="Receita Total"
        value={metrics.totalRevenue.value}
        change={metrics.totalRevenue.change}
        trend={metrics.totalRevenue.trend}
        icon={icons.totalRevenue}
        format="currency"
      />
      <MetricCard
        title="Taxa de Conversão"
        value={metrics.conversionRate.value}
        change={metrics.conversionRate.change}
        trend={metrics.conversionRate.trend}
        icon={icons.conversionRate}
        format="percentage"
      />
      <MetricCard
        title="Ticket Médio"
        value={metrics.avgTicket.value}
        change={metrics.avgTicket.change}
        trend={metrics.avgTicket.trend}
        icon={icons.avgTicket}
        format="currency"
      />
    </div>
  );
}
