import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MessageSquare, Smartphone, Activity, Users, BarChart3, Settings } from "lucide-react";
import ActionBlockModal from "./ActionBlockModal";
import DashboardTabs from "./DashboardTabs";

export default function DashboardContent() {
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockedAction, setBlockedAction] = useState("");
  const { hasAccess } = useAuth();

  const handleActionClick = (action: string) => {
    if (!hasAccess()) {
      setBlockedAction(action);
      setBlockModalOpen(true);
      return;
    }
    // Aqui seria a lógica real da ação quando liberada
    console.log(`Executando: ${action}`);
  };

  const handlePlansClick = () => {
    // Rolar para a seção de planos na landing page
    window.location.href = "/#planos";
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-2"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu painel de controle
            </p>
          </div>
        </div>
      </div>

      <DashboardTabs />
      
      <ActionBlockModal
        open={blockModalOpen}
        onOpenChange={setBlockModalOpen}
        onPlansClick={handlePlansClick}
        action={blockedAction}
      />
    </div>
  );
}