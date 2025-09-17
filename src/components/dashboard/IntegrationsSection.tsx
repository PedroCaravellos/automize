import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Trash2,
  Building
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WhatsAppWizard from "./WhatsAppWizard";

interface WhatsAppIntegration {
  id: string;
  nome_empresa: string;
  documento: string;
  numero_whatsapp: string;
  business_manager_id?: string;
  status: string;
  is_active: boolean;
  created_at: string;
  observacoes?: string;
  phone_number_id?: string;
}

export default function IntegrationsSection() {
  const [integrations, setIntegrations] = useState<WhatsAppIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nomeEmpresa: "",
    documento: "",
    numeroWhatsapp: "",
    businessManagerId: ""
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('whatsapp_integrations')
        .insert({
          user_id: user.id,
          nome_empresa: formData.nomeEmpresa,
          documento: formData.documento,
          numero_whatsapp: formData.numeroWhatsapp,
          business_manager_id: formData.businessManagerId || null,
          status: 'pendente'
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de integração WhatsApp foi enviada com sucesso.",
      });

      setFormData({
        nomeEmpresa: "",
        documento: "",
        numeroWhatsapp: "",
        businessManagerId: ""
      });
      setShowWizard(false);
      fetchIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a integração. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Integração removida",
        description: "A integração WhatsApp foi removida com sucesso.",
      });

      fetchIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover a integração.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
    }

    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="border-yellow-400 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="border-blue-400 text-blue-700"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (showWizard) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Integrações</h2>
          <Button variant="outline" onClick={() => setShowWizard(false)}>
            Voltar
          </Button>
        </div>
        
        <WhatsAppWizard
          formData={formData}
          onFormDataChange={setFormData}
          onSave={handleSave}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Integrações</h2>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Integração WhatsApp
        </Button>
      </div>

      {integrations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Nenhuma integração configurada</h3>
                <p className="text-muted-foreground">
                  Conecte seu WhatsApp Business para começar a automatizar conversas
                </p>
              </div>
              <Button onClick={() => setShowWizard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Configurar WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {integration.nome_empresa}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(integration.status, integration.is_active)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(integration.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Documento</p>
                    <p className="font-mono text-sm">{integration.documento}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-mono text-sm">{integration.numero_whatsapp}</p>
                  </div>
                  
                  {integration.business_manager_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Business Manager</p>
                      <p className="font-mono text-sm">{integration.business_manager_id}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Solicitado em</p>
                    <p className="text-sm">{new Date(integration.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                {integration.observacoes && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Observações</p>
                      <p className="text-sm">{integration.observacoes}</p>
                    </div>
                  </>
                )}

                {integration.status === 'pendente' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-900">Aguardando processamento</p>
                        <p className="text-yellow-700">
                          Sua solicitação está sendo analisada pela nossa equipe.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {integration.is_active && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-900">WhatsApp ativo!</p>
                        <p className="text-green-700">
                          Sua integração está funcionando e você pode enviar mensagens.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}