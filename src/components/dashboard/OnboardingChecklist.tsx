import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Bot, 
  Play, 
  Share, 
  CreditCard, 
  Check, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  EyeOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingChecklistProps {
  onNavigateTo: (tab: string) => void;
  onOpenSimulator: () => void;
  onOpenShareDemo: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  action: () => void;
  disabled?: boolean;
}

const ONBOARDING_HIDDEN_KEY = 'onboarding_checklist_hidden';

const OnboardingChecklist = ({ 
  onNavigateTo, 
  onOpenSimulator, 
  onOpenShareDemo 
}: OnboardingChecklistProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const { 
    user,
    chatbots, 
    onboardingProgress, 
    trialActive, 
    planoAtivo,
  } = useAuth();

  // Estado para armazenar contagens do banco de dados
  const [dbCounts, setDbCounts] = useState({
    negocios: 0,
    chatbots: 0,
    leads: 0,
    automacoes: 0,
    integracoes: 0,
  });

  // Verificar se está oculto no localStorage
  useEffect(() => {
    const hidden = localStorage.getItem(ONBOARDING_HIDDEN_KEY);
    if (hidden === 'true') {
      setIsHidden(true);
    }
  }, []);

  // Buscar contagens do banco de dados
  useEffect(() => {
    if (!user?.id) return;

    const fetchCounts = async () => {
      try {
        // Buscar negocios do usuário
        const { data: negociosData } = await supabase
          .from('negocios')
          .select('id')
          .eq('user_id', user.id);

        const negocioIds = negociosData?.map(n => n.id) || [];

        if (negocioIds.length === 0) {
          setDbCounts({ negocios: 0, chatbots: 0, leads: 0, automacoes: 0, integracoes: 0 });
          return;
        }

        // Buscar contagens em paralelo
        const [chatbotsRes, leadsRes, automacoesRes, integracoesRes] = await Promise.all([
          supabase
            .from('chatbots')
            .select('id', { count: 'exact', head: true })
            .in('negocio_id', negocioIds),
          supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .in('negocio_id', negocioIds),
          supabase
            .from('automacoes')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('whatsapp_integrations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_active', true),
        ]);

        setDbCounts({
          negocios: negocioIds.length,
          chatbots: chatbotsRes.count || 0,
          leads: leadsRes.count || 0,
          automacoes: automacoesRes.count || 0,
          integracoes: integracoesRes.count || 0,
        });
      } catch (error) {
        console.error('Erro ao buscar contagens:', error);
      }
    };

    fetchCounts();
  }, [user?.id]);

  const checklistItems: ChecklistItem[] = [
    {
      id: "negocio",
      title: "Criar seu negócio",
      description: "Configure os dados do seu negócio",
      icon: Building,
      completed: dbCounts.negocios > 0,
      action: () => onNavigateTo("negocios"),
    },
    {
      id: "chatbot",
      title: "Criar seu chatbot",
      description: "Configure seu primeiro chatbot",
      icon: Bot,
      completed: dbCounts.chatbots > 0,
      action: () => onNavigateTo("chatbots"),
    },
    {
      id: "test",
      title: "Testar o chatbot",
      description: "Faça o primeiro teste do simulador",
      icon: Play,
      completed: onboardingProgress.simulatorOpened,
      action: onOpenSimulator,
      disabled: dbCounts.chatbots === 0,
    },
    {
      id: "share",
      title: "Compartilhar demo",
      description: "Gere um link de demonstração",
      icon: Share,
      completed: onboardingProgress.demoShared,
      action: onOpenShareDemo,
      disabled: dbCounts.chatbots === 0,
    },
    {
      id: "plan",
      title: "Escolher um plano",
      description: "Ative um plano ou trial",
      icon: CreditCard,
      completed: planoAtivo || trialActive,
      action: () => onNavigateTo("plan"),
    },
  ];

  const completedItems = checklistItems.filter(item => item.completed).length;
  const totalItems = checklistItems.length;
  const progressPercentage = (completedItems / totalItems) * 100;
  const isCompleted = completedItems === totalItems;

  const handleHideChecklist = () => {
    localStorage.setItem(ONBOARDING_HIDDEN_KEY, 'true');
    setIsHidden(true);
  };

  const handleShowChecklist = () => {
    localStorage.removeItem(ONBOARDING_HIDDEN_KEY);
    setIsHidden(false);
    setIsExpanded(true);
  };

  // Mostrar botão para reexibir se estiver oculto
  if (isHidden) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleShowChecklist}
        className="mb-4 hover-scale"
      >
        <EyeOff className="mr-2 h-4 w-4" />
        Mostrar Checklist de Início
      </Button>
    );
  }

  // Auto-minimize when completed (but allow manual expansion)
  const shouldShowMinimized = isCompleted && !isExpanded;

  return (
    <Card className={`${shouldShowMinimized ? "border-green-200 dark:border-green-800" : ""} animate-fade-in`}>
      <CardHeader className={shouldShowMinimized ? "pb-3" : ""}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className={shouldShowMinimized ? "text-sm" : ""}>
              {shouldShowMinimized ? "✅ Onboarding Concluído" : "🚀 Checklist de Onboarding"}
            </CardTitle>
            {shouldShowMinimized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="h-8 px-2"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
          {!shouldShowMinimized && (
            <div className="flex items-center gap-2">
              <Badge variant={isCompleted ? "default" : "secondary"}>
                {completedItems}/{totalItems} concluídos
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHideChecklist}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                title="Não mostrar mais"
              >
                <X className="h-4 w-4" />
              </Button>
              {isCompleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 px-2"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        {!shouldShowMinimized && (
          <Progress value={progressPercentage} className="w-full mt-4" />
        )}
      </CardHeader>
      {!shouldShowMinimized && (
        <CardContent className="space-y-4">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
              item.completed 
                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                : "bg-muted/30 hover:bg-muted/50 hover-scale"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full transition-all ${
                item.completed 
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 animate-scale-in" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {item.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <item.icon className="h-4 w-4" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            
            {!item.completed && (
              <Button
                size="sm"
                variant="outline"
                onClick={item.action}
                disabled={item.disabled}
                className="flex items-center gap-1 hover-scale"
              >
                {item.disabled ? "Indisponível" : "Começar"}
                {!item.disabled && <ChevronRight className="h-3 w-3" />}
              </Button>
            )}
          </div>
        ))}
        
        {isCompleted && (
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg animate-fade-in">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              🎉 Parabéns! Você completou o onboarding!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Agora você está pronto para usar todas as funcionalidades da plataforma.
            </p>
          </div>
        )}
        </CardContent>
      )}
    </Card>
  );
};

export default OnboardingChecklist;
