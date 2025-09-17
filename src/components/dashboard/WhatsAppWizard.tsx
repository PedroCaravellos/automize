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
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Building,
  FileText,
  Phone,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppWizardProps {
  formData: {
    nomeEmpresa: string;
    documento: string;
    numeroWhatsapp: string;
    businessManagerId: string;
  };
  onFormDataChange: (data: any) => void;
  onSave: () => void;
  loading: boolean;
}

export default function WhatsAppWizard({ 
  formData, 
  onFormDataChange, 
  onSave, 
  loading 
}: WhatsAppWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const steps = [
    {
      id: 'empresa',
      title: 'Dados da Empresa',
      icon: Building,
      description: 'Informações básicas da sua empresa'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Business',
      icon: Phone,
      description: 'Número e Business Manager'
    },
    {
      id: 'review',
      title: 'Revisar e Solicitar',
      icon: CheckCircle,
      description: 'Confirmar dados e solicitar integração'
    }
  ];

  const isStepValid = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: return formData.nomeEmpresa && formData.documento;
      case 1: return formData.numeroWhatsapp;
      case 2: return formData.nomeEmpresa && formData.documento && formData.numeroWhatsapp;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Building className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Dados da sua empresa</h3>
              <p className="text-muted-foreground mb-4">
                Precisamos de algumas informações básicas para criar sua integração WhatsApp
              </p>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Nome da Empresa *</Label>
                <Input
                  value={formData.nomeEmpresa}
                  onChange={(e) => onFormDataChange({...formData, nomeEmpresa: e.target.value})}
                  placeholder="Ex: Minha Empresa LTDA"
                />
              </div>

              <div className="space-y-2">
                <Label>CNPJ/CPF *</Label>
                <Input
                  value={formData.documento}
                  onChange={(e) => onFormDataChange({...formData, documento: e.target.value})}
                  placeholder="00.000.000/0000-00 ou 000.000.000-00"
                />
                <p className="text-xs text-muted-foreground">
                  Documento oficial da empresa ou pessoa física
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Por que precisamos dessas informações?</p>
                  <p className="text-blue-700">
                    Estes dados são necessários para registrar sua empresa junto ao Facebook Business Manager 
                    e ativar o WhatsApp Business API oficialmente.
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
              <Phone className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">WhatsApp Business</h3>
              <p className="text-muted-foreground mb-4">
                Informe o número e dados do Business Manager
              </p>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Número do WhatsApp *</Label>
                <Input
                  value={formData.numeroWhatsapp}
                  onChange={(e) => onFormDataChange({...formData, numeroWhatsapp: e.target.value})}
                  placeholder="+5511999999999"
                />
                <p className="text-xs text-muted-foreground">
                  Número que será integrado ao sistema (incluir código do país)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Business Manager ID</Label>
                <Input
                  value={formData.businessManagerId}
                  onChange={(e) => onFormDataChange({...formData, businessManagerId: e.target.value})}
                  placeholder="123456789012345"
                />
                <p className="text-xs text-muted-foreground">
                  ID do Business Manager do Facebook (opcional, pode ajudar na aprovação)
                </p>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Como encontrar o Business Manager ID:</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>1. Acesse business.facebook.com</p>
                    <p>2. Vá em Configurações do Business</p>
                    <p>3. O ID aparece no canto superior direito</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Revisar e solicitar integração</h3>
              <p className="text-muted-foreground mb-4">
                Confira os dados e solicite a integração
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Resumo dos dados:</h4>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Empresa:</span>
                      <span className="font-medium">{formData.nomeEmpresa || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Documento:</span>
                      <span className="font-mono">{formData.documento || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WhatsApp:</span>
                      <span className="font-mono">{formData.numeroWhatsapp || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business Manager:</span>
                      <span className="font-mono">{formData.businessManagerId || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">O que acontece após a solicitação?</p>
                  <div className="space-y-1 text-blue-700">
                    <p>• Nosso time irá processar sua solicitação</p>
                    <p>• Registraremos sua empresa no WhatsApp Business API</p>
                    <p>• Você receberá uma notificação quando estiver pronto</p>
                    <p>• Tempo estimado: 2-5 dias úteis</p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={onSave} 
              disabled={loading || !isStepValid(2)}
              className="w-full"
              size="lg"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {loading ? "Enviando solicitação..." : "Solicitar Integração WhatsApp"}
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
          Integração WhatsApp Business
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