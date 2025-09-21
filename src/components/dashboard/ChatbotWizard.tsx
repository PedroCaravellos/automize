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
import { NegocioItem } from "@/contexts/AuthContext";
import { ChatbotTemplate, Chatbot } from "./ChatbotsSection";

interface ChatbotWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  negocios: NegocioItem[];
  templates: ChatbotTemplate[];
  onSave: (dados: {
    negocioId: string;
    template: string;
    mensagens: Chatbot["mensagens"];
  }) => void;
  onNavigateToNegocios?: () => void;
}

// Templates inteligentes que se adaptam às informações do negócio
const generateSmartTemplate = (negocio: NegocioItem | undefined, templateType: string) => {
  if (!negocio) return null;

  const baseTemplates = {
    "boas-vindas-faq": {
      nome: "Boas-vindas + FAQ",
      descricao: "Atendimento básico com perguntas frequentes personalizadas",
      mensagens: {
        boasVindas: `Olá! 👋 Bem-vindo(a) à ${negocio.nome}${negocio.unidade ? ` - ${negocio.unidade}` : ''}! Como posso ajudá-lo hoje?`,
        faqs: [
          {
            pergunta: "Qual o horário de funcionamento?",
            resposta: negocio.horarioFuncionamento || "Funcionamos de segunda a sexta das 6h às 22h, e aos sábados das 8h às 18h."
          },
          {
            pergunta: "Quais serviços vocês oferecem?",
            resposta: negocio.servicosOferecidos && negocio.servicosOferecidos.length > 0
              ? `Oferecemos: ${negocio.servicosOferecidos.join(', ')}. Venha conhecer nossa estrutura!` 
              : "Oferecemos diversos serviços de qualidade. Entre em contato para saber mais!"
          },
          {
            pergunta: "Onde vocês ficam localizados?",
            resposta: negocio.endereco 
              ? `Estamos localizados em: ${negocio.endereco}. ${negocio.telefone ? `Nosso telefone: ${negocio.telefone}` : ''}` 
              : "Estamos bem localizados na cidade. Entre em contato para saber mais sobre nossa localização!"
          }
        ],
        encerramento: `Obrigado pelo contato! Se precisar de mais alguma coisa, estarei aqui para ajudar. 💪 ${negocio.whatsapp ? `WhatsApp: ${negocio.whatsapp}` : ''}`
      }
    },
    "agendamentos": {
      nome: "Agendamentos personalizados",
      descricao: "Gestão de horários adaptada aos seus serviços",
      mensagens: {
        boasVindas: `Olá! 📅 Gostaria de agendar um horário na ${negocio.nome} ou tirar dúvidas sobre nossos serviços?`,
        faqs: [
          {
            pergunta: "Como posso agendar um serviço?",
            resposta: "Você pode agendar através deste chat, do nosso telefone ou presencialmente. Temos horários limitados."
          },
          {
            pergunta: "Quais serviços posso agendar?",
            resposta: negocio.servicosOferecidos && negocio.servicosOferecidos.length > 0
              ? `Você pode agendar: ${negocio.servicosOferecidos.join(', ')}. Me diga qual serviço te interessa!` 
              : "Temos vários serviços disponíveis. Me conte o que você gostaria!"
          },
          {
            pergunta: "Qual o horário de funcionamento?",
            resposta: negocio.horarioFuncionamento || "Funcionamos de segunda a sexta das 8h às 18h, e aos sábados das 8h às 12h."
          }
        ],
        encerramento: `Seu agendamento é importante para nós! ${negocio.telefone ? `Telefone: ${negocio.telefone}` : ''} Qualquer dúvida, estarei aqui. 🏋️‍♀️`
      }
    },
    "precos": {
      nome: "Informações e Preços",
      descricao: "Esclarecimentos sobre valores e planos personalizados",
      mensagens: {
        boasVindas: `Olá! 💳 Precisa de informações sobre nossos planos e valores na ${negocio.nome}? Estou aqui para ajudar!`,
        faqs: [
          {
            pergunta: "Quanto custam os serviços?",
            resposta: negocio.valores ? JSON.stringify(negocio.valores).replace(/[{}"\[\]]/g, ' ').trim() || "Temos vários planos que se adequam ao seu perfil. Entre em contato para conhecer nossas opções!" : "Temos vários planos que se adequam ao seu perfil. Entre em contato para conhecer nossas opções!"
          },
          {
            pergunta: "Vocês têm promoções?",
            resposta: negocio.promocoes || "Sempre temos ofertas especiais! Entre em contato para saber das promoções vigentes."
          },
          {
            pergunta: "Quais são os diferenciais do negócio?",
            resposta: negocio.diferenciais || "Nosso negócio oferece excelente qualidade, profissionais qualificados e atendimento diferenciado."
          }
        ],
        encerramento: `Espero ter esclarecido suas dúvidas! ${negocio.whatsapp ? `WhatsApp: ${negocio.whatsapp}` : ''} Conte conosco! 💙`
      }
    }
  };

  return baseTemplates[templateType as keyof typeof baseTemplates] || null;
};

const ChatbotWizard = ({ open, onOpenChange, negocios, templates, onSave, onNavigateToNegocios }: ChatbotWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedNegocio, setSelectedNegocio] = useState("");
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

  // Templates inteligentes baseados no negócio selecionado
  const smartTemplates = [
    { id: "boas-vindas-faq", type: "boas-vindas-faq" },
    { id: "agendamentos", type: "agendamentos" },
    { id: "precos", type: "precos" }
  ].map(template => {
    const negocio = negocios.find(n => n.id === selectedNegocio);
    const smartTemplate = generateSmartTemplate(negocio, template.type);
    return smartTemplate ? { id: template.id, ...smartTemplate } : null;
  }).filter(Boolean) as ChatbotTemplate[];

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedNegocio("");
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
      negocioId: selectedNegocio,
      template: selectedTemplate,
      mensagens
    });
    handleClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedNegocio !== "";
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

  const renderStep1 = () => {
    console.log('ChatbotWizard - Negócios recebidos:', negocios);
    
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="negocio">Selecionar Negócio *</Label>
          <Select value={selectedNegocio} onValueChange={setSelectedNegocio}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um negócio" />
            </SelectTrigger>
            <SelectContent>
              {negocios.map((negocio) => (
                <SelectItem key={negocio.id} value={negocio.id}>
                  <div className="flex items-center gap-2">
                    <span>{negocio.nome}</span>
                    {negocio.unidade && (
                      <Badge variant="outline" className="text-xs">
                        {negocio.unidade}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {negocios.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-6 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Você precisa ter pelo menos um negócio cadastrado
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  onNavigateToNegocios?.();
                  onOpenChange(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar negócio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderStep2 = () => {
    const negocio = negocios.find(n => n.id === selectedNegocio);
    
    return (
      <div className="space-y-4">
        {negocio && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900">Negócio Selecionado</h4>
              <p className="text-sm text-blue-700 mt-1">
                {negocio.nome} {negocio.unidade && `- ${negocio.unidade}`}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Os templates abaixo foram personalizados com as informações deste negócio
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
                    <li className="text-xs text-muted-foreground">• {template.mensagens.faqs.length} perguntas adaptadas ao seu negócio</li>
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
          💡 <strong>Dica:</strong> Adicione perguntas específicas sobre seu negócio, serviços, preços, 
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
      case 1: return "Selecionar Negócio";
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