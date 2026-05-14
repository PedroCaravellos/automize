import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  TrendingUp,
} from "lucide-react";

const templates = [
  {
    id: "academia",
    icon: Dumbbell,
    title: "Academia e Fitness",
    description: "Converta leads interessados em exercícios e planos de treino",
    features: ["Consulta de objetivos", "Agendamento de aulas", "Planos personalizados"],
    conversions: "45%",
    leads: "200+",
    preview: [
      "Qual seu objetivo: perder peso, ganhar massa ou condicionamento?",
      "Que horários você prefere treinar?",
      "Posso agendar uma visita gratuita?",
    ],
  },
  {
    id: "salao",
    icon: Scissors,
    title: "Salão de Beleza",
    description: "Agende serviços e aumente o faturamento do seu salão",
    features: ["Agendamento online", "Catálogo de serviços", "Confirmação automática"],
    conversions: "38%",
    leads: "150+",
    preview: [
      "Qual serviço você gostaria: corte, coloração ou tratamento?",
      "Prefere qual profissional?",
      "Confirmo seu agendamento para...",
    ],
  },
  {
    id: "clinica",
    icon: Stethoscope,
    title: "Clínicas e Consultórios",
    description: "Agende consultas e qualifique pacientes automaticamente",
    features: ["Triagem de sintomas", "Agendamento médico", "Lembretes de consulta"],
    conversions: "52%",
    leads: "100+",
    preview: [
      "Qual sua especialidade médica de interesse?",
      "Há quanto tempo tem esses sintomas?",
      "Posso agendar uma consulta para...",
    ],
  },
  {
    id: "cafeteria",
    icon: Coffee,
    title: "Cafeterias e Restaurantes",
    description: "Receba pedidos e reservas através do WhatsApp",
    features: ["Cardápio digital", "Pedidos online", "Reserva de mesas"],
    conversions: "35%",
    leads: "300+",
    preview: [
      "Gostaria de fazer um pedido ou reservar mesa?",
      "Qual seu prato preferido do nosso cardápio?",
      "Para que horário gostaria da reserva?",
    ],
  },
  {
    id: "autoescola",
    icon: Car,
    title: "Autoescolas",
    description: "Matricule alunos e agende aulas práticas",
    features: ["Informações sobre CNH", "Agendamento de aulas", "Acompanhamento do progresso"],
    conversions: "41%",
    leads: "80+",
    preview: [
      "Primeira habilitação ou adição de categoria?",
      "Prefere aulas em qual período?",
      "Posso agendar sua primeira aula...",
    ],
  },
  {
    id: "cursos",
    icon: GraduationCap,
    title: "Cursos e Educação",
    description: "Matricule alunos em cursos online e presenciais",
    features: ["Catálogo de cursos", "Informações sobre certificação", "Suporte ao aluno"],
    conversions: "48%",
    leads: "250+",
    preview: [
      "Qual área de conhecimento te interessa?",
      "Prefere curso online ou presencial?",
      "Posso te enviar mais informações sobre...",
    ],
  },
];

const TemplatesSection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const scrollToPlans = () =>
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">
              Templates
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Templates prontos para seu segmento
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Chatbots pré-configurados com as melhores práticas para cada tipo de negócio.
            </p>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() =>
                  setSelectedTemplate(selectedTemplate === template.id ? null : template.id)
                }
                className={`bg-card border rounded-xl p-6 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? "border-primary/50 ring-1 ring-primary/20"
                    : "border-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <template.icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="text-base font-semibold text-foreground mb-1">{template.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                <div className="flex gap-2 mb-4 flex-wrap">
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 border">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {template.conversions} conversão
                  </Badge>
                  <Badge variant="outline" className="text-xs border-white/[0.08] text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {template.leads} leads/mês
                  </Badge>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {template.features.map((feature) => (
                    <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {selectedTemplate === template.id && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Exemplo de conversa:
                    </p>
                    <div className="space-y-2">
                      {template.preview.map((message, index) => (
                        <div
                          key={index}
                          className="bg-muted border border-white/[0.06] p-2.5 rounded-lg text-xs text-muted-foreground"
                        >
                          🤖 {message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  className={`w-full mt-4 h-9 text-sm ${
                    selectedTemplate === template.id
                      ? "bg-primary hover:bg-primary/90 text-white"
                      : "border-white/[0.10] text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedTemplate === template.id) scrollToPlans();
                    else setSelectedTemplate(template.id);
                  }}
                >
                  {selectedTemplate === template.id ? "Começar com este template" : "Ver detalhes"}
                  <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Button>
              </div>
            ))}
          </div>

          {/* Custom chatbot CTA */}
          <div className="bg-card border border-white/[0.06] rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Não encontrou seu segmento?
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Criamos chatbots personalizados para qualquer tipo de negócio. Nossa IA se
              adapta ao seu modelo de atendimento.
            </p>
            <Button
              className="bg-primary hover:bg-primary/90 text-white px-8 h-11"
              onClick={scrollToPlans}
            >
              Criar chatbot personalizado
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
