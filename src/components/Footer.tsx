import { Bot, Instagram, Linkedin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contato" className="bg-foreground text-primary-foreground py-16">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/660751fc-5937-48f4-9ba1-b37f69bc8c83.png" 
                alt="Automiza - Seu negócio no piloto automático" 
                className="h-12"
              />
            </div>
            <p className="text-primary-foreground/80 font-body leading-relaxed mb-6 max-w-md">
              Automatize o atendimento do seu negócio com chatbots inteligentes e personalizados. 
              Mais vendas, menos trabalho manual.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-primary-foreground/10 p-3 rounded-full hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-primary-foreground/10 p-3 rounded-full hover:bg-primary-foreground/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="bg-primary-foreground/10 p-3 rounded-full hover:bg-primary-foreground/20 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Navegação</h3>
            <ul className="space-y-3 font-body">
              <li><button onClick={() => document.getElementById('topo')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Início</button></li>
              <li><button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Como funciona</button></li>
              <li><button onClick={() => document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Benefícios</button></li>
              <li><button onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Planos</button></li>
              <li><button onClick={() => document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Depoimentos</button></li>
              <li><button onClick={() => document.getElementById('topo')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Voltar ao topo</button></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Contato</h3>
            <ul className="space-y-4 font-body">
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-secondary" />
                <span className="text-primary-foreground/80">contato@automiza.com.br</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-secondary" />
                <span className="text-primary-foreground/80">(11) 99999-9999</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 font-body text-sm">
              © 2024 Automiza. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 font-body text-sm">
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Política de Privacidade</a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">LGPD</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;