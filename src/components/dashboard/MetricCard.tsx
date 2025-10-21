import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}

const MetricCard = React.memo(function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend = "neutral", 
  onClick 
}: MetricCardProps) {
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
});

export default MetricCard;
