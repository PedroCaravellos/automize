import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import FloatingActionButton from "@/components/dashboard/FloatingActionButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import OnboardingGate from "@/components/dashboard/OnboardingGate";
import NovoLeadModal from "@/components/dashboard/NovoLeadModal";
import NovoAgendamentoModal from "@/components/dashboard/NovoAgendamentoModal";
import AutomationModal from "@/components/dashboard/AutomationModal";
import { VideoOnboarding } from "@/components/dashboard/VideoOnboarding";
import AdaptiveDashboard from "@/components/dashboard/AdaptiveDashboard";
import ChatbotSimulator from "@/components/dashboard/ChatbotSimulator";
import PlanManagement from "@/components/dashboard/PlanManagement";
import NegociosSection from "@/components/dashboard/NegociosSection";
import ChatbotsSection from "@/components/dashboard/ChatbotsSection";
import VendasCRMSection from "@/components/dashboard/VendasCRMSection";
import AgendamentosSection from "@/components/dashboard/AgendamentosSection";
import AutomacoesSection from "@/components/dashboard/AutomacoesSection";
import IntegrationsSection from "@/components/dashboard/IntegrationsSection";
import { SecurityDashboard } from "@/components/dashboard/SecurityDashboard";
import QuickCommandPalette from "@/components/dashboard/QuickCommandPalette";
import { supabase } from "@/integrations/supabase/client";
import { NegocioItem, ChatbotItem, LeadItem, AutomacaoItem } from "@/types";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useSecurityMonitor } from "@/hooks/useSecurityMonitor";

