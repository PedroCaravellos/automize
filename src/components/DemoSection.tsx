import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, MessageSquare, ArrowRight, Clock, CheckCircle } from "lucide-react";

const DemoSection = () => {
  const [activeDemo, setActiveDemo] = useState<'academia' | 'salao' | 'clinica'>('academia');
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  const demos = {
    academia: {
      title: "Academia FitMax",
      messages: [
        { type: 'user', text: 'Oi! Gostaria de saber sobre os planos da academia.' },
        { type: 'bot', text: 'Olá! 😊 Que ótimo saber do seu interesse! Temos planos a partir de R$ 79,90/mês. Qual é seu objetivo principal: perder peso, ganhar massa ou condicionamento?' },
        { type: 'user', text: 'Quero ganhar massa muscular' },
        { type: 'bot', text: 'Perfeito! Para ganho de massa, recomendo nosso Plano Pro (R$ 129,90) que inclui musculação + acompanhamento nutricional. Posso agendar uma visita gratuita para você conhecer?' },
        { type: 'user', text: 'Sim, pode agendar' },
        { type: 'bot', text: '🎉 Excelente! Tenho disponibilidade hoje às 18h ou amanhã às 16h. Qual prefere? Só preciso do seu nome e telefone para confirmar.' }
      ]
    },
    salao: {
      title: "Salão Beleza Total",
      messages: [
        { type: 'user', text: 'Quero marcar um corte e escova' },
        { type: 'bot', text: 'Oi, linda! 💫 Adoraria te ajudar! Corte + escova fica R$ 85. Qual dia você prefere?' },
        { type: 'user', text: 'Sábado de manhã' },
        { type: 'bot', text: 'Sábado tenho às 9h com a Marina ou 11h com a Carla. Ambas são especialistas em cortes modernos! Qual horário combina mais?' },
        { type: 'user', text: 'Às 9h com a Marina' },
        { type: 'bot', text: '✨ Perfeito! Agendado para sábado 9h com a Marina. Vou enviar confirmação no WhatsApp. Qual seu nome e telefone?' }
      ]
    },
    clinica: {
      title: "Clínica Fisio+",
      messages: [
        { type: 'user', text: 'Preciso de fisioterapia para dor nas costas' },
        { type: 'bot', text: 'Entendo sua situação e posso te ajudar! 🏥 Temos especialistas em coluna. A consulta de avaliação é R$ 120. Há quanto tempo sente essa dor?' },
        { type: 'user', text: 'Umas 2 semanas' },
        { type: 'bot', text: 'É importante tratar logo para evitar que piore. Tenho horário hoje às 15h com Dr. Carlos (especialista em coluna). Posso agendar? É só R$ 120 a consulta.' },
        { type: 'user', text: 'Pode agendar sim' },
        { type: 'bot', text: '👩‍⚕️ Agendado! Dr. Carlos hoje às 15h. Leve exames anteriores se tiver. Confirmo seu nome e telefone para o agendamento?' }
      ]
    }
  };

  const startDemo = (type: 'academia' | 'salao' | 'clinica') => {
    setActiveDemo(type);
    setShowChat(true);
    setCurrentMessage(0);
    
    // Simulate typing messages
    const messages = demos[type].messages;
    messages.forEach((_, index) => {
      setTimeout(() => {
        setCurrentMessage(index + 1);
      }, (index + 1) * 1500);
    });
  };

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-6">
            Veja o Automiza em ação
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto font-body">
            Demonstração real de como nossos chatbots convertem visitantes em clientes
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Controls */}
          <div className="space-y-6">
            <h3 className="text-2xl font-heading font-semibold text-primary-foreground mb-8">
              Escolha seu segmento:
            </h3>
            
            <div className="space-y-4">
              {Object.entries(demos).map(([key, demo]) => (
                <Button
                  key={key}
                  variant={activeDemo === key ? "hero" : "outline-hero"}
                  size="lg"
                  className="w-full justify-start text-left"
                  onClick={() => startDemo(key as any)}
                >
                  <div className="flex items-center gap-3">
                    <Play className="h-5 w-5" />
                    <div>
                      <div className="font-semibold">{demo.title}</div>
                      <div className="text-sm opacity-80">
                        {key === 'academia' && 'Conversão de leads fitness'}
                        {key === 'salao' && 'Agendamento de serviços'}
                        {key === 'clinica' && 'Consultas médicas'}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8">
              <h4 className="font-heading font-semibold text-primary-foreground mb-4">
                Resultados típicos:
              </h4>
              <div className="space-y-3 text-primary-foreground/90">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>40-60% mais conversões</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Resposta em menos de 5 segundos</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Atendimento 24/7 automatizado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Demo */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-hero overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-primary to-primary-glow text-white p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6" />
                  <span className="font-heading font-semibold">
                    {demos[activeDemo].title}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Online</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {!showChat ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Clique em um botão acima para ver a demonstração</p>
                    </div>
                  </div>
                ) : (
                  demos[activeDemo].messages.slice(0, currentMessage).map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-white border shadow-sm'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className="flex items-center gap-1 mt-1 opacity-60">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">agora</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-transparent outline-none"
                    disabled
                  />
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {showChat && (
              <div className="absolute -bottom-4 -right-4 bg-secondary text-white px-4 py-2 rounded-full font-semibold animate-pulse">
                Lead convertido! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;