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
import { ChevronLeft, ChevronRight, Building2, Plus, Trash2 } from "lucide-react";
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

// Templates inteligentes que se adaptam às informações da academia
const generateSmartTemplate = (academia: Academia | undefined, templateType: string) => {
  if (!academia) return null;

  const baseTemplates = {
    "boas-vindas-faq": {
      nome: "Boas-vindas + FAQ",
      descricao: "Atendimento básico com perguntas frequentes personalizadas",
      mensagens: {
        boasVindas: `Olá! 👋 Bem-vindo(a) à ${academia.nome}${academia.unidade ? ` - ${academia.unidade}` : ''}! Como posso ajudá-lo hoje?`,
        faqs: [
          {
            pergunta: "Qual o horário de funcionamento?",
            resposta: academia.horarios || "Funcionamos de segunda a sexta das 6h às 22h, e aos sábados das 8h às 18h."
          },
          {
            pergunta: "Quais modalidades vocês oferecem?",
            resposta: academia.modalidades 
              ? `Oferecemos: ${academia.modalidades}. Venha conhecer nossa estrutura!` 
              : "Oferecemos musculação, aulas funcionais, spinning, pilates e natação. Consulte nossa grade de horários!"
          },
          {
            pergunta: "Onde vocês ficam localizados?",
            resposta: academia.endereco 
              ? `Estamos localizados em: ${academia.endereco}. ${academia.telefone ? `Nosso telefone: ${academia.telefone}` : ''}` 
              : "Estamos bem localizados na cidade. Entre em contato para saber mais sobre nossa localização!"
          }
        ],
        encerramento: `Obrigado pelo contato! Se precisar de mais alguma coisa, estarei aqui para ajudar. 💪 ${academia.whatsapp ? `WhatsApp: ${academia.whatsapp}` : ''}`
      }
    },
    "agendamentos": {
      nome: "Agendamentos personalizados",
      descricao: "Gestão de horários adaptada às suas modalidades",
      mensagens: {
        boasVindas: `Olá! 📅 Gostaria de agendar um horário na ${academia.nome} ou tirar dúvidas sobre nossas modalidades?`,
        faqs: [
          {
            pergunta: "Como posso agendar uma aula?",
            resposta: "Você pode agendar através deste chat, do nosso app ou presencialmente na recepção. As aulas têm limite de vagas."
          },
          {
            pergunta: "Quais modalidades posso agendar?",
            resposta: academia.modalidades 
              ? `Você pode agendar: ${academia.modalidades}. Me diga qual modalidade te interessa!` 
              : "Temos várias modalidades disponíveis. Me conte o que você gostaria de praticar!"
          },
          {
            pergunta: "Qual o horário de funcionamento?",
            resposta: academia.horarios || "Funcionamos de segunda a sexta das 6h às 22h, e aos sábados das 8h às 18h."
          }
        ],
        encerramento: `Seu agendamento é importante para nós! ${academia.telefone ? `Telefone: ${academia.telefone}` : ''} Qualquer dúvida, estarei aqui. 🏋️‍♀️`
      }
    },
    "precos": {
      nome: "Informações e Preços",
      descricao: "Esclarecimentos sobre valores e planos personalizados",
      mensagens: {
        boasVindas: `Olá! 💳 Precisa de informações sobre nossos planos e valores na ${academia.nome}? Estou aqui para ajudar!`,
        faqs: [
          {
            pergunta: "Quanto custa a mensalidade?",
            resposta: academia.valores || "Temos vários planos que se adequam ao seu perfil. Que tal agendar uma visita para conhecer nossas opções?"
          },
          {
            pergunta: "Vocês têm promoções?",
            resposta: academia.promocoes || "Sempre temos ofertas especiais! Entre em contato para saber das promoções vigentes."
          },
          {
            pergunta: "Quais são os diferenciais da academia?",
            resposta: academia.diferenciais || "Nossa academia oferece excelente estrutura, profissionais qualificados e ambiente acolhedor."
          }
        ],
        encerramento: `Espero ter esclarecido suas dúvidas! ${academia.whatsapp ? `WhatsApp: ${academia.whatsapp}` : ''} Conte conosco! 💙`
      }
    }
  };

  return baseTemplates[templateType as keyof typeof baseTemplates] || null;
};

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

  // Templates inteligentes baseados na academia selecionada
  const smartTemplates = [
    { id: "boas-vindas-faq", type: "boas-vindas-faq" },
    { id: "agendamentos", type: "agendamentos" },
    { id: "precos", type: "precos" }
  ].map(template => {
    const academia = academias.find(a => a.id === selectedAcademia);
    const smartTemplate = generateSmartTemplate(academia, template.type);
    return smartTemplate ? { id: template.id, ...smartTemplate } : null;
  }).filter(Boolean) as ChatbotTemplate[];

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
      const template = smartTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setMensagens(template.mensagens);
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const addFaq = () => {
    setMensagens(prev => ({
      ...prev,
      faqs: [...prev.faqs, { pergunta: "", resposta: "" }]
    }));
  };

  const removeFaq = (index: number) => {
    if (mensagens.faqs.length > 1) {
      setMensagens(prev => ({
        ...prev,
        faqs: prev.faqs.filter((_, i) => i !== index)
      }));
    }
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

  const renderStep2 = () => {
    const academia = academias.find(a => a.id === selectedAcademia);
    
    return (
      <div className="space-y-4">
        {academia && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900">Academia Selecionada</h4>
              <p className="text-sm text-blue-700 mt-1">
                {academia.nome} {academia.unidade && `- ${academia.unidade}`}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Os templates abaixo foram personalizados com as informações desta academia
              </p>
            </CardContent>
          </Card>
        )}
        
        <div>
          <Label>Escolher Template Inteligente *</Label>
          <div className="grid gap-3 mt-2">
            {smartTemplates.map((template) => (
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
                    <li className="text-xs text-muted-foreground">• Mensagem personalizada de boas-vindas</li>
                    <li className="text-xs text-muted-foreground">• {template.mensagens.faqs.length} perguntas adaptadas à sua academia</li>
                    <li className="text-xs text-muted-foreground">• Mensagem de encerramento com seus contatos</li>
                    <li className="text-xs text-green-600">• ✨ Você poderá adicionar mais perguntas no próximo passo</li>
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

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
          rows={2}
        />
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
                    placeholder="Digite a resposta que o bot deve dar..."
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
        
        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          💡 <strong>Dica:</strong> Adicione perguntas específicas sobre sua academia, modalidades, preços, 
          horários especiais, etc. Quanto mais personalizado, melhor será o atendimento!
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
          rows={2}
        />
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Vincular Academia";
      case 2: return "Template Inteligente";
      case 3: return "Personalizar Mensagens";
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