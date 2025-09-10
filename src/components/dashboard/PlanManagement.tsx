import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ExternalLink, Crown, Zap, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function PlanManagement() {
  const { profile, selectPlan, updateProfile, trialDaysRemaining } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanActivation = async (planName: string) => {
    setIsLoading(true);
    try {
      await selectPlan(planName);
      toast({
        title: "Plano ativado!",
        description: `Plano ${planName} ativado (simulação).`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível ativar o plano.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPlan = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ plano_ativo: false, nome_plano: null });
      toast({
        title: "Plano cancelado",
        description: "Plano cancelado (simulado). Seu acesso pode ser limitado quando o trial expirar.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o plano.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToPlans = () => {
    window.location.href = "/#planos";
  };

  const plans = [
    {
      name: "Básico",
      icon: Building2,
      features: ["1 Academia", "1 Chatbot", "500 mensagens/mês", "Suporte via email"]
    },
    {
      name: "Pro",
      icon: Zap,
      features: ["3 Academias", "3 Chatbots", "2.000 mensagens/mês", "Relatórios básicos", "Suporte prioritário"]
    },
    {
      name: "Premium",
      icon: Crown,
      features: ["Academias ilimitadas", "Chatbots ilimitados", "Mensagens ilimitadas", "Relatórios avançados", "Suporte 24/7"]
    }
  ];

  const getStatusCard = () => {
    if (profile?.plano_ativo) {
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-green-500">Ativo</Badge>
            <span className="font-medium">Plano {profile.nome_plano}</span>
          </div>
        </div>
      );
    }
    
    if (profile?.trial_ativo) {
      const daysLeft = trialDaysRemaining();
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-blue-500 text-blue-600">
              Trial ativo — {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
            </Badge>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-muted-foreground">
        Sem plano ativo. Selecione um plano para liberar o uso.
      </div>
    );
  };

  const showCallout = !profile?.plano_ativo && !profile?.trial_ativo;

  return (
    <div className="space-y-6">
      {showCallout && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-blue-800 font-medium">
              Ative seu trial de 7 dias ou selecione um plano para liberar todas as funcionalidades.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Status da assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          {getStatusCard()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trocar/Ativar plano (simulação)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = profile?.nome_plano === plan.name;
              
              return (
                <Card key={plan.name} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {isCurrentPlan && <Badge variant="default">Atual</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handlePlanActivation(plan.name)}
                      disabled={isLoading || isCurrentPlan}
                      className="w-full"
                      variant={isCurrentPlan ? "outline" : "default"}
                    >
                      {isCurrentPlan ? "Plano atual" : `Ativar ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleGoToPlans}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver detalhes dos planos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento (simulado)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.plano_ativo && (
            <Button
              variant="destructive"
              onClick={handleCancelPlan}
              disabled={isLoading}
            >
              Cancelar plano (simulado)
            </Button>
          )}
          <p className="text-sm text-muted-foreground">
            Cobrança automática e faturas serão habilitadas em etapa futura.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faturas e dados de cobrança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ/CPF</Label>
              <Input id="cnpj" disabled placeholder="000.000.000-00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razao-social">Razão Social</Label>
              <Input id="razao-social" disabled placeholder="Nome da empresa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" disabled placeholder="Endereço completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-cobranca">E-mail de cobrança</Label>
              <Input id="email-cobranca" disabled placeholder="contato@empresa.com" />
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-3">Histórico de faturas</h4>
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma fatura gerada ainda.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}