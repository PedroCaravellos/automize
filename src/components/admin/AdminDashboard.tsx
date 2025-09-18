import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, Users, Smartphone, TrendingUp } from "lucide-react";

interface WhatsAppIntegration {
  id: string;
  user_id: string;
  nome_empresa: string;
  documento: string;
  numero_whatsapp: string;
  business_manager_id?: string;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  activated_at?: string;
  profiles?: {
    nome: string;
    email: string;
  } | null;
}

export default function AdminDashboard() {
  const [integrations, setIntegrations] = useState<WhatsAppIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<WhatsAppIntegration | null>(null);
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      // Buscar integrações
      const { data: integrationsData, error: integrationsError } = await supabase
        .from("whatsapp_integrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (integrationsError) throw integrationsError;

      if (!integrationsData || integrationsData.length === 0) {
        setIntegrations([]);
        return;
      }

      // Buscar profiles dos usuários
      const userIds = [...new Set(integrationsData.map(i => i.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, nome, email")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Combinar dados
      const integrationsWithProfiles = integrationsData.map(integration => ({
        ...integration,
        profiles: profilesData?.find(p => p.user_id === integration.user_id) || null
      }));

      setIntegrations(integrationsWithProfiles);
    } catch (error) {
      console.error("Erro ao carregar integrações:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar integrações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIntegrationStatus = async (id: string, status: string, phoneId?: string) => {
    setActionLoading(true);
    try {
      const updateData: any = {
        status,
        observacoes,
        updated_at: new Date().toISOString(),
      };

      if (status === "aprovado") {
        updateData.approved_at = new Date().toISOString();
      }

      if (status === "ativo" && phoneId) {
        updateData.phone_number_id = phoneId;
        updateData.is_active = true;
        updateData.activated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("whatsapp_integrations")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Status atualizado para: ${status}`,
      });

      await fetchIntegrations();
      setSelectedIntegration(null);
      setPhoneNumberId("");
      setObservacoes("");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      aprovado: { label: "Aprovado", variant: "default" as const, icon: CheckCircle },
      ativo: { label: "Ativo", variant: "default" as const, icon: CheckCircle },
      rejeitado: { label: "Rejeitado", variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total: integrations.length,
    pendentes: integrations.filter(i => i.status === "pendente").length,
    ativas: integrations.filter(i => i.status === "ativo").length,
    aprovadas: integrations.filter(i => i.status === "aprovado").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie integrações WhatsApp Business</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Aprovadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.aprovadas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.ativas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Integrações */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes ({stats.pendentes})</TabsTrigger>
            <TabsTrigger value="aprovado">Aprovadas ({stats.aprovadas})</TabsTrigger>
            <TabsTrigger value="ativo">Ativas ({stats.ativas})</TabsTrigger>
          </TabsList>

          {["all", "pendente", "aprovado", "ativo"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="grid gap-4">
                {integrations
                  .filter(integration => tab === "all" || integration.status === tab)
                  .map((integration) => (
                    <Card key={integration.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{integration.nome_empresa}</CardTitle>
                            <CardDescription>
                              {integration.profiles?.nome} • {integration.profiles?.email}
                            </CardDescription>
                          </div>
                          {getStatusBadge(integration.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Documento</Label>
                            <p className="font-medium">{integration.documento}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                            <p className="font-medium">{integration.numero_whatsapp}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Business Manager</Label>
                            <p className="font-medium">{integration.business_manager_id || "N/A"}</p>
                          </div>
                        </div>
                        
                        {integration.observacoes && (
                          <div className="mb-4">
                            <Label className="text-xs text-muted-foreground">Observações</Label>
                            <p className="text-sm">{integration.observacoes}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedIntegration(integration)}
                              >
                                Gerenciar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Gerenciar Integração</DialogTitle>
                                <DialogDescription>
                                  {integration.nome_empresa} • {integration.numero_whatsapp}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="observacoes">Observações</Label>
                                  <Textarea
                                    id="observacoes"
                                    placeholder="Adicione observações sobre esta integração..."
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                  />
                                </div>

                                {(integration.status === "aprovado") && (
                                  <div>
                                    <Label htmlFor="phone-id">Phone Number ID (360Dialog)</Label>
                                    <Input
                                      id="phone-id"
                                      placeholder="Ex: 1234567890123456"
                                      value={phoneNumberId}
                                      onChange={(e) => setPhoneNumberId(e.target.value)}
                                    />
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  {integration.status === "pendente" && (
                                    <>
                                      <Button
                                        onClick={() => updateIntegrationStatus(integration.id, "aprovado")}
                                        disabled={actionLoading}
                                        className="flex-1"
                                      >
                                        Aprovar
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => updateIntegrationStatus(integration.id, "rejeitado")}
                                        disabled={actionLoading}
                                        className="flex-1"
                                      >
                                        Rejeitar
                                      </Button>
                                    </>
                                  )}

                                  {integration.status === "aprovado" && (
                                    <Button
                                      onClick={() => updateIntegrationStatus(integration.id, "ativo", phoneNumberId)}
                                      disabled={actionLoading || !phoneNumberId}
                                      className="flex-1"
                                    >
                                      Ativar
                                    </Button>
                                  )}

                                  {integration.status === "ativo" && (
                                    <Button
                                      variant="outline"
                                      onClick={() => updateIntegrationStatus(integration.id, "aprovado")}
                                      disabled={actionLoading}
                                      className="flex-1"
                                    >
                                      Desativar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <span className="text-xs text-muted-foreground">
                            Criado em {new Date(integration.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}