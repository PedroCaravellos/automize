import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Chatbot } from "./ChatbotsSection";

interface ChatbotEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbot: Chatbot | null;
  onSave: (mensagens: Chatbot["mensagens"]) => void;
}

const ChatbotEditModal = ({ open, onOpenChange, chatbot, onSave }: ChatbotEditModalProps) => {
  const [mensagens, setMensagens] = useState<Chatbot["mensagens"]>({
    boasVindas: "",
    faqs: [
      { pergunta: "", resposta: "" },
      { pergunta: "", resposta: "" },
      { pergunta: "", resposta: "" }
    ],
    encerramento: ""
  });

  const [errors, setErrors] = useState<{
    boasVindas: string;
    encerramento: string;
    faqs: string[];
  }>({
    boasVindas: "",
    encerramento: "",
    faqs: []
  });

  useEffect(() => {
    if (chatbot && open) {
      setMensagens(chatbot.mensagens);
      setErrors({
        boasVindas: "",
        encerramento: "",
        faqs: new Array(chatbot.mensagens.faqs.length).fill("")
      });
    }
  }, [chatbot, open]);

  const addFaq = () => {
    setMensagens(prev => ({
      ...prev,
      faqs: [...prev.faqs, { pergunta: "", resposta: "" }]
    }));
    setErrors(prev => ({
      ...prev,
      faqs: [...prev.faqs, ""]
    }));
  };

  const removeFaq = (index: number) => {
    if (mensagens.faqs.length > 1) {
      setMensagens(prev => ({
        ...prev,
        faqs: prev.faqs.filter((_, i) => i !== index)
      }));
      setErrors(prev => ({
        ...prev,
        faqs: prev.faqs.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      boasVindas: "",
      encerramento: "",
      faqs: new Array(mensagens.faqs.length).fill("")
    };

    if (!mensagens.boasVindas.trim()) {
      newErrors.boasVindas = "Mensagem de boas-vindas é obrigatória";
    }

    if (!mensagens.encerramento.trim()) {
      newErrors.encerramento = "Mensagem de encerramento é obrigatória";
    }

    // Validar pelo menos uma FAQ preenchida
    let hasValidFaq = false;
    mensagens.faqs.forEach((faq, index) => {
      if (faq.pergunta.trim() && !faq.resposta.trim()) {
        newErrors.faqs[index] = "Resposta é obrigatória quando pergunta está preenchida";
      } else if (!faq.pergunta.trim() && faq.resposta.trim()) {
        newErrors.faqs[index] = "Pergunta é obrigatória quando resposta está preenchida";
      } else if (faq.pergunta.trim() && faq.resposta.trim()) {
        hasValidFaq = true;
      }
    });

    if (!hasValidFaq) {
      if (newErrors.faqs.length > 0) {
        newErrors.faqs[0] = "Pelo menos uma pergunta e resposta devem ser preenchidas";
      }
    }

    setErrors(newErrors);
    
    return !newErrors.boasVindas && 
           !newErrors.encerramento && 
           !newErrors.faqs.some(error => error !== "") &&
           hasValidFaq;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(mensagens);
    }
  };

  const handleInputChange = (field: string, value: string, index?: number) => {
    if (field === "faq" && index !== undefined) {
      const newFaqs = [...mensagens.faqs];
      const [subField, subValue] = value.split(":");
      if (subField === "pergunta") {
        newFaqs[index].pergunta = subValue;
      } else if (subField === "resposta") {
        newFaqs[index].resposta = subValue;
      }
      setMensagens(prev => ({ ...prev, faqs: newFaqs }));
      
      // Limpar erro específico
      if (errors.faqs[index]) {
        const newErrors = { ...errors };
        newErrors.faqs[index] = "";
        setErrors(newErrors);
      }
    } else {
      setMensagens(prev => ({ ...prev, [field]: value }));
      
      // Limpar erro do campo
      if (errors[field as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
  };

  if (!chatbot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Chatbot - {chatbot.nome}</DialogTitle>
          <DialogDescription>
            Edite as mensagens e respostas do seu chatbot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="boas-vindas">Mensagem de Boas-vindas *</Label>
            <Textarea
              id="boas-vindas"
              placeholder="Digite a mensagem de boas-vindas..."
              value={mensagens.boasVindas}
              onChange={(e) => handleInputChange("boasVindas", e.target.value)}
              className={`mt-1 ${errors.boasVindas ? "border-destructive" : ""}`}
            />
            {errors.boasVindas && (
              <p className="text-sm text-destructive mt-1">{errors.boasVindas}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>Perguntas Frequentes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFaq}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Adicionar Pergunta
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Configure respostas para as perguntas mais comuns. O chatbot inteligente também usará essas informações como base de conhecimento.
            </p>
            <div className="space-y-3 mt-2">
              {mensagens.faqs.map((faq, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`pergunta-${index}`} className="text-xs font-medium">
                        Pergunta {index + 1}
                      </Label>
                      {mensagens.faqs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFaq(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <Input
                        id={`pergunta-${index}`}
                        placeholder="Ex: Qual o horário de funcionamento?"
                        value={faq.pergunta}
                        onChange={(e) => handleInputChange("faq", `pergunta:${e.target.value}`, index)}
                        className={errors.faqs[index] ? "border-destructive" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`resposta-${index}`} className="text-xs">
                        Resposta {index + 1}
                      </Label>
                      <Textarea
                        id={`resposta-${index}`}
                        placeholder="Ex: Funcionamos de segunda a sexta das 6h às 22h, sábados das 8h às 18h..."
                        value={faq.resposta}
                        onChange={(e) => handleInputChange("faq", `resposta:${e.target.value}`, index)}
                        rows={2}
                        className={errors.faqs[index] ? "border-destructive" : ""}
                      />
                    </div>
                    {errors.faqs[index] && (
                      <p className="text-xs text-destructive">{errors.faqs[index]}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg mt-3">
              💡 <strong>Dica:</strong> Mantenha as respostas claras e específicas. Quanto mais informações úteis você adicionar, 
              melhor será o atendimento automático do seu chatbot!
            </div>
          </div>

          <div>
            <Label htmlFor="encerramento">Mensagem de Encerramento *</Label>
            <Textarea
              id="encerramento"
              placeholder="Digite a mensagem de encerramento..."
              value={mensagens.encerramento}
              onChange={(e) => handleInputChange("encerramento", e.target.value)}
              className={`mt-1 ${errors.encerramento ? "border-destructive" : ""}`}
            />
            {errors.encerramento && (
              <p className="text-sm text-destructive mt-1">{errors.encerramento}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotEditModal;