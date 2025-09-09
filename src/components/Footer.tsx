import { Bot, Instagram, Linkedin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white py-16">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-secondary p-3 rounded-xl">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-heading font-bold">Automiza</span>
            </div>
            <p className="text-white/80 font-body leading-relaxed mb-6 max-w-md">
              Automatize o atendimento do seu negócio com chatbots inteligentes e personalizados. 
              Mais vendas, menos trabalho manual.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Links Úteis</h3>
            <ul className="space-y-3 font-body">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Como funciona</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Preços</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Casos de sucesso</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Suporte</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Contato</h3>
            <ul className="space-y-4 font-body">
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-secondary" />
                <span className="text-white/80">contato@automiza.com.br</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-secondary" />
                <span className="text-white/80">(11) 99999-9999</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 font-body text-sm">
              © 2024 Automiza. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 font-body text-sm">
              <a href="#" className="text-white/60 hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">LGPD</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;