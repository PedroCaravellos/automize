import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import TrialGate from "@/components/dashboard/TrialGate";

export default function Dashboard() {
  const { hasAccess, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasValidAccess = hasAccess();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto py-6 px-6">
        {hasValidAccess ? (
          <DashboardContent />
        ) : (
          <TrialGate />
        )}
      </main>
    </div>
  );
}