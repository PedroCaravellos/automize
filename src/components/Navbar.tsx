import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import AuthModal from "./auth/AuthModal";

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("inicio");
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navLinks = [
    { id: "inicio", label: "Início", href: "#topo" },
    { id: "como-funciona", label: "Como funciona", href: "#como-funciona" },
    { id: "beneficios", label: "Benefícios", href: "#beneficios" },
    { id: "planos", label: "Planos", href: "#planos" },
    { id: "depoimentos", label: "Depoimentos", href: "#depoimentos" },
    { id: "contato", label: "Contato", href: "#contato" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.id);
      const scrollY = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section === "inicio" ? "topo" : section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollY >= offsetTop && scrollY < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleLinkClick("#topo")}
              className="flex items-center"
              aria-label="Voltar ao início"
            >
              <img 
                src="/lovable-uploads/320b5528-809b-43ff-9dd7-f1cfce7b321d.png" 
                alt="Automiza - Seu negócio no piloto automático" 
                className="h-8"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.href)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === link.id 
                    ? "text-primary" 
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </button>
            ))}
            <Button onClick={() => setAuthModalOpen(true)}>
              Começar agora
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(link.href)}
                      className={`text-left text-lg font-medium transition-colors hover:text-primary ${
                        activeSection === link.id 
                          ? "text-primary" 
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setIsOpen(false);
                        setAuthModalOpen(true);
                      }}
                    >
                      Começar agora
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </nav>
  );
};

export default Navbar;