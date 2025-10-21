import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Users, Bot, Zap, X } from "lucide-react";

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
  priority: "high" | "medium" | "low";
}

interface SmartSuggestionsProps {
  onNavigateTo: (tab: string) => void;
}

const SUGGESTIONS_HIDDEN_KEY = 'smart_suggestions_hidden';

export default function SmartSuggestions({ onNavigateTo }: SmartSuggestionsProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isHidden, setIsHidden] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hidden = localStorage.getItem(SUGGESTIONS_HIDDEN_KEY);
    if (hidden === 'true') {
      setIsHidden(true);
      setLoading(false);
    } else if (user?.id) {
      generateSuggestions();
    }
  }, [user?.id]);

  const generateSuggestions = async () => {
    try {
      const { data: negocios } = await supabase
        .from("negocios")
        .select("id")
        .eq("user_id", user?.id);

      const negocioIds = negocios?.map(n => n.id) || [];

      if (negocioIds.length === 0) {
        setLoading(false);
        return;
      }

      const [chatbots, leads, automacoes] = await Promise.all([
        supabase.from("chatbots").select("*").in("negocio_id", negocioIds),
        supabase.from("leads").select("*").in("negocio_id", negocioIds).order("created_at", { ascending: false }).limit(10),
        supabase.from("automacoes").select("*").eq("user_id", user?.id),
      ]);

      const newSuggestions: Suggestion[] = [];

      // Sugestão: Testar chatbot
      if (chatbots.data && chatbots.data.length > 0) {
        newSuggestions.push({
          id: "test-chatbot",
          icon: <Bot className="h-5 w-5" />,
          title: "💡 Teste seu chatbot agora",
          description: `Você tem ${chatbots.data.length} chatbot(s) criado(s)`,
          action: () => onNavigateTo("chatbots"),
          actionLabel: "Testar",
          priority: "high",
        });
      }

      // Sugestão: Ver leads novos
      if (leads.data && leads.data.length > 0) {
        const leadsRecentes = leads.data.filter(l => {
          const createdAt = new Date(l.created_at);
          const diasAtras = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return diasAtras <= 7;
        });

        if (leadsRecentes.length > 0) {
          newSuggestions.push({
            id: "view-leads",
            icon: <Users className="h-5 w-5" />,
            title: `📊 Você tem ${leadsRecentes.length} leads novos`,
            description: "Leads capturados nos últimos 7 dias",
            action: () => onNavigateTo("vendas"),
            actionLabel: "Ver Leads",
            priority: "high",
          });
        }
      }

      // Sugestão: Criar automação
      if ((automacoes.data?.length || 0) === 0) {
        newSuggestions.push({
          id: "create-automation",
          icon: <Zap className="h-5 w-5" />,
          title: "⚡ Automatize follow-ups",
          description: "Aumente suas conversões com automações",
          action: () => onNavigateTo("automacoes"),
          actionLabel: "Criar Automação",
          priority: "medium",
        });
      }

      setSuggestions(newSuggestions);
      setLoading(false);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setLoading(false);
    }
  };

  const handleHide = () => {
    localStorage.setItem(SUGGESTIONS_HIDDEN_KEY, 'true');
    setIsHidden(true);
  };

  if (loading || isHidden || suggestions.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Sugestões Inteligentes</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHide}
            className="h-6 w-6 p-0"
            aria-label="Ocultar sugestões"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background border hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  {suggestion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{suggestion.title}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={suggestion.action}
                className="ml-2 flex-shrink-0"
              >
                {suggestion.actionLabel}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
