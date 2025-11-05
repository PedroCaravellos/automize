import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import QuickOnboardingWizard from "./QuickOnboardingWizard";
import { Loader2 } from "lucide-react";

interface OnboardingGateProps {
  children: React.ReactNode;
}

export default function OnboardingGate({ children }: OnboardingGateProps) {
  const { user } = useAuth();
  const [hasNegocios, setHasNegocios] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Verificar se o usuário pulou o onboarding
    const onboardingSkipped = localStorage.getItem('onboarding-skipped') === 'true';
    setSkipped(onboardingSkipped);

    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from("negocios")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (error) throw error;

        setHasNegocios(data && data.length > 0);
      } catch (error) {
        console.error("Erro ao verificar onboarding:", error);
        setHasNegocios(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não tem negócios E não pulou o onboarding, mostra o wizard
  if (!hasNegocios && !skipped) {
    return <QuickOnboardingWizard />;
  }

  // Se já tem negócios OU pulou, mostra o conteúdo normal
  return <>{children}</>;
}
