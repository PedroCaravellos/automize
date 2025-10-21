import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ProgressRing() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      calculateProgress();
    }
  }, [user?.id]);

  const calculateProgress = async () => {
    try {
      const { data: negocios } = await supabase
        .from("negocios")
        .select("id")
        .eq("user_id", user?.id);

      const negocioIds = negocios?.map(n => n.id) || [];

      if (negocioIds.length === 0) {
        setProgress(0);
        setLoading(false);
        return;
      }

      // Critérios de progresso
      const [chatbots, leads, automacoes, integracoes] = await Promise.all([
        supabase.from("chatbots").select("id", { count: "exact", head: true }).in("negocio_id", negocioIds),
        supabase.from("leads").select("id", { count: "exact", head: true }).in("negocio_id", negocioIds),
        supabase.from("automacoes").select("id", { count: "exact", head: true }).eq("user_id", user?.id),
        supabase.from("whatsapp_integrations").select("id", { count: "exact", head: true }).eq("user_id", user?.id).eq("is_active", true),
      ]);

      // Calcular progresso (5 critérios, cada um vale 20%)
      let totalProgress = 0;
      if (negocioIds.length > 0) totalProgress += 20; // Negócio criado
      if ((chatbots.count || 0) > 0) totalProgress += 20; // Chatbot criado
      if ((leads.count || 0) > 0) totalProgress += 20; // Leads capturados
      if ((automacoes.count || 0) > 0) totalProgress += 20; // Automação criada
      if ((integracoes.count || 0) > 0) totalProgress += 20; // Integração ativa

      setProgress(totalProgress);
      setLoading(false);
    } catch (error) {
      console.error("Error calculating progress:", error);
      setLoading(false);
    }
  };

  if (loading) return null;

  const circumference = 2 * Math.PI * 18; // raio = 18
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative h-10 w-10 cursor-pointer">
            <svg className="h-10 w-10 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-muted"
              />
              {/* Progress circle */}
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-primary transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold">{progress}%</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Setup {progress}% concluído</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
