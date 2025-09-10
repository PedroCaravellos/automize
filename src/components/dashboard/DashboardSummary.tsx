import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, ExternalLink, Settings, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardSummaryProps {
  onTabChange: (tab: string) => void;
}

export default function DashboardSummary({ onTabChange }: DashboardSummaryProps) {
  const { profile, activateTrial, hasAccess } = useAuth();

  const handleActivateTrial = async () => {
    try {
      await activateTrial();
    } catch (error) {
      console.error('Erro ao ativar trial:', error);
    }
  };

  const handlePlansClick = () => {
    window.location.href = "/#planos";
  };

  const handleActionClick = (action: string, tabName?: string) => {
    if (!hasAccess() && action !== 'activate-trial' && action !== 'view-plans') {
      // Para ações que precisam de acesso, deixar o gate existente lidar
      return;
    }
    
    if (tabName) {
      onTabChange(tabName);
    } else if (action === 'view-plans') {
      handlePlansClick();
    } else if (action === 'activate-trial') {
      handleActivateTrial();
    }
  };

  const getTrialDaysRemaining = () => {
    if (!profile?.trial_fim_em) return 0;
    const now = new Date();
    const trialEnd = new Date(profile.trial_fim_em);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const renderStatus = () => {
    if (profile?.plano_ativo) {
      return (
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-warning" />
          <div>
            <h3 className="font-semibold text-foreground">
              Plano: {profile.nome_plano}
            </h3>
            <Badge variant="default" className="bg-success text-success-foreground">
              Ativo
            </Badge>
          </div>
        </div>
      );
    }

    if (profile?.trial_ativo && getTrialDaysRemaining() > 0) {
      const daysRemaining = getTrialDaysRemaining();
      return (
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Trial ativo</h3>
            <Badge variant="secondary">
              {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
            </Badge>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Zap className="h-5 w-5 text-muted-foreground" />
        <div>
          <h3 className="font-semibold text-foreground">Sem plano ativo</h3>
          <p className="text-sm text-muted-foreground">
            Ative o trial ou escolha um plano para liberar o uso.
          </p>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    if (profile?.plano_ativo) {
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleActionClick('plan', 'plan')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Meu Plano
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleActionClick('integrations', 'integracoes')}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Integrações
          </Button>
        </div>
      );
    }

    if (profile?.trial_ativo && getTrialDaysRemaining() > 0) {
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleActionClick('plan', 'plan')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Meu Plano
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleActionClick('view-plans')}
            className="flex items-center gap-2"
          >
            <Crown className="h-4 w-4" />
            Escolher plano
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleActionClick('integrations', 'integracoes')}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Integrações
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => handleActionClick('activate-trial')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Ativar trial de 7 dias
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleActionClick('view-plans')}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Ver planos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleActionClick('plan', 'plan')}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Meu Plano
        </Button>
      </div>
    );
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <div className="space-y-1">
            {renderStatus()}
          </div>
          <div className="flex justify-start md:justify-end">
            {renderActions()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}