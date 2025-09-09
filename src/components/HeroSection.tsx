import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-secondary/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-primary-glow/30 rounded-full animate-glow"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-secondary-glow/25 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container px-4 mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-secondary p-4 rounded-2xl shadow-button">
              <Bot className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-primary-foreground mb-6 leading-tight">
            Seu negócio rodando
            <span className="block bg-gradient-to-r from-secondary to-secondary-glow bg-clip-text text-transparent">
              sozinho, 24/7
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto font-body font-light">
            Chatbots inteligentes e personalizados que aumentam suas vendas e reduzem o trabalho manual. 
            Mais tempo pra você focar no que importa: fazer seu negócio crescer.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="hero" size="lg" className="shadow-button hover:shadow-hero transition-all">
              Começar grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline-hero" size="lg">
              Ver demonstração
            </Button>
          </div>

          {/* Features Preview */}
          <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-secondary" />
              <span className="font-body">Setup em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-secondary" />
              <span className="font-body">IA avançada</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-secondary" />
              <span className="font-body">Integração simples</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;