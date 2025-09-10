import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, Copy, MessageSquare, Instagram, Globe, Users, Zap, Clock, Info, CheckCircle, AlertCircle, Circle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function IntegrationsSection() {
  const { profile, hasAccess, activateTrial, isHydrating, whatsappIntegration, updateWhatsAppIntegration, connectWhatsApp, disconnectWhatsApp } = useAuth();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const webhookUrl = `https://automiza.net/webhooks/whatsapp/${profile?.user_id || 'user-id'}`;

  const handleActivateTrial = async () => {
    setIsActivating(true);
    try {
      await activateTrial();
      toast({
        title: "Trial ativado!",
        description: "Você tem 7 dias para explorar todas as funcionalidades.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível ativar o trial. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleGoToPlans = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'plan');
    window.history.replaceState({}, '', url.toString());
  };

  const accessAllowed = hasAccess();

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada",
      description: "URL do webhook copiada para a área de transferência.",
    });
  };

  const handleSaveWhatsApp = () => {
    if (!whatsappIntegration.provider || !whatsappIntegration.apiKey || !whatsappIntegration.wabaId) {
      toast({
        title: "Dados incompletos",
        description: "Preencha pelo menos o provedor, API key e WABA ID.",
        variant: "destructive",
      });
      return;
    }
    
    updateWhatsAppIntegration({ status: 'configured' });
    toast({
      title: "Dados salvos",
      description: "Configurações do WhatsApp salvas com sucesso.",
    });
  };

  const handleConnectWhatsApp = () => {
    try {
      connectWhatsApp();
      toast({
        title: "WhatsApp conectado!",
        description: "Integração com WhatsApp Business ativada (simulado).",
      });
    } catch (error) {
      toast({
        title: "Erro ao conectar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectWhatsApp = () => {
    disconnectWhatsApp();
    toast({
      title: "WhatsApp desconectado",
      description: "Integração com WhatsApp Business desativada (simulado).",
    });
  };

  const handleClearFields = () => {
    updateWhatsAppIntegration({
      status: 'disconnected',
      provider: '',
      apiKey: '',
      wabaId: '',
      phoneNumberId: '',
      verifyToken: ''
    });
    toast({
      title: "Campos limpos",
      description: "Dados do WhatsApp foram removidos.",
    });
  };

  const getStatusInfo = () => {
    switch (whatsappIntegration.status) {
      case 'connected':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', text: 'Conectado' };
      case 'configured':
        return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'Em configuração' };
      default:
        return { icon: Circle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', text: 'Não conectado' };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (isHydrating) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-4 w-96 mx-auto mb-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!accessAllowed) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">
            Conecte suas ferramentas. Integrações reais serão liberadas em breve.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="text-center">
                <CardTitle>Ative seu trial ou plano para habilitar integrações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleActivateTrial}
                  disabled={isActivating}
                  className="w-full"
                  size="lg"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {isActivating ? "Ativando..." : "Ativar trial"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleGoToPlans}
                  className="w-full"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Ver planos
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="opacity-50 pointer-events-none">
            <IntegrationsContent 
              whatsappIntegration={whatsappIntegration}
              updateWhatsAppIntegration={updateWhatsAppIntegration}
              showApiKey={showApiKey}
              setShowApiKey={setShowApiKey}
              webhookUrl={webhookUrl}
              handleSaveWhatsApp={handleSaveWhatsApp}
              handleConnectWhatsApp={handleConnectWhatsApp}
              handleDisconnectWhatsApp={handleDisconnectWhatsApp}
              handleClearFields={handleClearFields}
              copyWebhookUrl={copyWebhookUrl}
              statusInfo={statusInfo}
              StatusIcon={StatusIcon}
              disabled={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground mb-2">
          Conecte suas ferramentas. Integrações reais serão liberadas em breve.
        </p>
      </div>

      <IntegrationsContent 
        whatsappIntegration={whatsappIntegration}
        updateWhatsAppIntegration={updateWhatsAppIntegration}
        showApiKey={showApiKey}
        setShowApiKey={setShowApiKey}
        webhookUrl={webhookUrl}
        handleSaveWhatsApp={handleSaveWhatsApp}
        handleConnectWhatsApp={handleConnectWhatsApp}
        handleDisconnectWhatsApp={handleDisconnectWhatsApp}
        handleClearFields={handleClearFields}
        copyWebhookUrl={copyWebhookUrl}
        statusInfo={statusInfo}
        StatusIcon={StatusIcon}
        disabled={false}
      />
    </div>
  );
}

interface IntegrationsContentProps {
  whatsappIntegration: any;
  updateWhatsAppIntegration: (data: any) => void;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
  webhookUrl: string;
  handleSaveWhatsApp: () => void;
  handleConnectWhatsApp: () => void;
  handleDisconnectWhatsApp: () => void;
  handleClearFields: () => void;
  copyWebhookUrl: () => void;
  statusInfo: any;
  StatusIcon: any;
  disabled: boolean;
}

function IntegrationsContent({
  whatsappIntegration,
  updateWhatsAppIntegration,
  showApiKey,
  setShowApiKey,
  webhookUrl,
  handleSaveWhatsApp,
  handleConnectWhatsApp,
  handleDisconnectWhatsApp,
  handleClearFields,
  copyWebhookUrl,
  statusInfo,
  StatusIcon,
  disabled
}: IntegrationsContentProps) {
  const otherIntegrations = [
    { name: "Instagram", icon: Instagram, description: "Integração com Instagram Direct" },
    { name: "Site/Widget", icon: Globe, description: "Widget de chat para seu site" },
    { name: "CRM HubSpot", icon: Users, description: "Sincronização com HubSpot" },
    { name: "CRM Pipedrive", icon: Users, description: "Sincronização com Pipedrive" }
  ];

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const FutureIntegrationModal = ({ integration }: { integration: any }) => {
    const Icon = integration.icon;
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            Em breve
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {integration.name}
            </DialogTitle>
            <DialogDescription>
              {integration.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Esta integração estará disponível em futuras atualizações do Automiza. 
              Acompanhe nossas novidades para ser notificado quando ela for lançada!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      {/* WhatsApp Business Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>WhatsApp Business</CardTitle>
            </div>
            <Badge 
              variant="outline" 
              className={`${statusInfo.color} ${statusInfo.border} ${statusInfo.bg}`}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <p className="text-blue-800 text-sm">
                {whatsappIntegration.status === 'connected' 
                  ? `WhatsApp Business conectado com sucesso! Conectado em ${whatsappIntegration.connectedAt?.toLocaleString('pt-BR') || 'data não disponível'}.`
                  : whatsappIntegration.status === 'configured'
                  ? "Dados salvos! Clique em 'Conectar WhatsApp' para finalizar a integração (simulado)."
                  : "Configure os dados do seu provedor WhatsApp Business oficial para conectar (simulação)."}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="provider">Provedor</Label>
                <InfoTooltip content="Selecione o provedor oficial que você utiliza (360Dialog, Zenvia, Gupshup, Twilio)." />
              </div>
              <Select 
                value={whatsappIntegration.provider} 
                onValueChange={(value) => updateWhatsAppIntegration({provider: value})}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="360dialog">360Dialog</SelectItem>
                  <SelectItem value="zenvia">Zenvia</SelectItem>
                  <SelectItem value="gupshup">Gupshup</SelectItem>
                  <SelectItem value="twilio">Twilio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="api-key">API Key / Token</Label>
                <InfoTooltip content="Chave de autenticação gerada pelo seu provedor." />
              </div>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  value={whatsappIntegration.apiKey}
                  onChange={(e) => updateWhatsAppIntegration({apiKey: e.target.value})}
                  placeholder="Insira sua API key"
                  disabled={disabled}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7 w-7 p-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                        disabled={disabled}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showApiKey ? "Ocultar" : "Mostrar"} API key
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="waba-id">WhatsApp Business Account ID (WABA ID)</Label>
                <InfoTooltip content="WhatsApp Business Account ID, fornecido pelo provedor oficial." />
              </div>
              <Input
                id="waba-id"
                value={whatsappIntegration.wabaId}
                onChange={(e) => updateWhatsAppIntegration({wabaId: e.target.value})}
                placeholder="123456789012345"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="phone-id">Phone Number ID</Label>
                <InfoTooltip content="Identificador único do número de telefone conectado ao WhatsApp Business." />
              </div>
              <Input
                id="phone-id"
                value={whatsappIntegration.phoneNumberId}
                onChange={(e) => updateWhatsAppIntegration({phoneNumberId: e.target.value})}
                placeholder="987654321098765"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <InfoTooltip content="Endereço onde os eventos e mensagens serão enviados pelo provedor." />
              </div>
              <div className="flex gap-2">
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  readOnly
                  className="bg-muted"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={copyWebhookUrl} disabled={disabled}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Copiar URL
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="verify-token">Verify Token</Label>
                <InfoTooltip content="Token secreto que você define para validar a conexão junto ao provedor." />
              </div>
              <Input
                id="verify-token"
                value={whatsappIntegration.verifyToken}
                onChange={(e) => updateWhatsAppIntegration({verifyToken: e.target.value})}
                placeholder="meu_token_secreto"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleSaveWhatsApp} disabled={disabled}>
              Salvar dados
            </Button>
            
            {whatsappIntegration.status === 'connected' ? (
              <Button variant="outline" onClick={handleDisconnectWhatsApp} disabled={disabled}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Desconectar WhatsApp
              </Button>
            ) : (
              <Button 
                onClick={handleConnectWhatsApp} 
                disabled={disabled || whatsappIntegration.status === 'disconnected'}
                variant={whatsappIntegration.status === 'configured' ? 'default' : 'outline'}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Conectar WhatsApp
              </Button>
            )}
            
            <Button variant="ghost" onClick={handleClearFields} disabled={disabled}>
              Limpar campos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other Integrations Section */}
      <Card>
        <CardHeader>
          <CardTitle>Outras integrações (futuro)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {otherIntegrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.name} className="border-muted">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-medium">{integration.name}</h4>
                      </div>
                      <Badge variant="outline" className="text-muted-foreground">
                        Em breve
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {integration.description}
                    </p>
                    <FutureIntegrationModal integration={integration} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
