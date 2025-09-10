import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface TrialBannerProps {
  onPlansClick: () => void;
}

export default function TrialBanner({ onPlansClick }: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { profile, trialDaysRemaining } = useAuth();

  if (!profile?.trial_ativo || !isVisible) return null;

  const daysLeft = trialDaysRemaining();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Trial ativo
          </Badge>
          <span className="text-sm font-medium">
            {daysLeft > 0 ? `${daysLeft} ${daysLeft === 1 ? 'dia restante' : 'dias restantes'}` : 'Último dia do trial'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPlansClick}
            className="text-xs"
          >
            Escolher plano agora
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}