import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Zap } from "lucide-react";

const EXPERT_MODE_KEY = 'expert_mode_enabled';

interface ExpertModeToggleProps {
  onModeChange?: (isExpert: boolean) => void;
}

export default function ExpertModeToggle({ onModeChange }: ExpertModeToggleProps) {
  const [isExpert, setIsExpert] = useState(() => {
    const stored = localStorage.getItem(EXPERT_MODE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    onModeChange?.(isExpert);
  }, [isExpert, onModeChange]);

  const handleToggle = (checked: boolean) => {
    setIsExpert(checked);
    localStorage.setItem(EXPERT_MODE_KEY, String(checked));
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpert ? (
              <Zap className="h-5 w-5 text-amber-500" />
            ) : (
              <GraduationCap className="h-5 w-5 text-blue-500" />
            )}
            <div>
              <Label htmlFor="expert-mode" className="text-sm font-medium cursor-pointer">
                {isExpert ? "Modo Avançado" : "Modo Guiado"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isExpert 
                  ? "Interface limpa com ações rápidas" 
                  : "Tooltips e sugestões para iniciantes"}
              </p>
            </div>
          </div>
          <Switch
            id="expert-mode"
            checked={isExpert}
            onCheckedChange={handleToggle}
            aria-label="Alternar modo avançado"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export const useExpertMode = () => {
  const [isExpert, setIsExpert] = useState(() => {
    const stored = localStorage.getItem(EXPERT_MODE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(EXPERT_MODE_KEY);
      setIsExpert(stored === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return isExpert;
};
