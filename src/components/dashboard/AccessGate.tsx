import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Zap, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AccessGateProps {
  onTrialActivated: () => void;
  onPlansClick: () => void;
}

export default function AccessGate({ onTrialActivated, onPlansClick }: AccessGateProps) {
  const [isActivating, setIsActivating] = useState(false);
  const { activateTrial } = useAuth();
  const { toast } = useToast();

  const handleActivateTrial = async () => {
    setIsActivating(true);
    try {
      await activateTrial();
      toast({
        title: "Trial ativado!",
        description: "Você tem 7 dias para explorar todas as funcionalidades.",
      });
      onTrialActivated();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível ativar o trial. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bem-vindo ao Automiza!</CardTitle>
          <CardDescription>
            Para começar a usar o dashboard, escolha uma das opções abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleActivateTrial}
            disabled={isActivating}
            className="w-full h-12 text-base"
            size="lg"
          >
            <Clock className="mr-2 h-5 w-5" />
            {isActivating ? "Ativando..." : "Ativar teste grátis de 7 dias"}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={onPlansClick}
            className="w-full h-12 text-base"
            size="lg"
          >
            <Zap className="mr-2 h-5 w-5" />
            Escolher um plano
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            O trial inclui todas as funcionalidades premium por 7 dias.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}