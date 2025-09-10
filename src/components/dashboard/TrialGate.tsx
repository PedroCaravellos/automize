import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles, Crown, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TrialGateProps {
  onPlanSelected?: () => void;
}

export default function TrialGate({ onPlanSelected }: TrialGateProps) {
  const { activateTrial, selectPlan } = useAuth();
  const [isActivating, setIsActivating] = useState(false);
  const { toast } = useToast();

  const handleActivateTrial = async () => {
    setIsActivating(true);
    try {
      await activateTrial();
      toast({
        title: "Trial ativado!",
        description: "Você tem 7 dias gratuitos para explorar o Automiza.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao ativar o trial. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleSelectPlan = async (planName: string) => {
    try {
      await selectPlan(planName);
      toast({
        title: "Plano selecionado!",
        description: `Plano ${planName} ativado com sucesso.`,
      });
      onPlanSelected?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao selecionar plano. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const plans = [
    {
      name: "Básico",
      price: "R$ 49",
      icon: Sparkles,
      features: ["1 chatbot", "WhatsApp", "Suporte básico"]
    },
    {
      name: "Pro",
      price: "R$ 99",
      icon: Zap,
      features: ["3 chatbots", "Multi-canais", "Analytics", "Suporte prioritário"],
      popular: true
    },
    {
      name: "Premium",
      price: "R$ 199",
      icon: Crown,
      features: ["Chatbots ilimitados", "API completa", "Integração customizada", "Suporte 24/7"]
    }
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Bem-vindo ao Automiza!</h2>
          <p className="text-muted-foreground">
            Para usar o dashboard, você precisa ativar seu teste grátis ou escolher um plano.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Trial Option */}
          <Card className="border-2 border-primary">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Teste Grátis</CardTitle>
              <CardDescription>
                Experimente o Automiza por 7 dias sem compromisso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">7 dias</div>
                <div className="text-sm text-muted-foreground">Totalmente grátis</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li>✅ Acesso completo ao dashboard</li>
                <li>✅ 1 chatbot personalizado</li>
                <li>✅ Integração WhatsApp</li>
                <li>✅ Suporte por email</li>
              </ul>
              <Button 
                className="w-full" 
                onClick={handleActivateTrial}
                disabled={isActivating}
              >
                {isActivating ? "Ativando..." : "Ativar teste grátis"}
              </Button>
            </CardContent>
          </Card>

          {/* Plans Grid */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Ou escolha um plano</h3>
            <div className="grid gap-3">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <Card 
                    key={plan.name} 
                    className={`relative cursor-pointer transition-all hover:border-primary ${
                      plan.popular ? 'border-primary' : ''
                    }`}
                    onClick={() => handleSelectPlan(plan.name)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        Mais Popular
                      </Badge>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{plan.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {plan.features.join(" • ")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{plan.price}</div>
                          <div className="text-xs text-muted-foreground">/mês</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}