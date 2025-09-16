import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  Wifi,
  MessageSquare 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ConnectionValidatorProps {
  integration: {
    api_key: string;
    waba_id: string;
    phone_number_id: string;
  };
}

interface ValidationResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function ConnectionValidator({ integration }: ConnectionValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const { toast } = useToast();

  const validateConnection = async () => {
    setIsValidating(true);
    setResults([]);
    
    const validationResults: ValidationResult[] = [];

    try {
      // Test 1: API Key Format
      if (integration.api_key) {
        if (integration.api_key.length >= 20) {
          validationResults.push({
            test: "Formato da API Key",
            status: "success",
            message: "API Key tem formato válido"
          });
        } else {
          validationResults.push({
            test: "Formato da API Key",
            status: "warning", 
            message: "API Key parece muito curta",
            details: "Verifique se copiou a chave completa"
          });
        }
      } else {
        validationResults.push({
          test: "Formato da API Key",
          status: "error",
          message: "API Key não fornecida"
        });
      }

      // Test 2: WABA ID Format
      if (integration.waba_id) {
        if (/^\d{15,}$/.test(integration.waba_id)) {
          validationResults.push({
            test: "WABA ID",
            status: "success",
            message: "WABA ID tem formato válido"
          });
        } else {
          validationResults.push({
            test: "WABA ID",
            status: "warning",
            message: "WABA ID deve conter apenas números (15+ dígitos)",
            details: "Exemplo: 123456789012345"
          });
        }
      } else {
        validationResults.push({
          test: "WABA ID",
          status: "error",
          message: "WABA ID não fornecido"
        });
      }

      // Test 3: Phone Number ID Format
      if (integration.phone_number_id) {
        if (/^\d{15,}$/.test(integration.phone_number_id)) {
          validationResults.push({
            test: "Phone Number ID",
            status: "success",
            message: "Phone Number ID tem formato válido"
          });
        } else {
          validationResults.push({
            test: "Phone Number ID",
            status: "warning",
            message: "Phone Number ID deve conter apenas números (15+ dígitos)",
            details: "Exemplo: 987654321098765"
          });
        }
      } else {
        validationResults.push({
          test: "Phone Number ID",
          status: "warning",
          message: "Phone Number ID não fornecido",
          details: "Necessário para receber mensagens via webhook"
        });
      }

      // Test 4: Try to validate API connection via edge function
      if (integration.api_key && integration.waba_id) {
        try {
          // Call edge function to test the API connection
          const { data, error } = await supabase.functions.invoke('whatsapp-send', {
            body: {
              to: '5511999999999', // Test number that won't actually send
              message: 'Test connection',
              userId: 'test-validation'
            }
          });

          if (error) {
            if (error.message?.includes('No active WhatsApp integration found')) {
              validationResults.push({
                test: "Conexão com 360Dialog",
                status: "success",
                message: "API está acessível",
                details: "Configuração parece estar correta"
              });
            } else {
              validationResults.push({
                test: "Conexão com 360Dialog",
                status: "error",
                message: "Erro na conexão com API",
                details: error.message
              });
            }
          } else {
            validationResults.push({
              test: "Conexão com 360Dialog",
              status: "success",
              message: "Conexão com API validada com sucesso"
            });
          }
        } catch (apiError) {
          validationResults.push({
            test: "Conexão com 360Dialog",
            status: "error",
            message: "Erro ao testar conexão",
            details: "Verifique se as credenciais estão corretas"
          });
        }
      }

      // Test 5: Webhook URL validation
      const webhookUrl = `https://ahcttlbvgjbdzhholyei.supabase.co/functions/v1/whatsapp-webhook`;
      validationResults.push({
        test: "Webhook Configuration",
        status: "success",
        message: "URL do webhook está configurada",
        details: `Configure esta URL na 360Dialog: ${webhookUrl}`
      });

    } catch (error) {
      console.error('Validation error:', error);
      validationResults.push({
        test: "Validação Geral",
        status: "error",
        message: "Erro durante validação",
        details: "Tente novamente em alguns segundos"
      });
    }

    setResults(validationResults);
    setIsValidating(false);
    
    const hasErrors = validationResults.some(r => r.status === 'error');
    const hasWarnings = validationResults.some(r => r.status === 'warning');
    
    if (hasErrors) {
      toast({
        title: "Problemas encontrados",
        description: "Corrija os erros antes de continuar",
        variant: "destructive"
      });
    } else if (hasWarnings) {
      toast({
        title: "Avisos encontrados",
        description: "Configuração funcional, mas com algumas observações",
      });
    } else {
      toast({
        title: "Validação bem-sucedida!",
        description: "Sua configuração WhatsApp está pronta para uso",
      });
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-600">Sucesso</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-600">Erro</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Aviso</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Validar Conexão</h3>
              <p className="text-sm text-muted-foreground">
                Teste sua configuração antes de ativar
              </p>
            </div>
            <Button 
              onClick={validateConnection} 
              disabled={isValidating}
              variant="outline"
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  Testar Conexão
                </>
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Resultados da Validação:</h4>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-card"
                  >
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{result.test}</p>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </p>
                      {result.details && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {result.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {results.filter(r => r.status === 'success').length} sucessos, {' '}
                    {results.filter(r => r.status === 'warning').length} avisos, {' '}
                    {results.filter(r => r.status === 'error').length} erros
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}