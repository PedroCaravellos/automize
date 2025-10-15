import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Calendar, Zap, ChevronRight, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: "active" | "inactive" | "pending";
  color: string;
  features: string[];
}

interface IntegrationCardProps {
  integration: Integration;
  onConfigure: () => void;
  onToggle: (enabled: boolean) => void;
}

const IntegrationCard = ({ integration, onConfigure, onToggle }: IntegrationCardProps) => {
  const Icon = integration.icon;
  const isActive = integration.status === "active";
  const isPending = integration.status === "pending";

  const getStatusBadge = () => {
    if (isPending) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pendente
        </Badge>
      );
    }
    if (isActive) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Ativa
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Inativa
      </Badge>
    );
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${integration.color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{integration.name}</h3>
            <p className="text-sm text-muted-foreground">
              {integration.description}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 mb-4">
        {integration.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={onToggle}
            disabled={isPending}
          />
          <span className="text-sm text-muted-foreground">
            {isActive ? "Ativada" : "Desativada"}
          </span>
        </div>
        <Button variant="outline" onClick={onConfigure}>
          Configurar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export const IntegrationsGrid = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const integrations: Integration[] = [
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Conecte seu número do WhatsApp Business para automações",
      icon: MessageSquare,
      status: "inactive",
      color: "bg-green-600",
      features: [
        "Envio automático de mensagens",
        "Respostas do chatbot",
        "Notificações de agendamentos",
        "Follow-up com leads",
      ],
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sincronize agendamentos com o Google Calendar",
      icon: Calendar,
      status: "inactive",
      color: "bg-blue-600",
      features: [
        "Sincronização bidirecional",
        "Lembretes automáticos",
        "Bloqueio de horários",
        "Convites por email",
      ],
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Conecte com 5000+ aplicativos via Zapier",
      icon: Zap,
      status: "inactive",
      color: "bg-orange-600",
      features: [
        "Webhooks personalizados",
        "Automações ilimitadas",
        "Integração com CRM",
        "Exportação de dados",
      ],
    },
  ];

  const handleConfigure = (integrationId: string) => {
    setSelectedIntegration(integrationId);
  };

  const handleToggle = (integrationId: string, enabled: boolean) => {
    console.log(`Toggle ${integrationId}:`, enabled);
    // Implementar lógica de ativação/desativação
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConfigure={() => handleConfigure(integration.id)}
            onToggle={(enabled) => handleToggle(integration.id, enabled)}
          />
        ))}
      </div>

      <Dialog
        open={selectedIntegration !== null}
        onOpenChange={() => setSelectedIntegration(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Configurar {integrations.find(i => i.id === selectedIntegration)?.name}
            </DialogTitle>
            <DialogDescription>
              Configure a integração para começar a usar
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Funcionalidade de configuração será implementada aqui
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
