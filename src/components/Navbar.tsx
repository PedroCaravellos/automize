import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, LayoutDashboard, Settings, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./auth/AuthModal";

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("inicio");
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, profile, signOut, trialDaysRemaining } = useAuth();
  const navigate = useNavigate();

  const getUserInitials = (email: string, name?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

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

  const handleDashboard = () => navigate("/dashboard");
  const handleSignOut = async () => await signOut();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleLinkClick("#topo")}
            className="flex items-center shrink-0"
            aria-label="Voltar ao início"
          >
            <img
              src="/lovable-uploads/e5a8ad53-861c-44df-877e-161c8f96702f.png"
              alt="Automiza"
              className="h-8"
            />
          </button>

          {/* Desktop: nav links + CTAs (right side) */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.href)}
                  className={`text-sm transition-colors hover:text-foreground ${
                    activeSection === link.id
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-white/[0.08]">
              {user ? (
                <>
                  {profile?.trial_ativo && (
                    <Badge variant="outline" className="flex items-center gap-1 border-white/10 text-muted-foreground text-xs">
                      <Clock className="h-3 w-3" />
                      {trialDaysRemaining()} dias
                    </Badge>
                  )}
                  {profile?.plano_ativo && profile.nome_plano && (
                    <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs">
                      {profile.nome_plano}
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getUserInitials(user.email || '', profile?.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <div className="flex items-center gap-2 p-2">
                        <div className="flex flex-col space-y-0.5 leading-none">
                          {profile?.name && <p className="font-medium text-sm">{profile.name}</p>}
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDashboard}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground text-sm"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Entrar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white px-4 text-sm"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Começar grátis
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getUserInitials(user.email || '', profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      {profile?.name && <p className="font-medium text-sm">{profile.name}</p>}
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDashboard}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setAuthModalOpen(true)}>
                Entrar
              </Button>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-card border-white/[0.06]">
                <nav className="flex flex-col gap-1 mt-8">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(link.href)}
                      className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/[0.05] hover:text-foreground ${
                        activeSection === link.id
                          ? "text-foreground font-medium bg-white/[0.04]"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                  {!user && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col gap-2">
                      <Button variant="outline" className="w-full border-white/10" onClick={() => { setIsOpen(false); setAuthModalOpen(true); }}>
                        Entrar
                      </Button>
                      <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => { setIsOpen(false); setAuthModalOpen(true); }}>
                        Começar grátis
                      </Button>
                    </div>
                  )}
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
