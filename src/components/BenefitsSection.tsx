import { Clock, DollarSign, Users, Zap } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Aumente suas vendas",
    description:
      "Converta mais visitantes em clientes com atendimento 24/7 e respostas inteligentes que geram interesse.",
  },
  {
    icon: Clock,
    title: "Economize tempo",
    description:
      "Automatize respostas repetitivas e agendamentos, liberando sua equipe para focar no que realmente importa.",
  },
  {
    icon: Users,
    title: "Melhore a experiência",
    description:
      "Ofereça atendimento instantâneo e personalizado, aumentando a satisfação dos seus clientes.",
  },
  {
    icon: Zap,
    title: "Integração completa",
    description:
      "Funciona com WhatsApp, Instagram, site e outras plataformas que você já usa no seu negócio.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="beneficios" className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">
              Vantagens
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Por que escolher o Automiza?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Transforme seu atendimento e acelere o crescimento do seu negócio com nossa
              tecnologia.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-card border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.12] transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
