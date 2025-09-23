import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Dono da Academia FitMax",
      content: "Em 2 meses com o Automiza: +40% nas vendas, +150 novos alunos e 0 leads perdidos. O ROI foi de 380% já no primeiro mês. Agora durmo tranquilo sabendo que nenhum cliente fica sem resposta.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      results: { increase: "40%", metric: "vendas", period: "2 meses" }
    },
    {
      name: "Marina Costa", 
      role: "Proprietária Salão Beleza Total",
      content: "Resultados em 30 dias: 89% dos agendamentos pelo bot, +65% na receita e 15h/semana economizadas. Minha agenda nunca esteve tão cheia! O investimento se pagou em 3 semanas.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      results: { increase: "65%", metric: "receita", period: "30 dias" }
    },
    {
      name: "Roberto Mendes",
      role: "Gestor Clínica Fisio+",
      content: "Transformação total: +280 consultas agendadas, taxa de conversão de 52% e 85% dos pacientes elogiam o atendimento. O Automiza virou meu melhor funcionário.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      results: { increase: "52%", metric: "conversão", period: "mensal" }
    },
    {
      name: "Ana Paula",
      role: "Diretora Curso Pro Tech",
      content: "Impressionante: +120 matrículas em 45 dias, 90% das dúvidas resolvidas automaticamente. Economizo R$ 3.200/mês em atendimento e ainda vendo 3x mais. Melhor investimento que já fiz!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      results: { increase: "200%", metric: "matrículas", period: "45 dias" }
    },
    {
      name: "Lucas Ferreira",
      role: "Dono da Pizzaria Bella Vista",
      content: "Em 60 dias: +95% nos pedidos via WhatsApp, ticket médio 30% maior e 4h/dia livres. O bot sugere combos e upsells melhor que meus atendentes. Faturamento explodiu!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      results: { increase: "95%", metric: "pedidos", period: "60 dias" }
    },
    {
      name: "Patricia Oliveira",
      role: "Proprietária Pet Shop Amor Animal",
      content: "Resultado surpreendente: +180% em agendamentos de banho e tosa, 45 novos clientes mensais e 100% dos horários preenchidos. Meu negócio nunca foi tão próspero!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      results: { increase: "180%", metric: "agendamentos", period: "mensal" }
    }
  ];

  return (
    <section id="depoimentos" className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Histórias reais de empresários que transformaram seus negócios com o Automiza
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <div key={index} className="bg-card rounded-2xl shadow-card p-6 relative hover:shadow-hero transition-all duration-300 border border-border/50">
              {/* Results Badge */}
              <div className="absolute -top-3 right-4">
                <div className="bg-gradient-hero text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  +{testimonial.results.increase} {testimonial.results.metric}
                </div>
              </div>

              <Quote className="h-6 w-6 text-primary mb-4 opacity-60" />
              
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-secondary fill-current" />
                ))}
              </div>

              <p className="text-foreground font-body leading-relaxed mb-6 text-sm">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-heading font-semibold text-foreground text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-body">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-accent rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-heading font-semibold mb-4">
              Resultados comprovados
            </h3>
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Empresários</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">47%</div>
                <div className="text-sm text-muted-foreground">Conversão média</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">12h</div>
                <div className="text-sm text-muted-foreground">Economia/semana</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Atendimento</div>
              </div>
            </div>
            <p className="text-muted-foreground font-body">
              Junte-se aos empresários que já <span className="font-semibold text-primary">triplicaram suas vendas</span> automatizando o atendimento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;