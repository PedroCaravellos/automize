import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, RotateCcw, ExternalLink } from "lucide-react";
import { Chatbot } from "./ChatbotsSection";
import { NegocioItem } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SimulatorShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateLink: () => string;
  chatbot: Chatbot | null;
  negocio: NegocioItem | null;
}

const SimulatorShareModal = ({ 
  open, 
  onOpenChange, 
  onGenerateLink,
  chatbot,
  negocio
}: SimulatorShareModalProps) => {
  const { toast } = useToast();
  const { updateOnboardingProgress } = useAuth();
  const [currentLink, setCurrentLink] = useState("");

  const handleGenerateLink = () => {
    const newLink = onGenerateLink();
    setCurrentLink(newLink);
    updateOnboardingProgress({ demoShared: true });
    toast({ description: "Link de demo gerado com sucesso!" });
  };

  const handleCopyLink = async () => {
    if (!currentLink) return;
    
    try {
      await navigator.clipboard.writeText(currentLink);
      toast({ description: "Link copiado para a área de transferência!" });
    } catch (error) {
      toast({ 
        description: "Erro ao copiar link. Tente selecionar e copiar manualmente.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateNewLink = () => {
    const newLink = onGenerateLink();
    setCurrentLink(newLink);
    toast({ description: "Novo link de demo gerado!" });
  };

  // Generate initial link when modal opens
  const handleOpenChange = (open: boolean) => {
    if (open && !currentLink) {
      const link = onGenerateLink();
      setCurrentLink(link);
    }
    onOpenChange(open);
  };

  if (!chatbot || !negocio) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Compartilhar Demo
          </DialogTitle>
          <DialogDescription>
            Compartilhe um link público para demonstração do chatbot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Chatbot: {chatbot.nome}
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Negócio: {negocio.nome} - {negocio.unidade}
            </p>
            
            {currentLink ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={currentLink}
                    readOnly
                    className="flex-1 text-xs"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Este link contém apenas as mensagens do seu bot (sem dados sensíveis).
                  {chatbot.mensagens.faqs.length > 5 && (
                    <span className="block mt-1 text-orange-600">
                      Apenas as primeiras 5 FAQs foram incluídas no link.
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Gere um link público para demonstração do chatbot.
                </p>
                <Button onClick={handleGenerateLink}>
                  Gerar Link de Demo
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {currentLink && (
            <Button
              variant="outline"
              onClick={handleGenerateNewLink}
              className="text-purple-600 hover:text-purple-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Gerar novo link
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SimulatorShareModal;