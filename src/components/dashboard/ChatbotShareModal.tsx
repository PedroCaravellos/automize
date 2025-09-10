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
import { useToast } from "@/hooks/use-toast";

interface ChatbotShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbot: Chatbot | null;
  onGenerateLink: (chatbotId: string) => string;
  onRevokeLink: (chatbotId: string) => void;
}

const ChatbotShareModal = ({ 
  open, 
  onOpenChange, 
  chatbot, 
  onGenerateLink,
  onRevokeLink 
}: ChatbotShareModalProps) => {
  const { toast } = useToast();
  const [isRevoking, setIsRevoking] = useState(false);

  if (!chatbot) return null;

  const hasLink = chatbot.demo?.enabled;
  const demoLink = hasLink ? `${window.location.origin}/demo/${chatbot.demo?.slug}` : "";

  const handleCopyLink = async () => {
    if (!demoLink) return;
    
    try {
      await navigator.clipboard.writeText(demoLink);
      toast({ description: "Link copiado para a área de transferência!" });
    } catch (error) {
      toast({ 
        description: "Erro ao copiar link. Tente selecionar e copiar manualmente.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateLink = () => {
    const newLink = onGenerateLink(chatbot.id);
    toast({ description: "Link de demo gerado com sucesso!" });
  };

  const handleRevokeLink = () => {
    setIsRevoking(true);
    onRevokeLink(chatbot.id);
    setIsRevoking(false);
    toast({ description: "Link de demo revogado. Um novo link pode ser gerado." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Compartilhar Demo
          </DialogTitle>
          <DialogDescription>
            {hasLink 
              ? "Link público para demonstração do chatbot:" 
              : "Gere um link público para demonstração do chatbot:"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Chatbot: {chatbot.nome}
            </label>
            
            {hasLink ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={demoLink}
                    readOnly
                    className="flex-1"
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
                  Este link mostra apenas uma simulação do seu bot. Não permite edição.
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Nenhum link de demo foi gerado ainda.
                </p>
                <Button onClick={handleGenerateLink}>
                  Gerar Link de Demo
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {hasLink && (
            <Button
              variant="outline"
              onClick={handleRevokeLink}
              disabled={isRevoking}
              className="text-orange-600 hover:text-orange-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isRevoking ? "Revogando..." : "Revogar Link"}
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

export default ChatbotShareModal;