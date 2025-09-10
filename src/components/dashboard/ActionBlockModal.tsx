import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Zap, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ActionBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlansClick: () => void;
  action: string;
}

export default function ActionBlockModal({ open, onOpenChange, onPlansClick, action }: ActionBlockModalProps) {
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
      onOpenChange(false);
      // Recarregar a página para atualizar o estado de acesso
      window.location.reload();
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

  const handlePlansClick = () => {
    onOpenChange(false);
    onPlansClick();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Funcionalidade bloqueada</DialogTitle>
          <DialogDescription className="text-center">
            Para usar "{action}", ative seu trial gratuito ou escolha um plano.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleActivateTrial}
            disabled={isActivating}
            className="w-full"
            size="lg"
          >
            <Clock className="mr-2 h-4 w-4" />
            {isActivating ? "Ativando..." : "Ativar trial de 7 dias"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handlePlansClick}
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            Ver planos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}