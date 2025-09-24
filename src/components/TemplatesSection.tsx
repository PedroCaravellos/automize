import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Scissors, 
  Stethoscope, 
  Coffee, 
  Car, 
  GraduationCap,
  ArrowRight,
  MessageSquare,
  Users,
  TrendingUp
} from "lucide-react";

const TemplatesSection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const scrollToPlans = () => {
    const plansSection = document.getElementById('planos');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const templates = [
    {
      id: 'academia',
      icon: Dumbbell,
      title: 'Academia e Fitness',
      description: 'Converta leads interessados em exercícios e planos de treino',
      features: ['Consulta de objetivos', 'Agendamento de aulas', 'Planos personalizados'],
      conversions: '45%',
      leads: '200+',
      color: 'from-red-500 to-orange-500',
      preview: [
        'Qual seu objetivo: perder peso, ganhar massa ou condicionamento?',
        'Que horários você prefere treinar?',
        'Posso agendar uma visita gratuita?'
      ]
    },
    {
      id: 'salao',
      icon: Scissors,
      title: 'Salão de Beleza',
      description: 'Agende serviços e aumente o faturamento do seu salão',
      features: ['Agendamento online', 'Catálogo de serviços', 'Confirmação automática'],
      conversions: '38%',
      leads: '150+',
      color: 'from-pink-500 to-purple-500',
      preview: [
        'Qual serviço você gostaria: corte, coloração ou tratamento?',
        'Prefere qual profissional?',
        'Confirmo seu agendamento para...'
      ]
    },
    {
      id: 'clinica',
      icon: Stethoscope,
      title: 'Clínicas e Consultórios',
      description: 'Agende consultas e qualifique pacientes automaticamente',
      features: ['Triagem de sintomas', 'Agendamento médico', 'Lembretes de consulta'],
      conversions: '52%',
      leads: '100+',
      color: 'from-blue-500 to-cyan-500',
      preview: [
        'Qual sua especialidade médica de interesse?',
        'Há quanto tempo tem esses sintomas?',
        'Posso agendar uma consulta para...'
      ]
    },
    {
      id: 'cafeteria',
      icon: Coffee,
      title: 'Cafeterias e Restaurantes',
      description: 'Receba pedidos e reservas através do WhatsApp',
      features: ['Cardápio digital', 'Pedidos online', 'Reserva de mesas'],
      conversions: '35%',
      leads: '300+',
      color: 'from-yellow-600 to-orange-600',
      preview: [
        'Gostaria de fazer um pedido ou reservar mesa?',
        'Qual seu prato preferido do nosso cardápio?',
        'Para que horário gostaria da reserva?'
      ]
    },
    {
      id: 'autoescola',
      icon: Car,
      title: 'Autoescolas',
      description: 'Matricule alunos e agende aulas práticas',
      features: ['Informações sobre CNH', 'Agendamento de aulas', 'Acompanhamento do progresso'],
      conversions: '41%',
      leads: '80+',
      color: 'from-green-500 to-emerald-500',
      preview: [
        'Primeira habilitação ou adição de categoria?',
        'Prefere aulas em qual período?',
        'Posso agendar sua primeira aula...'
      ]
    },
    {
      id: 'cursos',
      icon: GraduationCap,
      title: 'Cursos e Educação',
      description: 'Matricule alunos em cursos online e presenciais',
      features: ['Catálogo de cursos', 'Informações sobre certificação', 'Suporte ao aluno'],
      conversions: '48%',
      leads: '250+',
      color: 'from-indigo-500 to-purple-500',
      preview: [
        'Qual área de conhecimento te interessa?',
        'Prefere curso online ou presencial?',
        'Posso te enviar mais informações sobre...'
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-accent">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Templates prontos para seu segmento
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-body">
            Chatbots pré-configurados com as melhores práticas para cada tipo de negócio
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-hero ${
                selectedTemplate === template.id ? 'ring-2 ring-primary shadow-hero' : ''
              }`}
              onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${template.color} flex items-center justify-center mb-4`}>
                <template.icon className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-xl font-heading font-semibold mb-2">
                {template.title}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4 font-body">
                {template.description}
              </p>

              <div className="flex gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {template.conversions} conversão
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {template.leads} leads/mês
                </Badge>
              </div>

              <ul className="space-y-2 mb-4">
                {template.features.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              {selectedTemplate === template.id && (
                <div className="mt-4 pt-4 border-t animate-fade-in">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Exemplo de conversa:
                  </h4>
                  <div className="space-y-2">
                    {template.preview.map((message, index) => (
                      <div key={index} className="bg-muted p-2 rounded-lg text-sm">
                        🤖 {message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                variant={selectedTemplate === template.id ? "default" : "outline"}
                className="w-full mt-4"
                size="sm"
                onClick={selectedTemplate === template.id ? scrollToPlans : () => setSelectedTemplate(template.id)}
              >
                {selectedTemplate === template.id ? "Começar com este template" : "Ver detalhes"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-card rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-heading font-semibold mb-4">
              Não encontrou seu segmento?
            </h3>
            <p className="text-muted-foreground mb-6 font-body">
              Criamos chatbots personalizados para qualquer tipo de negócio. 
              Nossa IA se adapta ao seu modelo de atendimento.
            </p>
            <Button variant="hero" size="lg" onClick={scrollToPlans}>
              Criar chatbot personalizado
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;