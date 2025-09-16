import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, Copy, MessageSquare, Zap, Clock, Info, CheckCircle, Circle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function IntegrationsSection() {
  const { hasAccess, activateTrial, isHydrating, subscription, simulateConnectWhatsApp, simulateDisconnectWhatsApp } = useAuth();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  // Estado local dos campos do formulário - apenas campos essenciais
  const [localFormData, setLocalFormData] = useState({
    provider: '',
    apiKey: '',
    wabaId: '',
    phoneId: ''
  });

  const whatsappIntegration = subscription.integrations?.whatsapp ?? { connected: false };
  const webhookUrl = `https://automiza.net/webhooks/whatsapp/user-id`;

  // Inicializar campos locais com dados salvos apenas uma vez
  useEffect(() => {
    if (whatsappIntegration.connected && whatsappIntegration.provider) {
      setLocalFormData({
        provider: whatsappIntegration.provider || '',
        apiKey: whatsappIntegration.apiKey || '',
        wabaId: whatsappIntegration.wabaId || '',
        phoneId: whatsappIntegration.phoneId || ''
      });
    }
  }, []); // Empty dependency array - load only once on mount

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

  const handleSaveData = () => {
    if (!localFormData.provider || !localFormData.apiKey || !localFormData.wabaId) {
      toast({
        title: "Dados incompletos",
        description: "Preencha pelo menos o provedor, API key e WABA ID.",
        variant: "destructive",
      });
      return;
    }
    
    simulateConnectWhatsApp(localFormData);
    toast({
      title: "WhatsApp conectado!",
      description: "Integração com WhatsApp Business ativada (simulado).",
    });
  };

  const handleDisconnectWhatsApp = () => {
    simulateDisconnectWhatsApp();
    toast({
      title: "WhatsApp desconectado",
      description: "Integração com WhatsApp Business desativada (simulado).",
    });
  };

  const handleClearFields = () => {
    setLocalFormData({
      provider: '',
      apiKey: '',
      wabaId: '',
      phoneId: ''
    });
    toast({
      title: "Campos limpos",
      description: "Formulário foi resetado.",
    });
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada",
      description: "URL do webhook copiada para a área de transferência.",
    });
  };

  // Determinar status baseado no estado e dados preenchidos
  const getStatusInfo = () => {
    if (whatsappIntegration.connected) {
      return { 
        icon: CheckCircle, 
        color: 'text-green-600', 
        bg: 'bg-green-50', 
        border: 'border-green-200', 
        text: 'Conectado' 
      };
    }
    
    const hasAnyData = localFormData.provider || localFormData.apiKey || localFormData.wabaId;
    if (hasAnyData) {
      return { 
        icon: AlertCircle, 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-200', 
        text: 'Em configuração' 
      };
    }
    
    return { 
      icon: Circle, 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-200', 
      text: 'Não conectado' 
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Conteúdo da seção de integrações (inline para evitar remount e perda de foco)
  const integrationsContent = (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>WhatsApp Business</CardTitle>
            </div>
            <Badge variant="outline" className={`${statusInfo.color} ${statusInfo.border} ${statusInfo.bg}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Card */}
          <Card className={`${statusInfo.border} ${statusInfo.bg}`}>
            <CardContent className="pt-4">
              <p className={`${statusInfo.color.replace('text-', 'text-')} text-sm`}>
                {whatsappIntegration.connected 
                  ? `WhatsApp Business conectado com sucesso! ${whatsappIntegration.connectedAt ? `Conectado em ${new Date(whatsappIntegration.connectedAt).toLocaleString('pt-BR')}.` : ''}`
                  : (localFormData.provider || localFormData.apiKey || localFormData.wabaId)
                  ? "Preencha os dados e clique em 'Salvar dados' para conectar (simulação)."
                  : "Configure os dados do seu provedor WhatsApp Business oficial para conectar (simulação)."
                }
              </p>
              {whatsappIntegration.connected && (
                <div className="mt-3 space-y-1 text-sm">
                  <p><strong>Provedor:</strong> {whatsappIntegration.provider}</p>
                  <p><strong>WABA ID:</strong> {whatsappIntegration.wabaId}</p>
                  <p><strong>Phone ID:</strong> {whatsappIntegration.phoneId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário sempre visível */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Provedor</Label>
                {/* Tooltip inline */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm z-50">
                      <p>Selecione o provedor oficial que você utiliza (360Dialog, Zenvia, Gupshup, Twilio).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select 
                value={localFormData.provider} 
                onValueChange={(value) => setLocalFormData(prev => ({...prev, provider: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um provedor" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
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
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm z-50">
                      <p>Chave de autenticação gerada pelo seu provedor.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={localFormData.apiKey}
                  onChange={(e) => setLocalFormData(prev => ({...prev, apiKey: e.target.value}))}
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
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm z-50">
                      <p>WhatsApp Business Account ID, fornecido pelo provedor oficial.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                value={localFormData.wabaId}
                onChange={(e) => setLocalFormData(prev => ({...prev, wabaId: e.target.value}))}
                placeholder="123456789012345"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Phone Number ID</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm z-50">
                      <p>Identificador único do número de telefone conectado ao WhatsApp Business.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                value={localFormData.phoneId}
                onChange={(e) => setLocalFormData(prev => ({...prev, phoneId: e.target.value}))}
                placeholder="987654321098765"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Webhook URL</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm z-50">
                      <p>Endereço onde os eventos e mensagens serão enviados pelo provedor.</p>
                    </TooltipContent>
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
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 flex-wrap">
            {!whatsappIntegration.connected ? (
              <>
                <Button onClick={handleSaveData}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Salvar dados
                </Button>
                <Button variant="outline" onClick={handleClearFields}>
                  Limpar campos
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleDisconnectWhatsApp}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Desconectar WhatsApp
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
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
    console.log('DEBUG: hasAccess() returned false. subscription:', subscription);
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
            {integrationsContent}
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
      {integrationsContent}
    </div>
  );

}
