import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Building2, Plus } from "lucide-react";
import { Academia } from "./AcademiasSection";
import { ChatbotTemplate, Chatbot } from "./ChatbotsSection";

interface ChatbotWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academias: Academia[];
  templates: ChatbotTemplate[];
  onSave: (dados: {
    academiaId: string;
    template: string;
    mensagens: Chatbot["mensagens"];
  }) => void;
}

const ChatbotWizard = ({ open, onOpenChange, academias, templates, onSave }: ChatbotWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAcademia, setSelectedAcademia] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [mensagens, setMensagens] = useState<Chatbot["mensagens"]>({
    boasVindas: "",
    faqs: [
      { pergunta: "", resposta: "" },
      { pergunta: "", resposta: "" },
      { pergunta: "", resposta: "" }
    ],
    encerramento: ""
  });

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedAcademia("");
    setSelectedTemplate("");
    setMensagens({
      boasVindas: "",
      faqs: [
        { pergunta: "", resposta: "" },
        { pergunta: "", resposta: "" },
        { pergunta: "", resposta: "" }
      ],
      encerramento: ""
    });
    onOpenChange(false);
  };

  const handleNext = () => {
    if (currentStep === 2 && selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setMensagens(template.mensagens);
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = () => {
    onSave({
      academiaId: selectedAcademia,
      template: selectedTemplate,
      mensagens
    });
    handleClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedAcademia !== "";
      case 2:
        return selectedTemplate !== "";
      case 3:
        return mensagens.boasVindas.trim() !== "" && 
               mensagens.encerramento.trim() !== "" &&
               mensagens.faqs.some(faq => faq.pergunta.trim() !== "" && faq.resposta.trim() !== "");
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="academia">Selecionar Academia *</Label>
        <Select value={selectedAcademia} onValueChange={setSelectedAcademia}>
          <SelectTrigger>
            <SelectValue placeholder="Escolha uma academia" />
          </SelectTrigger>
          <SelectContent>
            {academias.map((academia) => (
              <SelectItem key={academia.id} value={academia.id}>
                <div className="flex items-center gap-2">
                  <span>{academia.nome}</span>
                  <Badge variant="outline" className="text-xs">
                    {academia.unidade}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {academias.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Você precisa ter pelo menos uma academia cadastrada
            </p>
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar academia
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label>Escolher Template *</Label>
        <div className="grid gap-3 mt-2">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-colors ${
                selectedTemplate === template.id 
                  ? "border-primary bg-primary/5" 
                  : "hover:border-muted-foreground/50"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{template.nome}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.descricao}
                    </p>
                  </div>
                  {selectedTemplate === template.id && (
                    <Badge variant="default" className="ml-2">Selecionado</Badge>
                  )}
                </div>
                <ul className="mt-3 space-y-1">
                  <li className="text-xs text-muted-foreground">• Mensagem de boas-vindas</li>
                  <li className="text-xs text-muted-foreground">• {template.mensagens.faqs.length} perguntas frequentes</li>
                  <li className="text-xs text-muted-foreground">• Mensagem de encerramento</li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div>
        <Label htmlFor="boas-vindas">Mensagem de Boas-vindas *</Label>
        <Textarea
          id="boas-vindas"
          placeholder="Digite a mensagem de boas-vindas..."
          value={mensagens.boasVindas}
          onChange={(e) => setMensagens(prev => ({ ...prev, boasVindas: e.target.value }))}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Perguntas Frequentes</Label>
        <div className="space-y-3 mt-2">
          {mensagens.faqs.map((faq, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-2">
                <div>
                  <Label htmlFor={`pergunta-${index}`} className="text-xs">
                    Pergunta {index + 1}
                  </Label>
                  <Input
                    id={`pergunta-${index}`}
                    placeholder="Digite a pergunta..."
                    value={faq.pergunta}
                    onChange={(e) => {
                      const newFaqs = [...mensagens.faqs];
                      newFaqs[index].pergunta = e.target.value;
                      setMensagens(prev => ({ ...prev, faqs: newFaqs }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor={`resposta-${index}`} className="text-xs">
                    Resposta {index + 1}
                  </Label>
                  <Textarea
                    id={`resposta-${index}`}
                    placeholder="Digite a resposta..."
                    value={faq.resposta}
                    onChange={(e) => {
                      const newFaqs = [...mensagens.faqs];
                      newFaqs[index].resposta = e.target.value;
                      setMensagens(prev => ({ ...prev, faqs: newFaqs }));
                    }}
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="encerramento">Mensagem de Encerramento *</Label>
        <Textarea
          id="encerramento"
          placeholder="Digite a mensagem de encerramento..."
          value={mensagens.encerramento}
          onChange={(e) => setMensagens(prev => ({ ...prev, encerramento: e.target.value }))}
          className="mt-1"
        />
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Vincular Academia";
      case 2: return "Escolher Template";
      case 3: return "Mensagens Padrão";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Chatbot - {getStepTitle()}</DialogTitle>
          <DialogDescription>
            Passo {currentStep} de 3 - Configure seu chatbot em alguns minutos
          </DialogDescription>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step <= currentStep 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div 
                    className={`w-8 h-0.5 mx-2 ${
                      step < currentStep ? "bg-primary" : "bg-muted"
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            
            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={!canProceed()}>
                Concluir
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotWizard;