import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, Copy, MessageSquare, Instagram, Globe, Users, Zap, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppData {
  provider: string;
  apiKey: string;
  wabaId: string;
  phoneNumberId: string;
  verifyToken: string;
}

export default function IntegrationsSection() {
  const { profile, hasAccess, activateTrial } = useAuth();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [whatsappData, setWhatsappData] = useState<WhatsAppData>({
    provider: "",
    apiKey: "",
    wabaId: "",
    phoneNumberId: "",
    verifyToken: ""
  });

  const webhookUrl = `https://automiza.net/webhooks/whatsapp/${profile?.user_id || 'user-id'}`;

  const handleSaveWhatsAppData = () => {
    // Salvar localmente - sem integração real
    localStorage.setItem('automiza_whatsapp_data', JSON.stringify(whatsappData));
    toast({
      title: "Dados salvos",
      description: "Configurações do WhatsApp salvas localmente.",
    });
  };

  const handleClearFields = () => {
    setWhatsappData({
      provider: "",
      apiKey: "",
      wabaId: "",
      phoneNumberId: "",
      verifyToken: ""
    });
    localStorage.removeItem('automiza_whatsapp_data');
    toast({
      title: "Campos limpos",
      description: "Dados do WhatsApp foram removidos.",
    });
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada",
      description: "URL do webhook copiada para a área de transferência.",
    });
  };

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
    window.location.href = "/#planos";
  };

  // Verificar se tem acesso
  const accessAllowed = hasAccess();

  // Carregar dados salvos
  useState(() => {
    const savedData = localStorage.getItem('automiza_whatsapp_data');
    if (savedData) {
      setWhatsappData(JSON.parse(savedData));
    }
  });

  if (!accessAllowed) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">
            Conecte suas ferramentas. Integrações reais serão liberadas em breve.
          </p>
        </div>

        <div className="relative">
          {/* Overlay de bloqueio */}
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

          {/* Conteúdo borrado por baixo */}
          <div className="opacity-50 pointer-events-none">
            <IntegrationsContent 
              whatsappData={whatsappData}
              setWhatsappData={setWhatsappData}
              showApiKey={showApiKey}
              setShowApiKey={setShowApiKey}
              webhookUrl={webhookUrl}
              handleSaveWhatsAppData={handleSaveWhatsAppData}
              handleClearFields={handleClearFields}
              copyWebhookUrl={copyWebhookUrl}
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
        whatsappData={whatsappData}
        setWhatsappData={setWhatsappData}
        showApiKey={showApiKey}
        setShowApiKey={setShowApiKey}
        webhookUrl={webhookUrl}
        handleSaveWhatsAppData={handleSaveWhatsAppData}
        handleClearFields={handleClearFields}
        copyWebhookUrl={copyWebhookUrl}
        disabled={false}
      />
    </div>
  );
}

interface IntegrationsContentProps {
  whatsappData: WhatsAppData;
  setWhatsappData: (data: WhatsAppData) => void;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
  webhookUrl: string;
  handleSaveWhatsAppData: () => void;
  handleClearFields: () => void;
  copyWebhookUrl: () => void;
  disabled: boolean;
}

function IntegrationsContent({
  whatsappData,
  setWhatsappData,
  showApiKey,
  setShowApiKey,
  webhookUrl,
  handleSaveWhatsAppData,
  handleClearFields,
  copyWebhookUrl,
  disabled
}: IntegrationsContentProps) {
  const otherIntegrations = [
    { name: "Instagram", icon: Instagram, description: "Integração com Instagram Direct" },
    { name: "Site/Widget", icon: Globe, description: "Widget de chat para seu site" },
    { name: "CRM HubSpot", icon: Users, description: "Sincronização com HubSpot" },
    { name: "CRM Pipedrive", icon: Users, description: "Sincronização com Pipedrive" }
  ];

  return (
    <>
      {/* WhatsApp Business Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>WhatsApp Business (em breve)</CardTitle>
            </div>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Em desenvolvimento
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <p className="text-blue-800 text-sm">
                Na próxima etapa você poderá conectar seu número oficial do WhatsApp Business via provedor parceiro.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider">Provedor</Label>
              <Select 
                value={whatsappData.provider} 
                onValueChange={(value) => setWhatsappData({...whatsappData, provider: value})}
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
              <Label htmlFor="api-key">API Key / Token</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  value={whatsappData.apiKey}
                  onChange={(e) => setWhatsappData({...whatsappData, apiKey: e.target.value})}
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
              <Label htmlFor="waba-id">WhatsApp Business Account ID (WABA ID)</Label>
              <Input
                id="waba-id"
                value={whatsappData.wabaId}
                onChange={(e) => setWhatsappData({...whatsappData, wabaId: e.target.value})}
                placeholder="123456789012345"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-id">Phone Number ID</Label>
              <Input
                id="phone-id"
                value={whatsappData.phoneNumberId}
                onChange={(e) => setWhatsappData({...whatsappData, phoneNumberId: e.target.value})}
                placeholder="987654321098765"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
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
              <Label htmlFor="verify-token">Verify Token</Label>
              <Input
                id="verify-token"
                value={whatsappData.verifyToken}
                onChange={(e) => setWhatsappData({...whatsappData, verifyToken: e.target.value})}
                placeholder="meu_token_secreto"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveWhatsAppData} disabled={disabled}>
              Salvar dados
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" disabled={true}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Conectar WhatsApp
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Integração disponível em breve
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" disabled={true}>
              Desconectar
            </Button>
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
                    <Button variant="outline" size="sm" disabled className="w-full">
                      Em breve
                    </Button>
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
