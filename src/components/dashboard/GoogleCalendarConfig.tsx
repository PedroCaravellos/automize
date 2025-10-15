import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const GoogleCalendarConfig = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [calendarId, setCalendarId] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Simulação de conexão OAuth2
      // Em produção, isso redirecionaria para o fluxo OAuth do Google
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setConnected(true);
      setCalendarId("primary");
      
      toast({
        title: "Conectado com sucesso!",
        description: "Seu Google Calendar foi conectado.",
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao Google Calendar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setCalendarId("");
    toast({
      title: "Desconectado",
      description: "Sua conta do Google Calendar foi desconectada.",
    });
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Sincronização completa!",
        description: "Agendamentos sincronizados com o Google Calendar.",
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-600">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Google Calendar</h3>
              <p className="text-sm text-muted-foreground">
                Sincronize seus agendamentos automaticamente
              </p>
            </div>
          </div>
          {connected ? (
            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Desconectado
            </Badge>
          )}
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta é uma demonstração da integração. Em produção, seria necessário configurar
            as credenciais OAuth2 do Google Cloud Console.
          </AlertDescription>
        </Alert>

        {!connected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Recursos da Integração:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Sincronização bidirecional de eventos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Lembretes automáticos por email
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Bloqueio de horários ocupados
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Compartilhamento de calendário com equipe
                </li>
              </ul>
            </div>

            <Button onClick={handleConnect} disabled={loading} className="w-full">
              {loading ? "Conectando..." : "Conectar com Google Calendar"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Configurar credenciais OAuth2
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Calendário Conectado</Label>
              <Input value={calendarId} disabled />
              <p className="text-xs text-muted-foreground mt-1">
                Calendário principal da sua conta Google
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Configurações de Sincronização:</h4>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Sincronização automática</span>
                <Badge variant="secondary">Ativa</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Lembretes por email</span>
                <Badge variant="secondary">Ativa</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Última sincronização</span>
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSync} disabled={loading} className="flex-1">
                {loading ? "Sincronizando..." : "Sincronizar Agora"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="flex-1"
              >
                Desconectar
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
