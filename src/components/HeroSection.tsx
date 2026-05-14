import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, MessageSquare } from "lucide-react";
import AuthModal from "./auth/AuthModal";

const HeroSection = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const scrollToPlans = () => {
    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="topo" className="min-h-screen flex items-center bg-background relative overflow-hidden pt-16">
      {/* Subtle radial gradient behind the content */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center py-24 lg:py-0 min-h-[calc(100vh-4rem)]">
          {/* Left: copy */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/[0.08] text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-primary/20 w-fit">
              <Zap className="h-3 w-3" />
              Automação inteligente para o seu negócio
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-[64px] font-bold text-foreground mb-6 leading-[1.05] tracking-tight">
              Seu negócio no
              <br />
              <span className="text-primary">piloto automático</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
              Automatize o atendimento com chatbots inteligentes que convertem
              visitantes em clientes. Mais vendas, menos trabalho manual,
              resultados comprovados.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-base font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
                onClick={scrollToPlans}
              >
                Começar teste grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 h-12 text-base border-white/[0.12] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] hover:border-white/20"
                onClick={scrollToPlans}
              >
                Ver planos
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Setup em 5 minutos
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                IA avançada
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Integração simples
              </div>
            </div>
          </div>

          {/* Right: product mockup */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Glow behind card */}
            <div className="absolute inset-8 bg-primary/[0.06] blur-3xl rounded-2xl" />

            <div className="relative w-full max-w-md">
              {/* Browser chrome */}
              <div className="bg-card rounded-xl border border-white/[0.08] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
                {/* Top bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                    <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                    <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-white/[0.04] rounded border border-white/[0.06] w-56 mx-auto flex items-center justify-center">
                      <span className="text-[11px] text-muted-foreground">app.automiza.com.br</span>
                    </div>
                  </div>
                </div>

                {/* Chat area */}
                <div className="p-5 space-y-3 bg-background/60">
                  {/* Chat header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Automiza Bot</p>
                      <p className="text-xs text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Online agora
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex justify-start">
                    <div className="bg-card border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                      <p className="text-sm text-foreground">Olá! Como posso ajudar você hoje? 👋</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                      <p className="text-sm text-white">Quero saber sobre os planos</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-card border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                      <p className="text-sm text-foreground">
                        Ótimo! O plano Pro por R$197/mês inclui 5.000 conversas. Posso agendar uma demo agora?
                      </p>
                    </div>
                  </div>

                  {/* Typing */}
                  <div className="flex justify-start">
                    <div className="bg-card border border-white/[0.06] rounded-2xl px-4 py-3">
                      <div className="flex gap-1 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2.5 border border-white/[0.06]">
                      <span className="text-sm text-muted-foreground flex-1">Digite sua mensagem...</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 border-t border-white/[0.06]">
                  <div className="px-4 py-3 text-center border-r border-white/[0.06]">
                    <p className="text-base font-bold text-foreground">+58%</p>
                    <p className="text-[11px] text-muted-foreground">Conversões</p>
                  </div>
                  <div className="px-4 py-3 text-center border-r border-white/[0.06]">
                    <p className="text-base font-bold text-foreground">24/7</p>
                    <p className="text-[11px] text-muted-foreground">Atendimento</p>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <p className="text-base font-bold text-foreground">&lt;5s</p>
                    <p className="text-[11px] text-muted-foreground">Resposta</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </section>
  );
};

export default HeroSection;
