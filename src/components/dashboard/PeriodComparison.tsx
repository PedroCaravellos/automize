import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MetricComparison {
  name: string;
  current: number;
  previous: number;
  format?: "number" | "currency" | "percentage";
}

interface PeriodComparisonProps {
  metrics: MetricComparison[];
  currentPeriod: string;
  previousPeriod: string;
}

export const PeriodComparison = ({
  metrics,
  currentPeriod,
  previousPeriod,
}: PeriodComparisonProps) => {
  const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600 bg-green-50 border-green-200";
    if (change < 0) return "text-red-600 bg-red-50 border-red-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Comparação de Períodos</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {currentPeriod} vs {previousPeriod}
        </p>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => {
          const change = getChange(metric.current, metric.previous);
          const isPositive = change > 0;
          const isNegative = change < 0;

          return (
            <div
              key={metric.name}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{metric.name}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Atual</p>
                    <p className="text-lg font-semibold">
                      {formatValue(metric.current, metric.format)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Anterior</p>
                    <p className="text-lg">
                      {formatValue(metric.previous, metric.format)}
                    </p>
                  </div>
                </div>
              </div>

              <Badge
                variant="outline"
                className={`ml-4 ${getTrendColor(change)} flex items-center gap-1`}
              >
                {getTrendIcon(change)}
                <span className="font-semibold">
                  {change > 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
