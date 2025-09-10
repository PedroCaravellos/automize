import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import TrialGate from "@/components/dashboard/TrialGate";
import AccessGate from "@/components/dashboard/AccessGate";
import TrialBanner from "@/components/dashboard/TrialBanner";
import TrialExpiredModal from "@/components/dashboard/TrialExpiredModal";

export default function Dashboard() {
  const { hasAccess, loading, profile, updateProfile } = useAuth();
  const [showAccessGate, setShowAccessGate] = useState(false);
  const [showTrialExpired, setShowTrialExpired] = useState(false);

  useEffect(() => {
    if (!loading && profile) {
      const access = hasAccess();
      
      // Verificar se o trial expirou
      if (profile.trial_ativo && profile.trial_fim_em) {
        const now = new Date();
        const trialEnd = new Date(profile.trial_fim_em);
        if (now >= trialEnd) {
          // Trial expirado - desativar e mostrar modal
          updateProfile({ trial_ativo: false });
          setShowTrialExpired(true);
          return;
        }
      }
      
      // Mostrar gate de acesso se não tiver acesso
      if (!access) {
        setShowAccessGate(true);
      }
    }
  }, [loading, profile, hasAccess, updateProfile]);

  const handlePlansClick = () => {
    window.location.href = "/#planos";
  };

  const handleTrialActivated = () => {
    setShowAccessGate(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const validAccess = hasAccess();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto py-6 px-6">
        {validAccess && (
          <TrialBanner onPlansClick={handlePlansClick} />
        )}
        
        {validAccess ? (
          <DashboardContent />
        ) : (
          <TrialGate />
        )}
      </main>
      
      {/* Access Gate Overlay */}
      {showAccessGate && (
        <AccessGate 
          onTrialActivated={handleTrialActivated}
          onPlansClick={handlePlansClick}
        />
      )}
      
      {/* Trial Expired Modal */}
      <TrialExpiredModal
        open={showTrialExpired}
        onOpenChange={setShowTrialExpired}
        onPlansClick={handlePlansClick}
      />
    </div>
  );
}