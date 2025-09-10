import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Bot, Zap, HelpCircle, Plus } from "lucide-react";
import PlanManagement from "./PlanManagement";
import IntegrationsSection from "./IntegrationsSection";
import AcademiasSection from "./AcademiasSection";
import ChatbotsSection from "./ChatbotsSection";
import OnboardingChecklist from "./OnboardingChecklist";
import ChatbotSimulator from "./ChatbotSimulator";
import SimulatorShareModal from "./SimulatorShareModal";
import { useAuth } from "@/contexts/AuthContext";

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [preselectedPlan, setPreselectedPlan] = useState<string | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { activity, chatbots, academias, updateOnboardingProgress, intendedRoute, setIntendedRoute } = useAuth();

  // Handle query params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const plan = urlParams.get('plan');
    
    if (tab === 'plan') {
      setActiveTab('plan');
      if (plan && ['Basico', 'Pro', 'Premium'].includes(plan)) {
        setPreselectedPlan(plan);
      }
      // Clear URL params after reading them
      window.history.replaceState({}, '', '/dashboard');
    }
    
    // Handle intended route from AuthContext (after login)
    if (intendedRoute) {
      const url = new URL(intendedRoute, window.location.origin);
      const intentTab = url.searchParams.get('tab');
      const intentPlan = url.searchParams.get('plan');
      
      if (intentTab === 'plan') {
        setActiveTab('plan');
        if (intentPlan && ['Basico', 'Pro', 'Premium'].includes(intentPlan)) {
          setPreselectedPlan(intentPlan);
        }
      }
      
      // Clear intended route after consuming it
      setIntendedRoute(null);
    }
  }, [intendedRoute, setIntendedRoute]);

  // Handlers for onboarding actions
  const handleOpenSimulator = () => {
    const firstBot = chatbots[0];
    if (firstBot) {
      setSimulatorOpen(true);
      updateOnboardingProgress({ simulatorOpened: true });
    }
  };

  const handleOpenShareDemo = () => {
    const firstBot = chatbots[0];
    if (firstBot) {
      setSimulatorOpen(true);
      setShareModalOpen(true);
      updateOnboardingProgress({ demoShared: true });
    }
  };

  const generateDemoLink = (): string => {
    const firstBot = chatbots[0];
    const firstAcademia = academias.find(a => a.id === firstBot?.academiaId);
    if (!firstBot || !firstAcademia) return "";

    // This is simplified - in real implementation this would use LZ-String compression
    const demoData = {
      botName: firstBot.nome,
      academyName: `${firstAcademia.nome} - ${firstAcademia.unidade}`,
      template: firstBot.template,
      mensagens: firstBot.mensagens,
      ts: Date.now()
    };

    return `${window.location.origin}/demo?d=${encodeURIComponent(JSON.stringify(demoData))}`;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="academias">Minhas Academias</TabsTrigger>
          <TabsTrigger value="chatbots">Chatbots</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="plan">Meu Plano</TabsTrigger>
          <TabsTrigger value="ajuda">Ajuda</TabsTrigger>
        </TabsList>

        {/* VISÃO GERAL */}
        <TabsContent value="overview" className="space-y-6" forceMount>
          <div className={activeTab !== "overview" ? "hidden" : ""}>
            {/* Onboarding Checklist */}
            <OnboardingChecklist
              onNavigateTo={setActiveTab}
              onOpenSimulator={handleOpenSimulator}
              onOpenShareDemo={handleOpenShareDemo}
            />

            {/* Cards de métricas */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chatbots Ativos</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{chatbots.filter(c => c.status === 'Ativo').length}</div>
                  <p className="text-xs text-muted-foreground">
                    {chatbots.length === 0 ? "Nenhum chatbot criado ainda" : `${chatbots.length} total`}
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
                  <p className="text-xs text-muted-foreground">Aguardando primeiro chatbot</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Leads convertidos este mês</p>
                </CardContent>
              </Card>
            </div>

            {/* Ações rápidas */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Chatbot</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Configure seu primeiro chatbot personalizado em minutos.</p>
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
                  <p className="text-muted-foreground mb-4">Integre seu chatbot com WhatsApp Business.</p>
                  <Button variant="outline" onClick={() => setActiveTab("integracoes")}>
                    <Zap className="mr-2 h-4 w-4" />
                    Conectar WhatsApp
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Atividade recente */}
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
                  <p className="text-muted-foreground">Nenhuma atividade ainda. Crie seu primeiro chatbot para começar!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MINHAS ACADEMIAS */}
        <TabsContent value="academias" className="space-y-6" forceMount>
          <div className={activeTab !== "academias" ? "hidden" : ""}>
            <AcademiasSection />
          </div>
        </TabsContent>

        {/* CHATBOTS */}
        <TabsContent value="chatbots" className="space-y-6" forceMount>
          <div className={activeTab !== "chatbots" ? "hidden" : ""}>
            <ChatbotsSection />
          </div>
        </TabsContent>

        {/* INTEGRAÇÕES */}
        <TabsContent value="integracoes" className="space-y-6" forceMount>
          <div className={activeTab !== "integracoes" ? "hidden" : ""}>
            <IntegrationsSection />
          </div>
        </TabsContent>

        {/* MEU PLANO */}
        <TabsContent value="plan" className="space-y-6" forceMount>
          <div className={activeTab !== "plan" ? "hidden" : ""}>
            <PlanManagement preselectedPlan={preselectedPlan} />
          </div>
        </TabsContent>

        {/* AJUDA */}
        <TabsContent value="ajuda" className="space-y-6" forceMount>
          <div className={activeTab !== "ajuda" ? "hidden" : ""}>
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Simulator Modal for onboarding actions */}
      {chatbots.length > 0 && (
        <>
          <ChatbotSimulator
            open={simulatorOpen}
            onOpenChange={setSimulatorOpen}
            chatbot={chatbots[0]}
            academia={academias.find(a => a.id === chatbots[0].academiaId) || null}
          />
          <SimulatorShareModal
            open={shareModalOpen}
            onOpenChange={setShareModalOpen}
            onGenerateLink={generateDemoLink}
            chatbot={chatbots[0]}
            academia={academias.find(a => a.id === chatbots[0].academiaId) || null}
          />
        </>
      )}
    </div>
  );
};

export default DashboardTabs;