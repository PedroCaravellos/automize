import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bot, LogOut, Settings, User, Clock, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardHeader() {
  const { user, profile, signOut, trialDaysRemaining } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getUserInitials = (email: string, name?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center space-x-2 md:space-x-3">
            <img 
              src="/lovable-uploads/419fc9aa-9a41-4cc0-b8ce-190b4a7e6869.png" 
              alt="Automiza" 
              className="h-6 w-6 md:h-7 md:w-7"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold">Automiza</h1>
              {!isMobile && <p className="text-xs text-muted-foreground">Dashboard</p>}
            </div>
          </div>
          
          {/* Botão Voltar ao Início - Oculto em mobile */}
          {!isMobile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGoHome}
              className="flex items-center space-x-2"
              aria-label="Voltar ao início"
            >
              <Home className="h-4 w-4" />
              <span>Voltar ao início</span>
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Trial Badge */}
          {profile?.trial_ativo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {isMobile ? (
                    <Badge variant="outline" className="flex items-center space-x-1 px-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{trialDaysRemaining()}d</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Trial - {trialDaysRemaining()} dias restantes</span>
                    </Badge>
                  )}
                </TooltipTrigger>
                {isMobile && (
                  <TooltipContent>
                    <p>Trial - {trialDaysRemaining()} dias restantes</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Plan Badge */}
          {profile?.plano_ativo && profile.nome_plano && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {isMobile ? (
                    <Badge className="bg-primary px-2 text-xs">
                      {profile.nome_plano}
                    </Badge>
                  ) : (
                    <Badge className="bg-primary">
                      Plano {profile.nome_plano}
                    </Badge>
                  )}
                </TooltipTrigger>
                {isMobile && (
                  <TooltipContent>
                    <p>Plano {profile.nome_plano}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 md:h-10 md:w-10 rounded-full"
                aria-label="Menu do usuário"
              >
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarFallback className="bg-primary/10 text-xs md:text-sm">
                    {user && getUserInitials(user.email || '', profile?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {profile?.name && (
                    <p className="font-medium">{profile.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}