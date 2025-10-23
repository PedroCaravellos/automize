import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Clock, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { LeadItem, ChatbotItem } from "@/types";
import { useState } from "react";

interface AIAction {
  id: string;
  type: 'automatic' | 'suggested';
  title: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  impact?: string;
  timestamp: Date;
}

interface ProactiveAIPanelProps {
  leads: LeadItem[];
  chatbots: ChatbotItem[];
}

export default function ProactiveAIPanel({ leads, chatbots }: ProactiveAIPanelProps) {
  const [actions, setActions] = useState<AIAction[]>([
    {
      id: '1',
      type: 'automatic',
      title: 'Follow-up automático enviado',
      description: '3 leads não responderam há 3+ dias. Sistema enviou follow-up via WhatsApp.',
      status: 'completed',
      impact: '+40% resposta esperada',
      timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 min atrás
    },
    {
      id: '2',
      type: 'suggested',
      title: 'Horário de pico detectado',
      description: '80% dos leads perguntam sobre valores entre 18h-20h. Sugestão: chatbot enviar tabela automaticamente.',
      status: 'pending',
      impact: '+25% conversão',
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'automatic',
      title: 'Resposta otimizada aplicada',
      description: 'IA melhorou resposta sobre preços baseado em padrões de conversão.',
      status: 'completed',
      impact: 'Tempo resposta -30%',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2h atrás
    }
  ]);

  const handleApplyAction = (actionId: string) => {
    setActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, status: 'executing' as const }
        : action
    ));

    setTimeout(() => {
      setActions(prev => prev.map(action => 
        action.id === actionId 
          ? { ...action, status: 'completed' as const }
          : action
      ));
    }, 2000);
  };

  const getStatusIcon = (status: AIAction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'executing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Zap className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: AIAction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600">Concluído</Badge>;
      case 'executing':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Executando</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600">Falhou</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Sugerido</Badge>;
    }
  };

  const getTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">IA Proativa</h2>
        <Badge variant="secondary" className="ml-auto">
          {actions.filter(a => a.status === 'pending').length} ações pendentes
        </Badge>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <Card key={action.id} className="p-4 bg-card/50">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getStatusIcon(action.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-sm">{action.title}</h3>
                  {getStatusBadge(action.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {action.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{getTimestamp(action.timestamp)}</span>
                    {action.impact && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {action.impact}
                      </span>
                    )}
                  </div>
                  {action.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApplyAction(action.id)}
                    >
                      Aplicar agora
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {actions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Nenhuma ação da IA no momento</p>
          <p className="text-xs mt-1">A IA está monitorando e vai sugerir melhorias</p>
        </div>
      )}
    </Card>
  );
}
