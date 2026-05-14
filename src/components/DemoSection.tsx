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
    demos[type].messages.forEach((_, index) => {
      setTimeout(() => setCurrentMessage(index + 1), (index + 1) * 1500);
    });
  };

  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">
              Demonstração
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Veja o Automiza em ação
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Demonstração real de como nossos chatbots convertem visitantes em clientes.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Controls */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground mb-6">Escolha seu segmento:</p>

              {Object.entries(demos).map(([key, demo]) => (
                <button
                  key={key}
                  onClick={() => startDemo(key as 'academia' | 'salao' | 'clinica')}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeDemo === key
                      ? "border-primary/40 bg-primary/[0.06] text-foreground"
                      : "border-white/[0.06] bg-card text-muted-foreground hover:border-white/[0.12] hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activeDemo === key ? "bg-primary/15" : "bg-white/[0.04]"
                    }`}>
                      <Play className={`h-4 w-4 ${activeDemo === key ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{demo.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {key === 'academia' && 'Conversão de leads fitness'}
                        {key === 'salao' && 'Agendamento de serviços'}
                        {key === 'clinica' && 'Consultas médicas'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {/* Results */}
              <div className="bg-card border border-white/[0.06] rounded-xl p-5 mt-6">
                <p className="text-sm font-medium text-foreground mb-4">Resultados típicos:</p>
                <div className="space-y-3">
                  {[
                    "40-60% mais conversões",
                    "Resposta em menos de 5 segundos",
                    "Atendimento 24/7 automatizado",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Window */}
            <div className="relative">
              <div className="bg-card rounded-xl border border-white/[0.08] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-white/[0.06] bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {demos[activeDemo].title}
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-3 bg-background/40">
                  {!showChat ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="h-10 w-10 mx-auto mb-3 text-white/[0.08]" />
                        <p className="text-sm text-muted-foreground">
                          Clique em um segmento para ver a demonstração
                        </p>
                      </div>
                    </div>
                  ) : (
                    demos[activeDemo].messages.slice(0, currentMessage).map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                            message.type === 'user'
                              ? 'bg-primary text-white rounded-tr-sm'
                              : 'bg-card border border-white/[0.06] text-foreground rounded-tl-sm'
                          }`}
                        >
                          <p>{message.text}</p>
                          <div className="flex items-center gap-1 mt-1 opacity-50">
                            <Clock className="h-3 w-3" />
                            <span className="text-[10px]">agora</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2.5 border border-white/[0.06]">
                    <span className="flex-1 text-sm text-muted-foreground">Digite sua mensagem...</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {showChat && (
                <div className="absolute -bottom-3 -right-3 bg-primary text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-[0_4px_12px_rgba(37,99,235,0.4)]">
                  Lead convertido! 🎉
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
