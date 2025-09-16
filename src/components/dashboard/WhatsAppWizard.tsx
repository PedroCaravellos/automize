import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Globe,
  Key,
  Phone,
  Webhook
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppWizardProps {
  formData: {
    provider: string;
    apiKey: string;
    wabaId: string;
    phoneId: string;
  };
  onFormDataChange: (data: any) => void;
  onSave: () => void;
  loading: boolean;
  webhookUrl: string;
}

export default function WhatsAppWizard({ 
  formData, 
  onFormDataChange, 
  onSave, 
  loading,
  webhookUrl 
}: WhatsAppWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const steps = [
    {
      id: 'account',
      title: 'Criar conta 360Dialog',
      icon: Globe,
      description: 'Configure sua conta na plataforma 360Dialog'
    },
    {
      id: 'credentials',
      title: 'Obter credenciais',
      icon: Key,
      description: 'Colete API Key, WABA ID e Phone Number ID'
    },
    {
      id: 'webhook',
      title: 'Configurar webhook',
      icon: Webhook,
      description: 'Configure o webhook na 360Dialog'
    },
    {
      id: 'test',
      title: 'Testar conexão',
      icon: CheckCircle,
      description: 'Validar e ativar a integração'
    }
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  const isStepValid = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: return true; // Account creation step
      case 1: return formData.apiKey && formData.wabaId; // Credentials step
      case 2: return formData.apiKey && formData.wabaId && formData.phoneId; // Webhook step  
      case 3: return formData.apiKey && formData.wabaId && formData.phoneId; // Test step
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Globe className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Criar conta na 360Dialog</h3>
              <p className="text-muted-foreground mb-4">
                A 360Dialog é o provedor oficial que conecta seu WhatsApp Business à nossa plataforma.
              </p>
            </div>
            
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Acesse o site da 360Dialog</p>
                      <p className="text-sm text-muted-foreground">Crie uma conta gratuita para começar</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => window.open('https://hub.360dialog.com', '_blank')}
                      >
                        Abrir 360Dialog <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">Complete o processo de verificação</p>
                      <p className="text-sm text-muted-foreground">
                        Conecte seu número de WhatsApp Business e passe pela verificação do Facebook
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">Conta aprovada</p>
                      <p className="text-sm text-muted-foreground">
                        Após aprovação, você terá acesso ao painel com suas credenciais
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Dica importante</p>
                  <p className="text-blue-700">
                    O processo de aprovação pode levar de 1-3 dias úteis. 
                    Mantenha os dados da sua empresa organizados para agilizar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Key className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Obter suas credenciais</h3>
              <p className="text-muted-foreground mb-4">
                Colete as informações necessárias do seu painel 360Dialog
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Onde encontrar suas credenciais:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>API Key:</strong> Painel → API Keys → Gerar nova chave</li>
                      <li>• <strong>WABA ID:</strong> Painel → WhatsApp Business Account → ID</li>
                      <li>• <strong>Phone Number ID:</strong> Painel → Phone Numbers → Selecionar número</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>API Key 360Dialog *</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={formData.apiKey}
                    onChange={(e) => onFormDataChange({...formData, apiKey: e.target.value})}
                    placeholder="Cole sua API Key aqui"
                    className="pr-20"
                  />
                  <div className="absolute right-1 top-1 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>WABA ID *</Label>
                <Input
                  value={formData.wabaId}
                  onChange={(e) => onFormDataChange({...formData, wabaId: e.target.value})}
                  placeholder="123456789012345"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number ID</Label>
                <Input
                  value={formData.phoneId}
                  onChange={(e) => onFormDataChange({...formData, phoneId: e.target.value})}
                  placeholder="987654321098765"
                />
                <p className="text-xs text-muted-foreground">
                  Opcional agora, pode ser configurado depois
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Webhook className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configurar webhook</h3>
              <p className="text-muted-foreground mb-4">
                Configure o webhook para receber mensagens no WhatsApp
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Acesse configurações de webhook</p>
                      <p className="text-sm text-muted-foreground">
                        No painel 360Dialog: Settings → Webhooks
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">Configure a URL do webhook</p>
                      <div className="mt-2">
                        <Label className="text-xs">URL do Webhook:</Label>
                        <div className="flex gap-2 mt-1">
                          <Input 
                            value={webhookUrl} 
                            readOnly 
                            className="bg-background text-xs"
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => copyToClipboard(webhookUrl, "URL do webhook")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">Ativar eventos</p>
                      <p className="text-sm text-muted-foreground">
                        Marque: "messages" e "message_status" para receber notificações
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900">Importante</p>
                  <p className="text-yellow-700">
                    Certifique-se de que o Phone Number ID esteja preenchido antes de prosseguir, 
                    pois é necessário para o webhook funcionar corretamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Testar e ativar</h3>
              <p className="text-muted-foreground mb-4">
                Vamos testar sua configuração e ativar a integração
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Resumo da configuração:</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provedor:</span>
                      <span>360Dialog</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Key:</span>
                      <span className="font-mono">{formData.apiKey ? '••••••••' : 'Não configurado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WABA ID:</span>
                      <span className="font-mono">{formData.wabaId || 'Não configurado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone ID:</span>
                      <span className="font-mono">{formData.phoneId || 'Não configurado'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Pronto para conectar!</p>
                  <p className="text-green-700">
                    Clique em "Conectar WhatsApp" para ativar sua integração.
                    Você poderá começar a receber e enviar mensagens imediatamente.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={onSave} 
              disabled={loading || !isStepValid(3)}
              className="w-full"
              size="lg"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {loading ? "Conectando..." : "Conectar WhatsApp"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Assistente de Configuração WhatsApp
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step indicators */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep || (index === currentStep && isStepValid(index));
            
            return (
              <div 
                key={step.id} 
                className={`flex flex-col items-center text-center space-y-2 ${
                  isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  ${isActive ? 'border-primary bg-primary/10' : 
                    isCompleted ? 'border-green-600 bg-green-50' : 'border-muted'}
                `}>
                  <StepIcon className="h-4 w-4" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium">{step.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={!isStepValid(currentStep)}
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}