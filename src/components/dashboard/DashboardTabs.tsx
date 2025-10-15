import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Bot, Zap, HelpCircle, Plus, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PlanManagement from "./PlanManagement";
import IntegrationsSection from "./IntegrationsSection";
import NegociosSection from "./NegociosSection";
import ChatbotsSection from "./ChatbotsSection";
import AgendamentosSection from "./AgendamentosSection";
import VendasCRMSection from "./VendasCRMSection";
import AnalyticsSection from "./AnalyticsSection";
import AutomacoesSection from "./AutomacoesSection";
import OnboardingChecklist from "./OnboardingChecklist";
import ChatbotSimulator from "./ChatbotSimulator";
import SimulatorShareModal from "./SimulatorShareModal";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardTabs = ({ activeTab, onTabChange }: DashboardTabsProps) => {
  const [preselectedPlan, setPreselectedPlan] = useState<string | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [negociosCount, setNegociosCount] = useState(0);
  const { activity, chatbots, negocios, updateOnboardingProgress, intendedRoute, setIntendedRoute, user } = useAuth();

  // Load negócios count directly from database
  useEffect(() => {
    if (user) {
      const fetchNegociosCount = async () => {
        try {
          const { data, error } = await supabase
            .from('negocios')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id);

          if (!error && data) {
            setNegociosCount(data.length);
          }
        } catch (error) {
          console.error('Erro ao buscar contagem de negócios:', error);
        }
      };

      fetchNegociosCount();
    }
  }, [user]);

  // Function to refresh dashboard data
  const refreshDashboardData = () => {
    // Dispatch custom event to trigger refresh in VendasCRMSection
    window.dispatchEvent(new CustomEvent('refreshDashboardData'));
  };

  // Sync URL with active tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');
    
    // Update URL if active tab doesn't match URL
    if (urlTab !== activeTab) {
      const newParams = new URLSearchParams();
      newParams.set('tab', activeTab);
      window.history.replaceState({}, '', `?${newParams.toString()}`);
    }
  }, [activeTab]);

  // Handle query params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const plan = urlParams.get('plan');
    
    if (tab && tab !== activeTab) {
      onTabChange(tab);
    }
    
    if (tab === 'plan' && plan && ['Basico', 'Pro', 'Premium'].includes(plan)) {
      setPreselectedPlan(plan);
    }
    
    // Handle intended route from AuthContext (after login)
    if (intendedRoute) {
      const url = new URL(intendedRoute, window.location.origin);
      const intentTab = url.searchParams.get('tab');
      const intentPlan = url.searchParams.get('plan');
      
      if (intentTab) {
        onTabChange(intentTab);
        if (intentTab === 'plan' && intentPlan && ['Basico', 'Pro', 'Premium'].includes(intentPlan)) {
          setPreselectedPlan(intentPlan);
        }
      }
      
      // Clear intended route after consuming it
      setIntendedRoute(null);
    }
  }, []);

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
    const firstNegocio = negocios.find(n => n.id === firstBot?.negocioId);
    if (!firstBot || !firstNegocio) return "";

    // This is simplified - in real implementation this would use LZ-String compression
    const demoData = {
      botName: firstBot.nome,
      academyName: `${firstNegocio.nome} - ${firstNegocio.unidade}`,
      template: firstBot.template,
      mensagens: firstBot.mensagens,
      ts: Date.now()
    };

    return `${window.location.origin}/demo?d=${encodeURIComponent(JSON.stringify(demoData))}`;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {/* Conteúdo das abas sem TabsList (navegação via sidebar) */}

        {/* VISÃO GERAL */}
        <TabsContent value="overview" className="space-y-6" forceMount>
          <div className={activeTab !== "overview" ? "hidden" : ""}>
            {/* Onboarding Checklist */}
            <OnboardingChecklist
              onNavigateTo={onTabChange}
              onOpenSimulator={handleOpenSimulator}
              onOpenShareDemo={handleOpenShareDemo}
            />

            {/* KPIs Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-card opacity-50" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Chatbots Ativos</CardTitle>
                  <Bot className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold">{chatbots.filter(c => c.status === 'Ativo').length}</div>
                  <p className="text-xs text-muted-foreground">
                    {chatbots.length === 0 ? "Nenhum chatbot criado ainda" : `${chatbots.length} total criados`}
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-card opacity-50" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Negócios</CardTitle>
                  <Building className="h-5 w-5 text-secondary" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold">{negociosCount}</div>
                  <p className="text-xs text-muted-foreground">Negócios cadastrados</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-card opacity-50" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Automação</CardTitle>
                  <Zap className="h-5 w-5 text-accent-foreground" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold">24/7</div>
                  <p className="text-xs text-muted-foreground">Atendimento automatizado</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-card opacity-50" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                  <div className="h-2 w-2 bg-secondary rounded-full animate-pulse" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-secondary">Online</div>
                  <p className="text-xs text-muted-foreground">Sistema operacional</p>
                </CardContent>
              </Card>
            </div>

            {/* Ações rápidas */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="relative overflow-hidden shadow-card">
                <div className="absolute inset-0 bg-gradient-hero opacity-10" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Criar Primeiro Chatbot
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-muted-foreground mb-6">Configure seu primeiro chatbot personalizado em minutos e comece a automatizar seu atendimento.</p>
                  <Button 
                    onClick={() => onTabChange("chatbots")} 
                    className="w-full shadow-button"
                    size="lg"
                  > 
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Agora
                  </Button>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden shadow-card">
                <div className="absolute inset-0 bg-gradient-accent opacity-30" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-secondary" />
                    Conectar WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-muted-foreground mb-6">Integre seu chatbot com WhatsApp Business e alcance seus clientes onde eles estão.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => onTabChange("integracoes")}
                    className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                    size="lg"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Configurar Integração
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Atividade recente */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activity.length > 0 ? (
                  <div className="space-y-3">
                    {activity.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-accent">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <div className="flex-1">
                          <span className="text-sm">{item.text}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                    <p className="mt-4 text-muted-foreground">Nenhuma atividade registrada</p>
                    <p className="text-sm text-muted-foreground">Crie seu primeiro chatbot para começar a ver a atividade aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MEUS NEGÓCIOS */}
        <TabsContent value="negocios" className="space-y-6" forceMount>
          <div className={activeTab !== "negocios" ? "hidden" : ""}>
            <NegociosSection />
          </div>
        </TabsContent>

        {/* CHATBOTS */}
        <TabsContent value="chatbots" className="space-y-6" forceMount>
          <div className={activeTab !== "chatbots" ? "hidden" : ""}>
            <ChatbotsSection />
          </div>
        </TabsContent>

        {/* AGENDAMENTOS */}
        <TabsContent value="agendamentos" className="space-y-6" forceMount>
          <div className={activeTab !== "agendamentos" ? "hidden" : ""}>
            <AgendamentosSection />
          </div>
        </TabsContent>

        {/* VENDAS & CRM */}
        <TabsContent value="vendas" className="space-y-6" forceMount>
          <div className={activeTab !== "vendas" ? "hidden" : ""}>
            <VendasCRMSection onRefreshRequest={refreshDashboardData} />
          </div>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="space-y-6" forceMount>
          <div className={activeTab !== "analytics" ? "hidden" : ""}>
            <AnalyticsSection />
          </div>
        </TabsContent>

        {/* AUTOMAÇÕES */}
        <TabsContent value="automacoes" className="space-y-6" forceMount>
          <div className={activeTab !== "automacoes" ? "hidden" : ""}>
            <AutomacoesSection />
          </div>
        </TabsContent>

        {/* INTEGRAÇÕES */}
        <TabsContent value="integracoes" className="space-y-6" forceMount>
          <div className={activeTab !== "integracoes" ? "hidden" : ""}>
            <IntegrationsSection />
          </div>
        </TabsContent>

        {/* CONFIGURAÇÕES (MEU PLANO) */}
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
            negocio={negocios.find(n => n.id === chatbots[0].negocioId) || null}
            onConversationEnd={refreshDashboardData}
          />
          <SimulatorShareModal
            open={shareModalOpen}
            onOpenChange={setShareModalOpen}
            onGenerateLink={generateDemoLink}
            chatbot={chatbots[0]}
            negocio={negocios.find(n => n.id === chatbots[0].negocioId) || null}
          />
        </>
      )}
    </div>
  );
};

export default DashboardTabs;