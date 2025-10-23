import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Link2, TrendingUp, PlayCircle, ExternalLink } from "lucide-react";
import { ContextService, BusinessContext } from "@/services/contextService";
import { NegocioItem, ChatbotItem, LeadItem, AutomacaoItem } from "@/types";
import InlineActionCard from "./InlineActionCard";
import ProactiveAIPanel from "./ProactiveAIPanel";
import ProgressiveOnboarding from "./ProgressiveOnboarding";
import NaturalLanguageAutomation from "./NaturalLanguageAutomation";
import { useToast } from "@/hooks/use-toast";

interface AdaptiveDashboardProps {
  negocios: NegocioItem[];
  chatbots: ChatbotItem[];
  leads: LeadItem[];
  automacoes: AutomacaoItem[];
  onOpenSimulator?: () => void;
  onOpenSchedule?: (leadId: string) => void;
  onActionClick?: (action: string) => void;
}

export default function AdaptiveDashboard({
  negocios,
  chatbots,
  leads,
  automacoes,
  onOpenSimulator,
  onOpenSchedule,
  onActionClick
}: AdaptiveDashboardProps) {
  const { toast } = useToast();
  const [context, setContext] = useState<BusinessContext>('novo_usuario');
  const [analysis, setAnalysis] = useState<ReturnType<typeof ContextService.analyzeBusinessContext>>();

  useEffect(() => {
    const result = ContextService.analyzeBusinessContext(negocios, chatbots, leads, automacoes);
    setContext(result.context);
    setAnalysis(result);
  }, [negocios, chatbots, leads, automacoes]);

  const handleCopyLink = () => {
    const link = `https://automiza.app/chat/${chatbots[0]?.id || 'demo'}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Cole no Instagram, WhatsApp ou no seu site.",
    });
  };

  const handleSendFollowup = () => {
    toast({
      title: "Follow-up enviado!",
      description: "Mensagens automáticas foram enviadas para os leads.",
    });
  };

  const renderContextualContent = () => {
    switch (context) {
      case 'novo_usuario':
        return (
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-3">🎉 Parabéns! Seu negócio está pronto</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Seu chatbot já está configurado e pode capturar leads e agendar horários
                </p>
                
                <div className="bg-background/80 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-lg mb-3">✨ Seu chatbot já pode:</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Responder perguntas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Capturar leads</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Agendar horários</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={onOpenSimulator}>
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Testar Chatbot Agora
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => onActionClick?.('see-dashboard')}>
                    Ver Dashboard Completo
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  💡 Dica: Teste agora mesmo para ver como funciona!
                </p>
              </div>
            </Card>

            <ProgressiveOnboarding
              negocios={negocios}
              chatbots={chatbots}
              leads={leads}
              onActionClick={onActionClick}
            />
          </div>
        );

      case 'chatbot_testado':
        return (
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                  <Link2 className="h-8 w-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold mb-3">💪 Chatbot testado! Agora vamos capturar leads</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Compartilhe o link do seu chatbot para começar a receber clientes
                </p>
                
                <div className="bg-background/80 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-lg mb-3">📤 Onde compartilhar:</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <span>📱</span>
                      <span>Instagram bio</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>💬</span>
                      <span>WhatsApp Status</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>🌐</span>
                      <span>Site/Landing Page</span>
                    </div>
                  </div>
                </div>

                <Button size="lg" onClick={handleCopyLink}>
                  <Link2 className="h-5 w-5 mr-2" />
                  Copiar Link do Chatbot
                </Button>

                <p className="text-xs text-muted-foreground mt-4">
                  📊 Assim que alguém conversar, aparecerá aqui automaticamente
                </p>
              </div>
            </Card>

            <ProgressiveOnboarding
              negocios={negocios}
              chatbots={chatbots}
              leads={leads}
              onActionClick={onActionClick}
            />
          </div>
        );

      case 'tem_leads':
        const newLeads = leads.filter(l => l.status === 'novo');
        const unrespondedLeads = leads.filter(l => {
          const leadDate = new Date(l.created_at);
          const hoursSince = (new Date().getTime() - leadDate.getTime()) / (1000 * 60 * 60);
          return hoursSince > 72 && l.status === 'novo';
        });

        return (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    🎯 {newLeads.length} LEADS NOVOS ESPERANDO
                  </h1>
                  <p className="text-muted-foreground">
                    Responda rápido para aumentar suas chances de conversão
                  </p>
                </div>
                {unrespondedLeads.length > 0 && (
                  <Button onClick={handleSendFollowup}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enviar follow-up automático
                  </Button>
                )}
              </div>

              {unrespondedLeads.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                    ⚡ {unrespondedLeads.length} leads sem resposta há 3+ dias
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A IA pode enviar follow-up automático para reativar o interesse
                  </p>
                </div>
              )}
            </Card>

            <div className="grid gap-4">
              <h2 className="text-lg font-semibold">Seus Leads</h2>
              {leads.slice(0, 5).map((lead) => (
                <InlineActionCard
                  key={lead.id}
                  lead={lead}
                  onScheduleClick={onOpenSchedule}
                />
              ))}
              {leads.length > 5 && (
                <Button variant="outline" onClick={() => onActionClick?.('view-all-leads')}>
                  Ver todos os {leads.length} leads
                </Button>
              )}
            </div>

            <ProactiveAIPanel leads={leads} chatbots={chatbots} />
            <NaturalLanguageAutomation automacoes={automacoes} />
          </div>
        );

      case 'vendendo':
        const totalLeads = leads.length;
        const convertedLeads = leads.filter(l => l.status === 'ganho').length;
        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(0) : 0;

        return (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    💰 CONVERSÃO: {conversionRate}%
                  </h1>
                  <p className="text-muted-foreground">
                    {totalLeads} leads → {convertedLeads} matrículas
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  +5% esta semana
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-background/50">
                  <p className="text-sm text-muted-foreground">Total de Leads</p>
                  <p className="text-2xl font-bold">{totalLeads}</p>
                </Card>
                <Card className="p-4 bg-background/50">
                  <p className="text-sm text-muted-foreground">Convertidos</p>
                  <p className="text-2xl font-bold text-green-500">{convertedLeads}</p>
                </Card>
                <Card className="p-4 bg-background/50">
                  <p className="text-sm text-muted-foreground">Em andamento</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {leads.filter(l => l.status === 'contatado' || l.status === 'qualificado').length}
                  </p>
                </Card>
              </div>
            </Card>

            <ProactiveAIPanel leads={leads} chatbots={chatbots} />

            <div className="grid gap-4">
              <h2 className="text-lg font-semibold">Leads Recentes</h2>
              {leads.slice(0, 3).map((lead) => (
                <InlineActionCard
                  key={lead.id}
                  lead={lead}
                  onScheduleClick={onOpenSchedule}
                />
              ))}
            </div>

            <NaturalLanguageAutomation automacoes={automacoes} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {renderContextualContent()}
    </div>
  );
}
