import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import FloatingActionButton from "@/components/dashboard/FloatingActionButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import OnboardingGate from "@/components/dashboard/OnboardingGate";
import NovoLeadModal from "@/components/dashboard/NovoLeadModal";
import NovoAgendamentoModal from "@/components/dashboard/NovoAgendamentoModal";
import AutomationModal from "@/components/dashboard/AutomationModal";

export default function Dashboard() {
  const { isHydrating } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Modal states
  const [novoLeadModalOpen, setNovoLeadModalOpen] = useState(false);
  const [novoAgendamentoModalOpen, setNovoAgendamentoModalOpen] = useState(false);
  const [novaAutomacaoModalOpen, setNovaAutomacaoModalOpen] = useState(false);

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

  return (
    <OnboardingGate>
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
              <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} />
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
            onOpenChange={setNovoAgendamentoModalOpen}
            onAgendamentoCriado={() => {
              setNovoAgendamentoModalOpen(false);
              // Opcional: Refresh dashboard ou navegar para agendamentos
            }}
          />
          <AutomationModal
            open={novaAutomacaoModalOpen}
            onOpenChange={setNovaAutomacaoModalOpen}
            onSave={() => {
              setNovaAutomacaoModalOpen(false);
              // Opcional: Refresh dashboard ou navegar para automações
            }}
          />
        </div>
      </SidebarProvider>
    </OnboardingGate>
  );
}