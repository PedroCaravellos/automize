import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="container px-4 mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-secondary p-4 rounded-2xl shadow-button">
              <Bot className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-primary mb-8 leading-tight">
            Automiza – seu negócio no 
            <span className="block">piloto automático</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-foreground mb-12 max-w-3xl mx-auto font-body font-light leading-relaxed">
            Chatbots personalizados que automatizam conversas no WhatsApp e aumentam 
            a eficiência do seu atendimento.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="lg" className="shadow-button hover:shadow-hero transition-all">
              Comece Agora
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Ver Planos
            </Button>
          </div>

          {/* Features Preview */}
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
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
              <span className="font-body">Integração WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;