import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bot, LogOut, Settings, User, Clock, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader() {
  const { user, profile, signOut, trialDaysRemaining } = useAuth();
  const navigate = useNavigate();

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
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/419fc9aa-9a41-4cc0-b8ce-190b4a7e6869.png" 
              alt="Automiza" 
              className="h-7 w-7"
            />
            <div>
              <h1 className="text-xl font-bold">Automiza</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
          
          {/* Botão Voltar ao Início */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGoHome}
            className="flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Voltar ao início</span>
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Trial Badge */}
          {profile?.trial_ativo && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Trial - {trialDaysRemaining()} dias restantes</span>
            </Badge>
          )}

          {/* Plan Badge */}
          {profile?.plano_ativo && profile.nome_plano && (
            <Badge className="bg-primary">
              Plano {profile.nome_plano}
            </Badge>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10">
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