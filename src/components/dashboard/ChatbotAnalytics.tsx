import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MessageSquare, TrendingUp, Users, Clock } from "lucide-react";

interface ChatbotAnalyticsProps {
  chatbotId: string;
}

export const ChatbotAnalytics = ({ chatbotId }: ChatbotAnalyticsProps) => {
  const [metrics, setMetrics] = useState({
    totalConversations: 0,
    avgMessagesPerConversation: 0,
    leadCaptureRate: 0,
    avgDuration: 0,
  });
  const [conversationTrend, setConversationTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [chatbotId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch conversations for this chatbot
      const { data: conversations, error } = await supabase
        .from("chatbot_conversations")
        .select("*")
        .eq("chatbot_id", chatbotId);

      if (error) throw error;

      if (conversations && conversations.length > 0) {
        // Calculate metrics
        const totalConversations = conversations.length;
        const avgMessages =
          conversations.reduce((sum, conv) => sum + conv.total_messages, 0) /
          totalConversations;
        const leadsGenerated = conversations.filter(
          (conv) => conv.lead_captured
        ).length;
        const leadRate = (leadsGenerated / totalConversations) * 100;

        // Calculate avg duration
        const durations = conversations
          .filter((conv) => conv.ended_at)
          .map((conv) => {
            const start = new Date(conv.started_at).getTime();
            const end = new Date(conv.ended_at!).getTime();
            return (end - start) / 1000 / 60; // minutes
          });
        const avgDur =
          durations.length > 0
            ? durations.reduce((sum, d) => sum + d, 0) / durations.length
            : 0;

        setMetrics({
          totalConversations,
          avgMessagesPerConversation: Math.round(avgMessages),
          leadCaptureRate: Math.round(leadRate),
          avgDuration: Math.round(avgDur),
        });

        // Generate 7-day trend
        const last7Days = [...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split("T")[0];
        });

        const trendData = last7Days.map((date) => {
          const count = conversations.filter((conv) =>
            conv.started_at.startsWith(date)
          ).length;
          return {
            date: new Date(date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            }),
            conversas: count,
          };
        });

        setConversationTrend(trendData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-24 animate-pulse bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    suffix = "",
  }: {
    title: string;
    value: number;
    icon: any;
    suffix?: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">
            {value}
            {suffix}
          </p>
        </div>
        <Icon className="h-8 w-8 text-primary opacity-50" />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Conversas"
          value={metrics.totalConversations}
          icon={MessageSquare}
        />
        <MetricCard
          title="Média de Mensagens"
          value={metrics.avgMessagesPerConversation}
          icon={TrendingUp}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={metrics.leadCaptureRate}
          icon={Users}
          suffix="%"
        />
        <MetricCard
          title="Duração Média (min)"
          value={metrics.avgDuration}
          icon={Clock}
        />
      </div>

      {conversationTrend.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Conversas nos Últimos 7 Dias
          </h3>
          <ChartContainer
            config={{
              conversas: {
                label: "Conversas",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversationTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="conversas"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      )}
    </div>
  );
};
