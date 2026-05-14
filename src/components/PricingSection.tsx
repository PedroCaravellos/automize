import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "./auth/AuthModal";

const plans = [
  {
    name: "Basico",
    price: "97",
    period: "mês",
    description: "Ideal para pequenos negócios que estão começando",
    features: [
      "1 chatbot personalizado",
      "Até 1.000 conversas/mês",
      "Integração WhatsApp",
      "Suporte por email",
      "Dashboard básico",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "197",
    period: "mês",
    description: "Perfeito para academias e negócios em crescimento",
    features: [
      "2 chatbots personalizados",
      "Até 5.000 conversas/mês",
      "WhatsApp + Instagram + Site",
      "Suporte prioritário",
      "Dashboard avançado",
      "Relatórios detalhados",
      "Integração com CRM",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "397",
    period: "mês",
    description: "Solução completa para grandes operações",
    features: [
      "Chatbots ilimitados",
      "Conversas ilimitadas",
      "Todas as integrações",
      "Suporte 24/7",
      "Dashboard premium",
      "IA avançada personalizada",
      "Consultoria mensal",
      "API personalizada",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const { user, setIntendedRoute } = useAuth();
  const { toast } = useToast();

  const handlePlanClick = (planName: string) => {
    if (user) {
      window.location.href = `/dashboard?tab=plan&plan=${planName}`;
    } else {
      setIntendedRoute(`/dashboard?tab=plan&plan=${planName}`);
      setSelectedPlan(planName);
      setAuthModalOpen(true);
    }
  };

  return (
    <section id="planos" className="py-24 bg-muted/40">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">
              Planos
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Escolha o plano ideal para o tamanho do seu negócio. Teste grátis por 7 dias.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-card rounded-xl border p-8 flex flex-col ${
                  plan.popular
                    ? "border-primary/50 ring-1 ring-primary/20"
                    : "border-white/[0.06]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">R${plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className={
                    plan.popular
                      ? "w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11"
                      : "w-full border-white/[0.12] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] font-semibold h-11"
                  }
                  onClick={() => handlePlanClick(plan.name)}
                >
                  {plan.popular ? "Começar agora" : "Escolher plano"}
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Sem compromisso &nbsp;·&nbsp; Pagamento seguro &nbsp;·&nbsp; Ativação imediata
          </p>
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </section>
  );
};

export default PricingSection;
