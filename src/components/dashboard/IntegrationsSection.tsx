import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Copy, MessageSquare, Zap, Clock, Info, CheckCircle, Circle, AlertCircle, Settings, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import WhatsAppWizard from "./WhatsAppWizard";
import ConnectionValidator from "./ConnectionValidator";

interface WhatsAppIntegration {
  id: string;
  provider: string;
  api_key: string;
  waba_id: string;
  phone_number_id: string;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function IntegrationsSection() {
  const { user, hasAccess, activateTrial, isHydrating } = useAuth();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsappIntegration, setWhatsappIntegration] = useState<WhatsAppIntegration | null>(null);
  const [activeTab, setActiveTab] = useState("wizard");
  
  // Estado local dos campos do formulário
  const [localFormData, setLocalFormData] = useState({
    provider: '360dialog',
    apiKey: '',
    wabaId: '',
    phoneId: ''
  });

  const webhookUrl = `https://ahcttlbvgjbdzhholyei.supabase.co/functions/v1/whatsapp-webhook`;

  // Carregar dados da integração WhatsApp
  useEffect(() => {
    if (user && hasAccess()) {
      loadWhatsAppIntegration();
    }
  }, [user, hasAccess]);

  const loadWhatsAppIntegration = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading WhatsApp integration:', error);
        return;
      }

      if (data) {
        setWhatsappIntegration(data);
        setLocalFormData({
          provider: data.provider,
          apiKey: data.api_key,
          wabaId: data.waba_id,
          phoneId: data.phone_number_id
        });
      }
    } catch (error) {
      console.error('Error loading WhatsApp integration:', error);
    }
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
      setIsActivating(false);
    }
  };

  const handleGoToPlans = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'plan');
    window.history.replaceState({}, '', url.toString());
  };

  const handleSaveData = async () => {
    if (!user) return;
    
    if (!localFormData.provider || !localFormData.apiKey || !localFormData.wabaId) {
      toast({
        title: "Dados incompletos",
        description: "Preencha pelo menos o provedor, API key e WABA ID.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      if (whatsappIntegration) {
        // Update existing integration
        const { error } = await supabase
          .from('whatsapp_integrations')
          .update({
            provider: localFormData.provider,
            api_key: localFormData.apiKey,
            waba_id: localFormData.wabaId,
            phone_number_id: localFormData.phoneId,
            webhook_url: webhookUrl,
            is_active: true
          })
          .eq('id', whatsappIntegration.id);

        if (error) throw error;
      } else {
        // Create new integration
        const { data, error } = await supabase
          .from('whatsapp_integrations')
          .insert({
            user_id: user.id,
            provider: localFormData.provider,
            api_key: localFormData.apiKey,
            waba_id: localFormData.wabaId,
            phone_number_id: localFormData.phoneId,
            webhook_url: webhookUrl,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        setWhatsappIntegration(data);
      }
      
      await loadWhatsAppIntegration();
      toast({
        title: "WhatsApp conectado!",
        description: "Integração com WhatsApp Business ativada com sucesso.",
      });
    } catch (error) {
      console.error('Error saving WhatsApp integration:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar WhatsApp Business. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!whatsappIntegration) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('whatsapp_integrations')
        .delete()
        .eq('id', whatsappIntegration.id);

      if (error) throw error;

      setWhatsappIntegration(null);
      setLocalFormData({
        provider: '360dialog',
        apiKey: '',
        wabaId: '',
        phoneId: ''
      });
      
      toast({
        title: "WhatsApp desconectado",
        description: "Integração com WhatsApp Business desativada.",
      });
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Erro ao desconectar WhatsApp Business. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFields = () => {
    setLocalFormData({
      provider: '360dialog',
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
    if (whatsappIntegration?.is_active) {
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
  const isConnected = whatsappIntegration?.is_active || false;

  // Conteúdo da seção de integrações
  const integrationsContent = (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Integração WhatsApp Business</h2>
          <p className="text-muted-foreground">
            Conecte seu WhatsApp Business via 360Dialog para automação de mensagens
          </p>
        </div>

        {isConnected ? (
          // Connected state - show status and management
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle>WhatsApp Conectado</CardTitle>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  WhatsApp Business conectado com sucesso! {whatsappIntegration?.created_at ? `Conectado em ${new Date(whatsappIntegration.created_at).toLocaleString('pt-BR')}.` : ''}
                </p>
                {whatsappIntegration && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p><strong>Provedor:</strong> {whatsappIntegration.provider}</p>
                    <p><strong>WABA ID:</strong> {whatsappIntegration.waba_id}</p>
                    <p><strong>Phone ID:</strong> {whatsappIntegration.phone_number_id}</p>
                  </div>
                )}
              </div>

              <Tabs defaultValue="manage" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manage">Gerenciar</TabsTrigger>
                  <TabsTrigger value="validate">Validar</TabsTrigger>
                </TabsList>
                <TabsContent value="manage" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>API Key 360Dialog</Label>
                      <div className="relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={localFormData.apiKey}
                          onChange={(e) => setLocalFormData(prev => ({...prev, apiKey: e.target.value}))}
                          placeholder="Sua API Key da 360Dialog"
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7 w-7 p-0"
                          onClick={() => setShowApiKey(!showApiKey)}
                          disabled={loading}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>WABA ID</Label>
                      <Input
                        value={localFormData.wabaId}
                        onChange={(e) => setLocalFormData(prev => ({...prev, wabaId: e.target.value}))}
                        placeholder="123456789012345"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number ID</Label>
                      <Input
                        value={localFormData.phoneId}
                        onChange={(e) => setLocalFormData(prev => ({...prev, phoneId: e.target.value}))}
                        placeholder="987654321098765"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input value={webhookUrl} readOnly className="bg-muted" />
                        <Button variant="outline" size="sm" onClick={copyWebhookUrl} disabled={loading}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <Button 
                      onClick={handleSaveData} 
                      disabled={loading || !localFormData.apiKey || !localFormData.wabaId}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {loading ? "Atualizando..." : "Atualizar Configuração"}
                    </Button>
                    <Button variant="destructive" onClick={handleDisconnectWhatsApp} disabled={loading}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {loading ? "Desconectando..." : "Desconectar WhatsApp"}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="validate">
                  <ConnectionValidator 
                    integration={{
                      api_key: localFormData.apiKey,
                      waba_id: localFormData.wabaId,
                      phone_number_id: localFormData.phoneId
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          // Not connected state - show wizard or manual config
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wizard">
                <BookOpen className="h-4 w-4 mr-2" />
                Assistente (Recomendado)
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Settings className="h-4 w-4 mr-2" />
                Configuração Manual
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="wizard">
              <WhatsAppWizard
                formData={localFormData}
                onFormDataChange={setLocalFormData}
                onSave={handleSaveData}
                loading={loading}
                webhookUrl={webhookUrl}
              />
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração Manual</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Para usuários experientes que já possuem uma conta 360Dialog configurada
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Provedor</Label>
                      <Select 
                        value={localFormData.provider} 
                        onValueChange={(value) => setLocalFormData(prev => ({...prev, provider: value}))}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um provedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="360dialog">360Dialog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>API Key 360Dialog</Label>
                      <div className="relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={localFormData.apiKey}
                          onChange={(e) => setLocalFormData(prev => ({...prev, apiKey: e.target.value}))}
                          placeholder="Sua API Key da 360Dialog"
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7 w-7 p-0"
                          onClick={() => setShowApiKey(!showApiKey)}
                          disabled={loading}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>WABA ID</Label>
                      <Input
                        value={localFormData.wabaId}
                        onChange={(e) => setLocalFormData(prev => ({...prev, wabaId: e.target.value}))}
                        placeholder="123456789012345"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number ID</Label>
                      <Input
                        value={localFormData.phoneId}
                        onChange={(e) => setLocalFormData(prev => ({...prev, phoneId: e.target.value}))}
                        placeholder="987654321098765"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input value={webhookUrl} readOnly className="bg-muted" />
                        <Button variant="outline" size="sm" onClick={copyWebhookUrl} disabled={loading}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <Button 
                      onClick={handleSaveData} 
                      disabled={loading || !localFormData.apiKey || !localFormData.wabaId}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {loading ? "Conectando..." : "Conectar WhatsApp"}
                    </Button>
                    <Button variant="outline" onClick={handleClearFields} disabled={loading}>
                      Limpar campos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
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
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">
            Conecte seu WhatsApp Business com integração real via 360Dialog.
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
          Conecte seu WhatsApp Business com integração real via 360Dialog.
        </p>
      </div>
      {integrationsContent}
    </div>
  );
}