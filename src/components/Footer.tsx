import { Instagram, Linkedin, Mail, Phone } from "lucide-react";

const Footer = () => {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer id="contato" className="bg-card border-t border-white/[0.06] py-16">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <img
                src="/lovable-uploads/660751fc-5937-48f4-9ba1-b37f69bc8c83.png"
                alt="Automiza"
                className="h-10"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-sm">
              Automatize o atendimento do seu negócio com chatbots inteligentes e
              personalizados. Mais vendas, menos trabalho manual.
            </p>
            <div className="flex gap-3">
              {[Instagram, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/[0.16] transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-5">Navegação</h3>
            <ul className="space-y-3">
              {[
                { label: "Início", id: "topo" },
                { label: "Como funciona", id: "como-funciona" },
                { label: "Benefícios", id: "beneficios" },
                { label: "Planos", id: "planos" },
                { label: "Depoimentos", id: "depoimentos" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollTo(link.id)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-5">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">contato@automiza.com.br</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">(11) 99999-9999</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Automiza. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            {["Política de Privacidade", "Termos de Uso", "LGPD"].map((item) => (
              <a key={item} href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
