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
import { supabase } from "@/integrations/supabase/client";
import { NegocioItem, ChatbotItem, LeadItem, AutomacaoItem } from "@/types";

export default function Dashboard() {
  const { isHydrating, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Modal states
  const [novoLeadModalOpen, setNovoLeadModalOpen] = useState(false);
  const [novoAgendamentoModalOpen, setNovoAgendamentoModalOpen] = useState(false);
  const [novaAutomacaoModalOpen, setNovaAutomacaoModalOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [selectedLeadForSchedule, setSelectedLeadForSchedule] = useState<string | undefined>();

  // Data states for AdaptiveDashboard
  const [negocios, setNegocios] = useState<any[]>([]);
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [automacoes, setAutomacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Keyboard shortcuts
  useKeyboardShortcuts([
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
  ]);

  // Load dashboard data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const n: any = await supabase.from('negocios').select('*').eq('user_id', user.id);
        const c: any = await supabase.from('chatbots').select('*').eq('user_id', user.id);
        const l: any = await supabase.from('leads').select('*').eq('user_id', user.id);
        const a: any = await supabase.from('automacoes').select('*').eq('user_id', user.id);

        if (n.data) setNegocios(n.data);
        if (c.data) setChatbots(c.data);
        if (l.data) setLeads(l.data);
        if (a.data) setAutomacoes(a.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

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
              ) : activeTab === "plan" ? (
                <PlanManagement preselectedPlan={null} />
              ) : (
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
            </main>
          </div>

          {/* Floating Action Button */}
          <FloatingActionButton
            onNavigateTo={handleTabChange}
            onOpenNewLead={() => setNovoLeadModalOpen(true)}
            onOpenNewAgendamento={() => setNovoAgendamentoModalOpen(true)}
            onOpenNewAutomacao={() => setNovaAutomacaoModalOpen(true)}
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
                  const r: any = await supabase.from('leads').select('*').eq('user_id', user.id);
                  if (r.data) setLeads(r.data);
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
                  const r: any = await supabase.from('automacoes').select('*').eq('user_id', user.id);
                  if (r.data) setAutomacoes(r.data);
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
                    const r: any = await supabase.from('leads').select('*').eq('user_id', user.id);
                    if (r.data) setLeads(r.data);
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