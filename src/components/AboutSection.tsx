import { Bot, Target, Zap } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="como-funciona" className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            O que é o <span className="text-primary">Automiza</span>?
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto font-body">
            Somos uma plataforma de automatização que cria chatbots inteligentes e personalizados 
            para qualquer tipo de negócio. Nossa IA cuida do atendimento, agendamentos e vendas 
            enquanto você foca no que mais importa: fazer seu negócio crescer.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-card p-8 rounded-2xl shadow-card">
              <div className="bg-primary p-4 rounded-xl w-fit mx-auto mb-6">
                <Bot className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-4">IA Personalizada</h3>
              <p className="text-muted-foreground font-body">
                Cada chatbot é treinado especificamente para seu negócio, 
                entendendo seus serviços e falando com a voz da sua marca.
              </p>
            </div>

            <div className="bg-gradient-card p-8 rounded-2xl shadow-card">
              <div className="bg-secondary p-4 rounded-xl w-fit mx-auto mb-6">
                <Target className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-4">Foco no Resultado</h3>
              <p className="text-muted-foreground font-body">
                Não apenas respondemos perguntas, convertemos visitantes em clientes 
                e clientes em vendas recorrentes.
              </p>
            </div>

            <div className="bg-gradient-card p-8 rounded-2xl shadow-card">
              <div className="bg-primary p-4 rounded-xl w-fit mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-4">Simples e Rápido</h3>
              <p className="text-muted-foreground font-body">
                Configure em minutos, não em semanas. Nossa plataforma foi 
                pensada para ser intuitiva e eficiente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;