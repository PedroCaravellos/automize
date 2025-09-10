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
import { Eye, EyeOff, Copy, MessageSquare, Instagram, Globe, Users, Zap, Clock, Info, CheckCircle, Circle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function IntegrationsSection() {
  const { hasAccess, activateTrial, isHydrating, subscription, simulateConnectWhatsApp, simulateDisconnectWhatsApp } = useAuth();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [formData, setFormData] = useState({
    provider: '',
    apiKey: '',
    wabaId: '',
    phoneId: '',
    verifyToken: ''
  });

  const whatsappIntegration = subscription.integrations?.whatsapp ?? { connected: false };
  const webhookUrl = `https://automiza.net/webhooks/whatsapp/user-id`;

  const handleActivateTrial = async () => {
    setIsActivating(true);
    try {
      await activateTrial();
      toast({
        title: "Trial ativado!",
        description: "Você tem 7 dias para explorar todas as funcionalidades.",
      });
    } catch (error) {
      setIsActivating(false);
    }
  };

  const handleGoToPlans = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'plan');
    window.history.replaceState({}, '', url.toString());
  };

  const handleConnectWhatsApp = () => {
    try {
      simulateConnectWhatsApp(formData);
      toast({
        title: "WhatsApp conectado!",
        description: "Integração com WhatsApp Business ativada (simulado).",
      });
    } catch (error) {
      toast({
        title: "Erro ao conectar",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectWhatsApp = () => {
    simulateDisconnectWhatsApp();
    setFormData({
      provider: '',
      apiKey: '',
      wabaId: '',
      phoneId: '',
      verifyToken: ''
    });
    toast({
      title: "WhatsApp desconectado",
      description: "Integração com WhatsApp Business desativada (simulado).",
    });
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada",
      description: "URL do webhook copiada para a área de transferência.",
    });
  };

  if (isHydrating) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-96 mx-auto" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-64" /></CardHeader>
          <CardContent><Skeleton className="h-32 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess()) {
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
                <Button onClick={handleActivateTrial} disabled={isActivating} className="w-full" size="lg">
                  <Clock className="mr-2 h-4 w-4" />
                  {isActivating ? "Ativando..." : "Ativar trial"}
                </Button>
                <Button variant="outline" onClick={handleGoToPlans} className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Ver planos
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="opacity-50 pointer-events-none">
            <IntegrationsContent />
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
      <IntegrationsContent />
    </div>
  );

  function IntegrationsContent() {
    const StatusIcon = whatsappIntegration.connected ? CheckCircle : Circle;
    const statusColor = whatsappIntegration.connected ? 'text-green-600' : 'text-red-600';
    const statusText = whatsappIntegration.connected ? 'Conectado' : 'Não conectado';

    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>WhatsApp Business</CardTitle>
              </div>
              <Badge variant="outline" className={statusColor}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusText}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {whatsappIntegration.connected ? (
              <>
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <p className="text-green-800 text-sm">
                      WhatsApp Business conectado com sucesso! 
                      {whatsappIntegration.connectedAt && ` Conectado em ${new Date(whatsappIntegration.connectedAt).toLocaleString('pt-BR')}.`}
                    </p>
                    <div className="mt-3 space-y-1 text-sm">
                      <p><strong>Provedor:</strong> {whatsappIntegration.provider}</p>
                      <p><strong>WABA ID:</strong> {whatsappIntegration.wabaId}</p>
                      <p><strong>Phone ID:</strong> {whatsappIntegration.phoneId}</p>
                    </div>
                  </CardContent>
                </Card>
                <Button variant="outline" onClick={handleDisconnectWhatsApp}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Desconectar WhatsApp
                </Button>
              </>
            ) : (
              <>
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <p className="text-blue-800 text-sm">
                      Configure os dados do seu provedor WhatsApp Business oficial para conectar (simulação).
                    </p>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Provedor</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent>Selecione o provedor oficial que você utiliza</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select value={formData.provider} onValueChange={(value) => setFormData(prev => ({...prev, provider: value}))}>
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
                      <Label>API Key</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent>Chave de autenticação gerada pelo seu provedor</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={formData.apiKey}
                        onChange={(e) => setFormData(prev => ({...prev, apiKey: e.target.value}))}
                        placeholder="Insira sua API key"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7 w-7 p-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>WABA ID</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent>WhatsApp Business Account ID, fornecido pelo provedor oficial</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      value={formData.wabaId}
                      onChange={(e) => setFormData(prev => ({...prev, wabaId: e.target.value}))}
                      placeholder="123456789012345"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Phone Number ID</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent>Identificador único do número de telefone conectado ao WhatsApp Business</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      value={formData.phoneId}
                      onChange={(e) => setFormData(prev => ({...prev, phoneId: e.target.value}))}
                      placeholder="987654321098765"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Webhook URL</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent>Endereço onde os eventos e mensagens serão enviados pelo provedor</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex gap-2">
                      <Input value={webhookUrl} readOnly className="bg-muted" />
                      <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Verify Token</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent>Token secreto que você define para validar a conexão junto ao provedor</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      value={formData.verifyToken}
                      onChange={(e) => setFormData(prev => ({...prev, verifyToken: e.target.value}))}
                      placeholder="meu_token_secreto"
                    />
                  </div>
                </div>

                <Button onClick={handleConnectWhatsApp}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Conectar WhatsApp
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outras integrações (futuro)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: "Instagram", icon: Instagram, description: "Integração com Instagram Direct" },
                { name: "Site/Widget", icon: Globe, description: "Widget de chat para seu site" },
                { name: "CRM HubSpot", icon: Users, description: "Sincronização com HubSpot" },
                { name: "CRM Pipedrive", icon: Users, description: "Sincronização com Pipedrive" }
              ].map((integration) => {
                const Icon = integration.icon;
                return (
                  <Card key={integration.name} className="border-muted">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-medium">{integration.name}</h4>
                        </div>
                        <Badge variant="outline" className="text-muted-foreground">Em breve</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">Em breve</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Icon className="h-5 w-5" />
                              {integration.name}
                            </DialogTitle>
                            <DialogDescription>{integration.description}</DialogDescription>
                          </DialogHeader>
                          <p className="text-sm text-muted-foreground">
                            Esta integração estará disponível em futuras atualizações do Automiza.
                          </p>
                        </DialogContent>
                      </Dialog>
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
}