import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";

interface TrialExpiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlansClick: () => void;
}

export default function TrialExpiredModal({ open, onOpenChange, onPlansClick }: TrialExpiredModalProps) {
  const handlePlansClick = () => {
    onOpenChange(false);
    onPlansClick();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Seu teste grátis terminou</DialogTitle>
          <DialogDescription className="text-center">
            Para continuar usando todas as funcionalidades do Automiza, escolha um plano que se adapte ao seu negócio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handlePlansClick} className="w-full" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Ver planos
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}