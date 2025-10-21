import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sparkles, 
  Loader2, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Clock, 
  DollarSign,
  ChevronRight,
  Brain,
  Target,
  Zap
} from "lucide-react";

interface Sugestao {
  titulo: string;
  tipo: "chatbot" | "funil" | "automacao" | "horario" | "preco";
  prioridade: "alta" | "media" | "baixa";
  impacto: string;
  acao: string;
  motivo: string;
}

interface AIAutoTunePanelProps {
  negocioId: string;
}

const TIPO_ICONS = {
  chatbot: MessageSquare,
  funil: TrendingUp,
  automacao: Zap,
  horario: Clock,
  preco: DollarSign,
};

const PRIORIDADE_COLORS = {
  alta: "destructive",
  media: "default",
  baixa: "secondary",
} as const;

export default function AIAutoTunePanel({ negocioId }: AIAutoTunePanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [contexto, setContexto] = useState<any>(null);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  const analisar = async () => {
    if (!user || !negocioId) return;

    setLoading(true);

    try {
      console.log("🧠 Solicitando análise AI Auto-Tune...");

      const { data, error } = await supabase.functions.invoke("ai-auto-tune", {
        body: { userId: user.id, negocioId },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || "Erro ao gerar análise");
      }

      console.log("✅ Análise recebida:", data);

      setSugestoes(data.data.sugestoes);
      setContexto(data.data.contexto);
      setLastAnalysis(new Date().toLocaleString("pt-BR"));

      toast({
        title: "Análise concluída!",
        description: `${data.data.sugestoes.length} sugestões geradas com IA`,
      });

    } catch (error) {
      console.error("❌ Erro na análise:", error);
      toast({
        title: "Erro ao analisar",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6 text-primary" />
                AI Auto-Tune
              </CardTitle>
              <CardDescription className="text-base">
                Análise inteligente com sugestões personalizadas para aumentar suas vendas
              </CardDescription>
            </div>
            <Button
              onClick={analisar}
              disabled={loading}
              size="lg"
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analisar Agora
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas */}
      {contexto && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contexto.estatisticas.total_leads}</p>
                  <p className="text-xs text-muted-foreground">Leads Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contexto.estatisticas.taxa_conversao}%</p>
                  <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-500/10 p-3">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contexto.estatisticas.total_conversas}</p>
                  <p className="text-xs text-muted-foreground">Conversas Chatbot</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-orange-500/10 p-3">
                  <Zap className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contexto.estatisticas.taxa_captura_lead}%</p>
                  <p className="text-xs text-muted-foreground">Captura de Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sugestões */}
      {sugestoes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sugestões Personalizadas</h3>
            {lastAnalysis && (
              <p className="text-xs text-muted-foreground">
                Última análise: {lastAnalysis}
              </p>
            )}
          </div>

          {sugestoes.map((sugestao, index) => {
            const Icon = TIPO_ICONS[sugestao.tipo];
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="rounded-lg bg-primary/10 p-2 mt-1">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-base">{sugestao.titulo}</h4>
                          <Badge variant={PRIORIDADE_COLORS[sugestao.prioridade]}>
                            Prioridade {sugestao.prioridade}
                          </Badge>
                        </div>
                        
                        <Alert className="bg-blue-50 border-blue-200">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-900">
                            <strong>Impacto:</strong> {sugestao.impacto}
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground mb-1">Por que isso importa:</p>
                            <p className="text-foreground">{sugestao.motivo}</p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-muted-foreground mb-1">O que fazer:</p>
                            <p className="text-foreground">{sugestao.acao}</p>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="mt-2 gap-2">
                          Implementar Sugestão
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && sugestoes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="rounded-full bg-muted mx-auto w-16 h-16 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Nenhuma análise ainda</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Clique em "Analisar Agora" para receber sugestões inteligentes
                baseadas nos dados do seu negócio
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