export default function Dashboard() {
  const { isHydrating, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Security & Performance monitoring
  const { measure } = usePerformanceMonitor();
  const { logEvent } = useSecurityMonitor();

  // Modal states
  const [novoLeadModalOpen, setNovoLeadModalOpen] = useState(false);
  const [novoAgendamentoModalOpen, setNovoAgendamentoModalOpen] = useState(false);
  const [novaAutomacaoModalOpen, setNovaAutomacaoModalOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [selectedLeadForSchedule, setSelectedLeadForSchedule] = useState<string | undefined>();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Data states for AdaptiveDashboard
  const [negocios, setNegocios] = useState<any[]>([]);
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [automacoes, setAutomacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      action: () => setCommandPaletteOpen(true),
      description: 'Command Palette',
    },
    {
      key: 'n',
      ctrl: true,
      action: () => setNovoLeadModalOpen(true),
      description: 'Novo lead',
    },
    {
      key: 'a',
      ctrl: true,
      action: () => setNovoAgendamentoModalOpen(true),
      description: 'Novo agendamento',
    },
    {
      key: 'm',
      ctrl: true,
      action: () => setNovaAutomacaoModalOpen(true),
      description: 'Nova automação',
    },
    {
      key: 'b',
      ctrl: true,
      action: () => setSimulatorOpen(true),
      description: 'Testar chatbot',
    },
  ]);

  // Load dashboard data with performance monitoring
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        await measure('dashboard-data-load', async () => {
          const negociosResult = await (supabase as any)
            .from('negocios')
            .select('*')
            .eq('user_id', user.id);
          
          const chatbotsResult = await (supabase as any)
            .from('chatbots')
            .select('*')
            .eq('user_id', user.id);
          
          const leadsResult = await (supabase as any)
            .from('leads')
            .select('*')
            .eq('user_id', user.id);
          
          const automacoesResult = await (supabase as any)
            .from('automacoes')
            .select('*')
            .eq('user_id', user.id);

          setNegocios(negociosResult.data || []);
          setChatbots(chatbotsResult.data || []);
          setLeads(leadsResult.data || []);
          setAutomacoes(automacoesResult.data || []);
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        logEvent({
          type: 'suspicious_activity',
          severity: 'high',
          message: 'Failed to load dashboard data',
          metadata: { error: String(error), userId: user.id }
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, measure, logEvent]);

  // Add event listener for navigation between tabs
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('navigate-to-tab', handleNavigateToTab as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-tab', handleNavigateToTab as EventListener);
    };
  }, []);

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Auto-fechar sidebar em mobile após navegação
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'open-simulator':
        setSimulatorOpen(true);
        break;
      case 'see-dashboard':
        setActiveTab('overview');
        break;
      case 'view-all-leads':
        setActiveTab('overview'); // Leads são mostrados no adaptive dashboard
        break;
      default:
        break;
    }
  };

  const handleOpenSchedule = (leadId: string) => {
    setSelectedLeadForSchedule(leadId);
    setNovoAgendamentoModalOpen(true);
  };

  const handleCommandPalette = (command: string, data?: any) => {
    switch (command) {
      case 'novo-lead':
        setNovoLeadModalOpen(true);
        break;
      case 'novo-agendamento':
        setNovoAgendamentoModalOpen(true);
        break;
      case 'nova-automacao':
        setNovaAutomacaoModalOpen(true);
        break;
      case 'testar-chatbot':
        setSimulatorOpen(true);
        break;
      case 'nav-overview':
        setActiveTab('overview');
        break;
      case 'nav-negocios':
        setActiveTab('negocios');
        break;
      case 'nav-chatbots':
        setActiveTab('chatbots');
        break;
      case 'nav-crm':
        setActiveTab('crm');
        break;
      case 'nav-agendamentos':
        setActiveTab('agendamentos');
        break;
      case 'nav-automacoes':
        setActiveTab('automacoes');
        break;
      case 'nav-security':
        setActiveTab('security');
        break;
      case 'open-lead':
        setActiveTab('crm');
        break;
      case 'open-chatbot':
        setSimulatorOpen(true);
        break;
    }
  };

  return (
    <OnboardingGate>
      <VideoOnboarding />
      <SidebarProvider defaultOpen={!isMobile} open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="min-h-screen flex w-full">
          <AppSidebar activeTab={activeTab} onTabChange={handleTabChange} />
          
          <div className="flex-1 flex flex-col min-w-0">
            <header className="sticky top-0 z-10 h-12 flex items-center border-b px-4 bg-background">
              <SidebarTrigger className="mr-2" aria-label="Toggle sidebar" />
              <div className="flex-1 min-w-0">
                <DashboardHeader />
              </div>
            </header>
            
            <main className="flex-1 p-4 md:p-6">
              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {activeTab === "overview" && (
                    <AdaptiveDashboard
                      negocios={negocios}
                      chatbots={chatbots}
                      leads={leads}
                      automacoes={automacoes}
                      onOpenSimulator={() => setSimulatorOpen(true)}
                      onOpenSchedule={handleOpenSchedule}
                      onActionClick={handleActionClick}
                    />
                  )}
                  {activeTab === "negocios" && <NegociosSection />}
                  {activeTab === "chatbots" && <ChatbotsSection />}
                  {activeTab === "crm" && <VendasCRMSection />}
                  {activeTab === "agendamentos" && <AgendamentosSection />}
                  {activeTab === "automacoes" && <AutomacoesSection />}
                  {activeTab === "integracoes" && <IntegrationsSection />}
                  {activeTab === "security" && <SecurityDashboard />}
                  {activeTab === "plan" && <PlanManagement preselectedPlan={null} />}
                </>
              )}
            </main>
          </div>

          {/* Floating Action Button */}
          <FloatingActionButton
            onNavigateTo={handleTabChange}
            onOpenNewLead={() => setNovoLeadModalOpen(true)}
            onOpenNewAgendamento={() => setNovoAgendamentoModalOpen(true)}
            onOpenNewAutomacao={() => setNovaAutomacaoModalOpen(true)}
          />

          {/* Command Palette */}
          <QuickCommandPalette
            open={commandPaletteOpen}
            onOpenChange={setCommandPaletteOpen}
            leads={leads}
            negocios={negocios}
            chatbots={chatbots}
            automacoes={automacoes}
            onCommand={handleCommandPalette}
          />

          {/* Quick Action Modals */}
          <NovoLeadModal
            open={novoLeadModalOpen}
            onOpenChange={setNovoLeadModalOpen}
            onLeadCriado={() => {
              setNovoLeadModalOpen(false);
              // Opcional: Refresh dashboard ou navegar para leads
            }}
          />
          <NovoAgendamentoModal
            open={novoAgendamentoModalOpen}
            onOpenChange={(open) => {
              setNovoAgendamentoModalOpen(open);
              if (!open) setSelectedLeadForSchedule(undefined);
            }}
            onAgendamentoCriado={() => {
              setNovoAgendamentoModalOpen(false);
              setSelectedLeadForSchedule(undefined);
              if (user) {
                const fetchLeads = async () => {
                  const result = await (supabase as any)
                    .from('leads')
                    .select('*')
                    .eq('user_id', user.id);
                  if (result.data) setLeads(result.data);
                };
                fetchLeads();
              }
            }}
          />
          <AutomationModal
            open={novaAutomacaoModalOpen}
            onOpenChange={setNovaAutomacaoModalOpen}
            onSave={() => {
              setNovaAutomacaoModalOpen(false);
              if (user) {
                const fetchAuto = async () => {
                  const result = await (supabase as any)
                    .from('automacoes')
                    .select('*')
                    .eq('user_id', user.id);
                  if (result.data) setAutomacoes(result.data);
                };
                fetchAuto();
              }
            }}
          />

          {/* Chatbot Simulator */}
          {chatbots.length > 0 && (
            <ChatbotSimulator
              open={simulatorOpen}
              onOpenChange={setSimulatorOpen}
              chatbot={chatbots[0]}
              negocio={negocios.find(n => n.id === chatbots[0]?.negocioId) || null}
              onConversationEnd={() => {
                if (user) {
                  const fetchLeads = async () => {
                    const result = await (supabase as any)
                      .from('leads')
                      .select('*')
                      .eq('user_id', user.id);
                    if (result.data) setLeads(result.data);
                  };
                  fetchLeads();
                }
              }}
            />
          )}
        </div>
      </SidebarProvider>
    </OnboardingGate>
  );
}
