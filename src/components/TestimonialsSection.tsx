import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Dono da Academia FitMax",
      content: "O Automiza transformou nosso atendimento. Agora conseguimos responder todos os leads 24/7 e nossas vendas aumentaram 40% no primeiro mês.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Marina Costa",
      role: "Proprietária Salão Beleza Total",
      content: "Incrível como o bot consegue agendar horários e responder dúvidas dos clientes. Economizo pelo menos 3 horas por dia que agora uso para focar no negócio.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Roberto Mendes",
      role: "Gestor Clínica Fisio+",
      content: "A personalização do chatbot ficou perfeita. Os pacientes adoram o atendimento rápido e conseguimos converter muito mais consultas.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
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

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card rounded-2xl shadow-card p-8 relative hover:shadow-hero transition-all duration-300">
              <Quote className="h-8 w-8 text-primary mb-6 opacity-60" />
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-secondary fill-current" />
                ))}
              </div>

              <p className="text-foreground font-body leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-heading font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground font-body">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground font-body">
            Junte-se a mais de <span className="font-semibold text-primary">500+ empresários</span> que já automatizaram seus negócios
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;