import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Clock, Zap, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { LeadItem, ChatbotItem, NegocioItem, AutomacaoItem } from "@/types";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  negocios: NegocioItem[];
  automacoes: AutomacaoItem[];
}

const CACHE_KEY = 'proactive_ai_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

interface CachedData {
  actions: AIAction[];
  timestamp: number;
  dataHash: string;
}

export default function ProactiveAIPanel({ leads, chatbots, negocios, automacoes }: ProactiveAIPanelProps) {
  const [actions, setActions] = useState<AIAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'fresh' | 'cached' | 'expired'>('expired');

  // Criar hash dos dados com cálculo endurecido de "ativos"
  const dataHash = useMemo(() => {
    return JSON.stringify({
      leadsCount: leads.length,
      chatbotsCount: chatbots.length,
      automacoesCount: automacoes.length,
      negociosCount: negocios.length,
      leadsNovos: leads.filter(l => (l.status || '').toLowerCase() === 'novo').length,
      // Check both boolean field and string status for "active"
      chatbotsAtivos: chatbots.filter(c => 
        (c as any).ativo === true || (c.status || '').toLowerCase() === 'ativo'
      ).length,
      // Check both ativa and ativo boolean fields
      automacoesAtivas: automacoes.filter(a => 
        a.ativa === true || (a as any).ativo === true
      ).length,
    });
  }, [leads, chatbots, automacoes, negocios]);
  
  // Calcular tempo desde última análise
  const minutesSinceLastAnalysis = useMemo(() => {
    if (!lastAnalysis) return null;
    return Math.floor((Date.now() - lastAnalysis.getTime()) / 1000 / 60);
  }, [lastAnalysis]);

  // Carregar cache ao montar
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const cachedData: CachedData = JSON.parse(cached);
        const now = Date.now();
        const isExpired = now - cachedData.timestamp > CACHE_DURATION;
        const dataChanged = cachedData.dataHash !== dataHash;
        
        if (!isExpired && !dataChanged) {
          console.log('📦 Usando cache da IA Proativa');
          setActions(cachedData.actions.map(a => ({ ...a, timestamp: new Date(a.timestamp) })));
          setLastAnalysis(new Date(cachedData.timestamp));
          setCacheStatus('cached');
          return;
        } else if (dataChanged) {
          console.log('🔄 Dados mudaram, recalculando análise');
          setCacheStatus('expired');
        }
      } catch (e) {
        console.error('Erro ao ler cache:', e);
      }
    }
    
    // Se não tem cache válido, analisa
    analyzeOpportunities();
  }, [dataHash]);

  const analyzeOpportunities = async () => {
    // Validar se tem dados suficientes
    const hasData = leads.length > 0 || chatbots.length > 0 || automacoes.length > 0 || negocios.length > 0;
    
    if (!hasData) {
      console.log('⏭️ Sem dados para analisar, pulando IA Proativa');
      setActions([]);
      return;
    }

    setIsLoading(true);
    console.log('🤖 Iniciando análise da IA Proativa', {
      leads: leads.length,
      chatbots: chatbots.length,
      automacoes: automacoes.length,
      negocios: negocios.length
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-analyze-opportunities', {
        body: { 
          leads, 
          chatbots, 
          automacoes, 
          negocios 
        }
      });

      if (error) throw error;

      if (data?.opportunities && Array.isArray(data.opportunities)) {
        const aiActions: AIAction[] = data.opportunities.map((opp: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          type: opp.type || 'suggested',
          title: opp.title,
          description: opp.description,
          status: opp.type === 'automatic' ? 'completed' : 'pending',
          impact: opp.impact,
          timestamp: new Date()
        }));
        
        setActions(aiActions);
        
        // Salvar no cache
        const cacheData: CachedData = {
          actions: aiActions,
          timestamp: Date.now(),
          dataHash
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log('✅ IA Proativa: análise completa e salva no cache');
        setLastAnalysis(new Date());
        setCacheStatus('fresh');
      }
    } catch (error) {
      console.error('❌ Erro ao analisar oportunidades:', error);
      toast.error('Erro ao analisar oportunidades');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForceRefresh = () => {
    console.log('🔄 Forçando nova análise...');
    localStorage.removeItem(CACHE_KEY);
    setCacheStatus('expired');
    analyzeOpportunities();
  };

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

  const pendingActions = actions.filter(a => a.status === 'pending').length;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Sugestões Inteligentes da IA</h2>
            {pendingActions > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingActions} pendentes
              </Badge>
            )}
            {cacheStatus === 'cached' && (
              <Badge variant="outline" className="ml-2 text-xs">
                📦 Cache
              </Badge>
            )}
            {cacheStatus === 'fresh' && (
              <Badge variant="outline" className="ml-2 text-xs">
                ✨ Novo
              </Badge>
            )}
          </div>
          {minutesSinceLastAnalysis !== null && (
            <p className="text-xs text-muted-foreground mt-1">
              Última análise: {minutesSinceLastAnalysis === 0 ? 'agora' : `há ${minutesSinceLastAnalysis} min`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceRefresh}
            disabled={isLoading}
            title="Forçar nova análise (ignora cache)"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
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

      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <RefreshCw className="h-12 w-12 mx-auto mb-3 animate-spin text-primary" />
          <p>Analisando oportunidades...</p>
        </div>
      )}

      {!isLoading && actions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Nenhuma ação da IA no momento</p>
          <p className="text-xs mt-1">A IA está monitorando e vai sugerir melhorias</p>
        </div>
      )}
    </Card>
  );
}
