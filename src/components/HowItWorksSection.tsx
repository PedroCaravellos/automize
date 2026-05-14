import { ArrowRight, MessageSquare, Settings, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Conte sobre seu negócio",
    description:
      "Forneça informações básicas sobre seus serviços, preços e forma de atendimento.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Personalizamos sua IA",
    description:
      "Nossa equipe configura um chatbot único para seu negócio em até 24 horas.",
  },
  {
    number: "03",
    icon: Zap,
    title: "Comece a vender mais",
    description:
      "Ative o bot em suas plataformas e veja os resultados desde o primeiro dia.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-muted/40">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">
              Processo
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Como funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Processo simples e rápido para ter seu chatbot funcionando.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col">
                  {/* Number + icon row */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/30 bg-primary/[0.08] shrink-0">
                      <span className="text-xs font-bold text-primary">{step.number}</span>
                    </div>
                    <div className="h-px flex-1 bg-white/[0.06] md:hidden" />
                  </div>

                  {/* Content */}
                  <div className="w-10 h-10 rounded-lg bg-card border border-white/[0.06] flex items-center justify-center mb-4">
                    <step.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow between steps (desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-4 -right-7 text-white/[0.15]">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
