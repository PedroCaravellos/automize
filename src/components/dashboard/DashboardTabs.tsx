import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Bot, Zap, HelpCircle, Plus, CreditCard } from "lucide-react";
import PlanManagement from "./PlanManagement";
import IntegrationsSection from "./IntegrationsSection";
import AcademiasSection from "./AcademiasSection";
import ChatbotsSection from "./ChatbotsSection";
import { useAuth } from "@/contexts/AuthContext";

 const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { activity } = useAuth();
  // State lifted to global AuthContext. Activity feed read from context.
  // No local lists to avoid unmount data loss and parent updates during child render.

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="academias">Minhas Academias</TabsTrigger>
          <TabsTrigger value="chatbots">Chatbots</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="plano">Meu Plano</TabsTrigger>
          <TabsTrigger value="ajuda">Ajuda</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6" forceMount>
          {/* Conteúdo atual do DashboardContent será movido aqui */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chatbots Ativos</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Nenhum chatbot criado ainda
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversas Hoje</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando primeiro chatbot
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Leads convertidos este mês
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Criar Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Configure seu primeiro chatbot personalizado em minutos.
                </p>
                <Button onClick={() => setActiveTab("chatbots")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Chatbot
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conectar WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Integre seu chatbot com WhatsApp Business.
                </p>
                <Button variant="outline">
                  <Zap className="mr-2 h-4 w-4" />
                  Conectar WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <div className="space-y-2">
                  {activity.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(item.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma atividade ainda. Crie seu primeiro chatbot para começar!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academias" className="space-y-6" forceMount>
          <AcademiasSection />
        </TabsContent>

        <TabsContent value="chatbots" className="space-y-6" forceMount>
          <ChatbotsSection />
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-6" forceMount>
          <IntegrationsSection />
        </TabsContent>

        <TabsContent value="plano" className="space-y-6" forceMount>
          <PlanManagement />
        </TabsContent>

        <TabsContent value="ajuda" className="space-y-6" forceMount>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Ajuda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Links úteis:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• FAQ - Perguntas frequentes</li>
                  <li>• Guias Rápidos - Como usar a plataforma</li>
                  <li>• Contato - Fale com nosso suporte</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;