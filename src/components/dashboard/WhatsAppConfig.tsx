import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, CheckCircle2, XCircle, Send, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface WhatsAppConfigProps {
  onSuccess?: () => void;
}

export const WhatsAppConfig = ({ onSuccess }: WhatsAppConfigProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [integration, setIntegration] = useState<any>(null);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Olá! Esta é uma mensagem de teste do sistema.");

  const [formData, setFormData] = useState({
    nome_empresa: "",
    documento: "",
    numero_whatsapp: "",
  });

  useEffect(() => {
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("whatsapp_integrations")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setIntegration(data);
        setFormData({
          nome_empresa: data.nome_empresa,
          documento: data.documento,
          numero_whatsapp: data.numero_whatsapp,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar integração:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const integrationData = {
        user_id: session.user.id,
        nome_empresa: formData.nome_empresa,
        documento: formData.documento,
        numero_whatsapp: formData.numero_whatsapp,
        status: "pendente",
      };

      if (integration) {
        const { error } = await supabase
          .from("whatsapp_integrations")
          .update(integrationData)
          .eq("id", integration.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("whatsapp_integrations")
          .insert(integrationData);

        if (error) throw error;
      }

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de integração foi enviada. Entraremos em contato em breve.",
      });

      await fetchIntegration();
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a integração.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestMessage = async () => {
    if (!testPhone || !testMessage) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o número e a mensagem de teste.",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-send", {
        body: {
          to: testPhone,
          message: testMessage,
        },
      });

      if (error) throw error;

      toast({
        title: "Mensagem enviada!",
        description: "A mensagem de teste foi enviada com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar a mensagem de teste.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = () => {
    if (!integration) return null;

    switch (integration.status) {
      case "ativo":
        return (
          <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        );
      case "pendente":
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pendente Aprovação
          </Badge>
        );
      case "rejeitado":
        return (
          <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-600">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">WhatsApp Business API</h3>
              <p className="text-sm text-muted-foreground">
                Conecte seu número oficial do WhatsApp Business
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_empresa">Nome da Empresa</Label>
            <Input
              id="nome_empresa"
              value={formData.nome_empresa}
              onChange={(e) =>
                setFormData({ ...formData, nome_empresa: e.target.value })
              }
              placeholder="Minha Academia Ltda"
              required
            />
          </div>

          <div>
            <Label htmlFor="documento">CNPJ</Label>
            <Input
              id="documento"
              value={formData.documento}
              onChange={(e) =>
                setFormData({ ...formData, documento: e.target.value })
              }
              placeholder="00.000.000/0000-00"
              required
            />
          </div>

          <div>
            <Label htmlFor="numero_whatsapp">Número do WhatsApp</Label>
            <Input
              id="numero_whatsapp"
              value={formData.numero_whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, numero_whatsapp: e.target.value })
              }
              placeholder="+55 11 98765-4321"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Número com código do país (exemplo: +55 11 98765-4321)
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando..." : integration ? "Atualizar Dados" : "Solicitar Integração"}
          </Button>
        </form>

        {integration?.observacoes && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Observações:</p>
            <p className="text-sm text-muted-foreground">{integration.observacoes}</p>
          </div>
        )}
      </Card>

      {integration?.status === "ativo" && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Send className="h-5 w-5" />
            Testar Envio de Mensagem
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="test_phone">Número de Teste</Label>
              <Input
                id="test_phone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+55 11 98765-4321"
              />
            </div>

            <div>
              <Label htmlFor="test_message">Mensagem</Label>
              <Textarea
                id="test_message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Digite a mensagem de teste"
                rows={4}
              />
            </div>

            <Button
              onClick={handleTestMessage}
              disabled={testing}
              className="w-full"
            >
              {testing ? "Enviando..." : "Enviar Mensagem de Teste"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
