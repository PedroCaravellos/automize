import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Básico",
      price: "97",
      period: "mês",
      description: "Ideal para pequenos negócios que estão começando",
      features: [
        "1 chatbot personalizado",
        "Até 1.000 conversas/mês",
        "Integração WhatsApp",
        "Suporte por email",
        "Dashboard básico"
      ],
      popular: false
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
        "Integração com CRM"
      ],
      popular: true
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
        "API personalizada"
      ],
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-gradient-accent">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Escolha o plano ideal para o tamanho do seu negócio. Teste grátis por 7 dias.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white rounded-2xl shadow-card p-8 ${plan.popular ? 'ring-2 ring-primary shadow-hero' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-hero text-white px-4 py-2 rounded-full flex items-center gap-2 font-heading font-semibold">
                    <Star className="h-4 w-4" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground font-body mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-heading font-bold text-primary">
                    R${plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-body">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className="w-full font-heading font-semibold"
                size="lg"
              >
                {plan.popular ? "Começar agora" : "Escolher plano"}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground font-body">
            💳 Sem compromisso • 🔒 Pagamento seguro • ⚡ Ativação imediata
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;