import { Bot, Target, Zap } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-muted/40">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">
              Sobre a plataforma
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              O que é o <span className="text-primary">Automiza</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Uma plataforma de automatização que cria chatbots inteligentes e personalizados
              para qualquer tipo de negócio. Nossa IA cuida do atendimento, agendamentos e
              vendas enquanto você foca no crescimento.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "IA Personalizada",
                description:
                  "Cada chatbot é treinado especificamente para seu negócio, entendendo seus serviços e falando com a voz da sua marca.",
              },
              {
                icon: Target,
                title: "Foco no Resultado",
                description:
                  "Não apenas respondemos perguntas — convertemos visitantes em clientes e clientes em vendas recorrentes.",
              },
              {
                icon: Zap,
                title: "Simples e Rápido",
                description:
                  "Configure em minutos, não em semanas. Nossa plataforma foi pensada para ser intuitiva e eficiente.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.12] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
