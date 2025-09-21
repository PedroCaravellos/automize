import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

export default function Dashboard() {
  const { isHydrating } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger className="mr-2" />
            <DashboardHeader />
          </header>
          
          <main className="flex-1 p-6">
            <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}