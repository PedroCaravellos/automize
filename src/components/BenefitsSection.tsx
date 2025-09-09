import { Clock, DollarSign, Users, Zap } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Aumente suas vendas",
      description: "Converta mais visitantes em clientes com atendimento 24/7 e respostas inteligentes que geram interesse."
    },
    {
      icon: Clock,
      title: "Economize tempo",
      description: "Automatize respostas repetitivas e agendamentos, liberando sua equipe para focar no que realmente importa."
    },
    {
      icon: Users,
      title: "Melhore a experiência",
      description: "Ofereça atendimento instantâneo e personalizado, aumentando a satisfação dos seus clientes."
    },
    {
      icon: Zap,
      title: "Integração completa",
      description: "Funciona com WhatsApp, Instagram, site e outras plataformas que você já usa no seu negócio."
    }
  ];

  return (
    <section className="py-20 bg-gradient-accent">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Por que escolher o Automiza?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Transforme seu atendimento e acelere o crescimento do seu negócio com nossa tecnologia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              <div className="bg-card p-6 rounded-2xl shadow-card hover:shadow-hero transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-gradient-hero p-4 rounded-xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-4 text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground font-body leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;