import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, Zap, Settings } from "lucide-react";
import { IntegrationsGrid } from "./IntegrationsGrid";
import { WhatsAppConfig } from "./WhatsAppConfig";
import { GoogleCalendarConfig } from "./GoogleCalendarConfig";

export default function IntegrationsSection() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrações</h2>
        <p className="text-muted-foreground mt-1">
          Conecte suas ferramentas favoritas para automatizar seu negócio
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Google Calendar
          </TabsTrigger>
          <TabsTrigger value="zapier" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Zapier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <IntegrationsGrid />
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <WhatsAppConfig onSuccess={() => setActiveTab("overview")} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <GoogleCalendarConfig />
        </TabsContent>

        <TabsContent value="zapier" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-orange-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Zapier Webhooks</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte com 5000+ aplicativos através de webhooks
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure webhooks do Zapier para automatizar fluxos de trabalho quando eventos
                específicos acontecerem no sistema (novo lead, agendamento criado, venda fechada, etc).
              </p>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Funcionalidade em desenvolvimento</p>
                <p className="text-sm text-muted-foreground">
                  Em breve você poderá configurar webhooks personalizados do Zapier para
                  integrar com suas ferramentas favoritas.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}