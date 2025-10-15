import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { AreaChartIcon, LineChartIcon, BarChart3, TrendingUp } from "lucide-react";

interface DataPoint {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
}

interface EnhancedAnalyticsChartProps {
  title: string;
  data: DataPoint[];
  dataKey?: string;
  color: string;
  icon?: any;
  enableBrush?: boolean;
  showReference?: boolean;
  referenceValue?: number;
  onDrillDown?: (dataPoint: DataPoint) => void;
}

type ChartType = "area" | "line" | "bar";

export function EnhancedAnalyticsChart({
  title,
  data,
  dataKey = "value",
  color,
  icon: Icon = TrendingUp,
  enableBrush = true,
  showReference = false,
  referenceValue,
  onDrillDown,
}: EnhancedAnalyticsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");
  const [brushStart, setBrushStart] = useState(0);
  const [brushEnd, setBrushEnd] = useState(data.length - 1);

  const avgValue =
    referenceValue ||
    data.reduce((sum, d) => sum + d.value, 0) / data.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const dataPoint = payload[0].payload as DataPoint;

    return (
      <Card className="p-3 shadow-xl border-2 border-primary/20">
        <div className="space-y-2">
          <p className="font-bold text-lg">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Valor:</span>
              <span className="font-semibold text-lg">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(dataPoint.value)}
              </span>
            </div>

            {dataPoint.previousValue !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Período anterior:
                </span>
                <span className="text-sm">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(dataPoint.previousValue)}
                </span>
              </div>
            )}

            {dataPoint.change !== undefined && (
              <div className="flex items-center justify-between gap-4 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Variação:</span>
                <Badge
                  variant={dataPoint.change >= 0 ? "default" : "destructive"}
                  className="font-semibold"
                >
                  {dataPoint.change >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(dataPoint.change).toFixed(1)}%
                </Badge>
              </div>
            )}
          </div>

          {onDrillDown && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={() => onDrillDown(dataPoint)}
            >
              Ver detalhes
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const renderChart = () => {
    const commonProps = {
      data: data.slice(brushStart, brushEnd + 1),
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const chartConfig = {
      [dataKey]: {
        label: title,
        color: color,
      },
    };

    switch (chartType) {
      case "line":
        return (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart {...commonProps}>
                <defs>
                  <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <Tooltip content={<CustomTooltip />} />
                {showReference && (
                  <ReferenceLine
                    y={avgValue}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label={{
                      value: "Média",
                      position: "right",
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ fill: color, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case "bar":
        return (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart {...commonProps}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <Tooltip content={<CustomTooltip />} />
                {showReference && (
                  <ReferenceLine
                    y={avgValue}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label="Média"
                  />
                )}
                <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      default: // area
        return (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart {...commonProps}>
                <defs>
                  <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <Tooltip content={<CustomTooltip />} />
                {showReference && (
                  <ReferenceLine
                    y={avgValue}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label="Média"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  fillOpacity={1}
                  fill={`url(#gradient-${dataKey})`}
                  strokeWidth={2}
                />
                {enableBrush && (
                  <Brush
                    dataKey="name"
                    height={30}
                    stroke={color}
                    fill="hsl(var(--muted))"
                    onChange={(range: any) => {
                      if (range?.startIndex !== undefined && range?.endIndex !== undefined) {
                        setBrushStart(range.startIndex);
                        setBrushEnd(range.endIndex);
                      }
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" style={{ color }} />
          {title}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={chartType === "area" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("area")}
            className="h-8 px-2"
          >
            <AreaChartIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("line")}
            className="h-8 px-2"
          >
            <LineChartIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("bar")}
            className="h-8 px-2"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="h-[280px] w-full">{renderChart()}</div>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Dados insuficientes para exibir gráfico</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
