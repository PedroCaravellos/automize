import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, PlayCircle, ChevronRight, X } from "lucide-react";
import { NegocioItem, ChatbotItem, LeadItem } from "@/types";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  weight: number; // peso percentual
  action?: () => void;
  actionLabel?: string;
  miniTutorial?: {
    steps: string[];
    estimatedTime: string;
  };
}

interface ProgressiveOnboardingProps {
  negocios: NegocioItem[];
  chatbots: ChatbotItem[];
  leads: LeadItem[];
  onActionClick?: (action: string) => void;
}

export default function ProgressiveOnboarding({ 
  negocios, 
  chatbots, 
  leads,
  onActionClick 
}: ProgressiveOnboardingProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const steps: OnboardingStep[] = [
    {
      id: 'create-business',
      title: 'Negócio criado',
      description: 'Configure as informações do seu negócio',
      completed: negocios.length > 0,
      weight: 20
    },
    {
      id: 'test-chatbot',
      title: 'Teste seu chatbot',
      description: 'Veja como ele responde aos clientes',
      completed: chatbots.length > 0 && chatbots.some(c => c.status === 'Ativo'),
      weight: 20,
      actionLabel: 'Testar agora',
      action: () => onActionClick?.('test-chatbot'),
      miniTutorial: {
        steps: [
          'Clique no botão "Testar agora"',
          'Digite uma mensagem como cliente',
          'Veja a resposta do chatbot',
          'Ajuste as respostas se necessário'
        ],
        estimatedTime: '2 minutos'
      }
    },
    {
      id: 'share-chatbot',
      title: 'Compartilhe o link',
      description: 'Cole no Instagram, WhatsApp ou site',
      completed: leads.length > 0,
      weight: 20,
      actionLabel: 'Copiar link',
      action: () => onActionClick?.('copy-link'),
      miniTutorial: {
        steps: [
          'Copie o link do chatbot',
          'Cole na bio do Instagram',
          'Ou envie no Status do WhatsApp',
          'Ou adicione no seu site'
        ],
        estimatedTime: '1 minuto'
      }
    },
    {
      id: 'activate-whatsapp',
      title: 'Ativar WhatsApp',
      description: 'Receba e responda leads automaticamente',
      completed: false,
      weight: 20,
      actionLabel: 'Ativar WhatsApp',
      action: () => onActionClick?.('activate-whatsapp'),
      miniTutorial: {
        steps: [
          'Clique em "Ativar WhatsApp"',
          'Insira o código no seu número',
          'Pronto! Chatbot estará respondendo',
          'Leads chegam automaticamente aqui'
        ],
        estimatedTime: '3 minutos'
      }
    },
    {
      id: 'first-lead',
      title: 'Primeiro lead capturado',
      description: 'Seu chatbot já está gerando resultados',
      completed: leads.length > 0,
      weight: 20
    }
  ];

  const totalProgress = steps.reduce((acc, step) => 
    acc + (step.completed ? step.weight : 0), 0
  );

  const nextStep = steps.find(s => !s.completed);

  // Auto-expand onboarding if not completed
  useEffect(() => {
    if (totalProgress < 100) {
      setIsExpanded(true);
    }
  }, [totalProgress]);

  // Auto-hide when completed
  const handleDismiss = () => {
    localStorage.setItem('onboarding-dismissed', 'true');
    setIsExpanded(false);
  };

  if (totalProgress === 100 && localStorage.getItem('onboarding-dismissed') === 'true') {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{totalProgress}%</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Seu Progresso</h2>
            <p className="text-sm text-muted-foreground">
              {totalProgress === 100 
                ? '🎉 Tudo configurado! Você está pronto para vender'
                : `Faltam ${100 - totalProgress}% para completar o setup`
              }
            </p>
          </div>
        </div>
        {totalProgress === 100 && (
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Progress value={totalProgress} className="mb-6" />

      {/* Next Step Highlight */}
      {nextStep && (
        <Card className="p-4 mb-4 bg-primary/5 border-primary/30">
          <div className="flex items-start gap-3">
            <PlayCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1">👉 PRÓXIMO: {nextStep.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{nextStep.description}</p>
              
              {nextStep.miniTutorial && expandedStep === nextStep.id && (
                <div className="mb-3 p-3 bg-background/50 rounded-lg border">
                  <p className="text-xs font-medium mb-2">Como fazer:</p>
                  <ol className="space-y-1 text-xs text-muted-foreground">
                    {nextStep.miniTutorial.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-semibold text-primary">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2">
                    ⏱️ Tempo estimado: {nextStep.miniTutorial.estimatedTime}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {nextStep.action && (
                  <Button 
                    size="sm" 
                    onClick={nextStep.action}
                    className="flex-shrink-0"
                  >
                    {nextStep.actionLabel}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
                {nextStep.miniTutorial && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setExpandedStep(expandedStep === nextStep.id ? null : nextStep.id)}
                  >
                    {expandedStep === nextStep.id ? 'Ocultar' : 'Ver tutorial'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* All Steps */}
      {isExpanded && (
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors"
            >
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.completed ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {step.title}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {step.weight}%
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
