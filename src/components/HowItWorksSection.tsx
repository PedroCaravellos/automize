import { ArrowRight, MessageSquare, Settings, Zap } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Conte sobre seu negócio",
      description: "Forneça informações básicas sobre seus serviços, preços e forma de atendimento."
    },
    {
      number: "02", 
      icon: Settings,
      title: "Personalizamos sua IA",
      description: "Nossa equipe configura um chatbot único para seu negócio em até 24 horas."
    },
    {
      number: "03",
      icon: Zap,
      title: "Comece a vender mais",
      description: "Ative o bot em suas plataformas e veja os resultados desde o primeiro dia."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Como funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Processo simples e rápido para ter seu chatbot funcionando
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-hero text-white font-heading font-bold text-xl rounded-full mb-6 shadow-button">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="bg-muted p-4 rounded-xl w-fit mx-auto mb-6">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-heading font-semibold mb-4 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground font-body leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-6 transform translate-x-1/2">
                    <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
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