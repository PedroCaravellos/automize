import { useState } from "react";
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
  ChevronUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

const OnboardingChecklist = ({ 
  onNavigateTo, 
  onOpenSimulator, 
  onOpenShareDemo 
}: OnboardingChecklistProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { 
    academias, 
    chatbots, 
    onboardingProgress, 
    trialActive, 
    planoAtivo,
    updateOnboardingProgress 
  } = useAuth();

  const checklistItems: ChecklistItem[] = [
    {
      id: "academia",
      title: "Criar sua academia",
      description: "Configure os dados da sua academia",
      icon: Building,
      completed: academias.length > 0,
      action: () => onNavigateTo("academias"),
    },
    {
      id: "chatbot",
      title: "Criar seu chatbot",
      description: "Configure seu primeiro chatbot",
      icon: Bot,
      completed: chatbots.length > 0,
      action: () => onNavigateTo("chatbots"),
    },
    {
      id: "test",
      title: "Testar o chatbot",
      description: "Faça o primeiro teste do simulador",
      icon: Play,
      completed: onboardingProgress.simulatorOpened,
      action: onOpenSimulator,
      disabled: chatbots.length === 0,
    },
    {
      id: "share",
      title: "Compartilhar demo",
      description: "Gere um link de demonstração",
      icon: Share,
      completed: onboardingProgress.demoShared,
      action: onOpenShareDemo,
      disabled: chatbots.length === 0,
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

  // Auto-minimize when completed (but allow manual expansion)
  const shouldShowMinimized = isCompleted && !isExpanded;

  return (
    <Card className={shouldShowMinimized ? "border-green-200 dark:border-green-800" : ""}>
      <CardHeader className={shouldShowMinimized ? "pb-3" : ""}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className={shouldShowMinimized ? "text-sm" : ""}>
              {shouldShowMinimized ? "✅ Onboarding Concluído" : "Checklist de Onboarding"}
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
          <Progress value={progressPercentage} className="w-full" />
        )}
      </CardHeader>
      {!shouldShowMinimized && (
        <CardContent className="space-y-4">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              item.completed 
                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                : "bg-muted/30 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                item.completed 
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" 
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
                className="flex items-center gap-1"
              >
                {item.disabled ? "Indisponível" : "Começar"}
                {!item.disabled && <ChevronRight className="h-3 w-3" />}
              </Button>
            )}
          </div>
        ))}
        
        {isCompleted && (
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
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