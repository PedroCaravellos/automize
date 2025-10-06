import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutomationFlowBuilder from "./AutomationFlowBuilder";
import AIAutomationCreator from "./AIAutomationCreator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

interface AutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automacao?: any;
  onSave: (data: any) => void;
}

export default function AutomationModal({ open, onOpenChange, automacao, onSave }: AutomationModalProps) {
  const { negocios } = useAuth();
  const [activeTab, setActiveTab] = useState(automacao ? "config" : "ai");
  const [generatedBlocks, setGeneratedBlocks] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nome: automacao?.nome || "",
    descricao: automacao?.descricao || "",
    negocio_id: automacao?.negocio_id || "",
    trigger_type: automacao?.trigger_type || "novo_lead",
    trigger_config: automacao?.trigger_config || {},
    actions: automacao?.actions || {},
  });

  useEffect(() => {
    if (automacao) {
      setActiveTab("config");
    } else {
      setActiveTab("ai");
    }
  }, [automacao]);

  const handleAIAutomationGenerated = (aiAutomation: any) => {
    setFormData({
      nome: aiAutomation.nome,
      descricao: aiAutomation.descricao,
      negocio_id: formData.negocio_id,
      trigger_type: aiAutomation.trigger_type,
      trigger_config: aiAutomation.trigger_config || {},
      actions: aiAutomation.actions || {},
    });
    setGeneratedBlocks(aiAutomation.blocos || []);
    setActiveTab("flow");
    toast({
      title: "Pronto para editar!",
      description: "Ajuste o fluxo visual conforme necessário e salve.",
    });
  };

  const selectedNegocio = negocios.find(n => n.id === formData.negocio_id);

  const handleSave = () => {
    if (!formData.nome || !formData.negocio_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {automacao ? "Editar Automação" : "Nova Automação"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            {!automacao && (
              <TabsTrigger value="ai">
                <Sparkles className="mr-2 h-4 w-4" />
                Criar com IA
              </TabsTrigger>
            )}
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="flow">Fluxo Visual</TabsTrigger>
          </TabsList>

          {!automacao && (
            <TabsContent value="ai">
              {!formData.negocio_id ? (
                <div className="space-y-4 py-8">
                  <div className="text-center mb-4">
                    <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Criar Automação com IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Primeiro, selecione um negócio para personalizar sua automação
                    </p>
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <Label htmlFor="negocio-ai">Selecione o Negócio *</Label>
                    <Select
                      value={formData.negocio_id}
                      onValueChange={(value) => setFormData({ ...formData, negocio_id: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Escolha um negócio" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {negocios.map((negocio) => (
                          <SelectItem key={negocio.id} value={negocio.id}>
                            {negocio.nome} {negocio.unidade && `- ${negocio.unidade}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <AIAutomationCreator
                  negocioInfo={selectedNegocio}
                  onAutomationGenerated={handleAIAutomationGenerated}
                  onCancel={() => onOpenChange(false)}
                />
              )}
            </TabsContent>
          )}

          <TabsContent value="config" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Automação *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Follow-up de leads"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o objetivo desta automação"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negocio">Negócio *</Label>
              <Select
                value={formData.negocio_id}
                onValueChange={(value) => setFormData({ ...formData, negocio_id: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione um negócio" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {negocios.map((negocio) => (
                    <SelectItem key={negocio.id} value={negocio.id}>
                      {negocio.nome} {negocio.unidade && `- ${negocio.unidade}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger">Gatilho</Label>
              <Select
                value={formData.trigger_type}
                onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="novo_lead">Novo Lead</SelectItem>
                  <SelectItem value="agendamento">Novo Agendamento</SelectItem>
                  <SelectItem value="follow_up">Follow-up Automático</SelectItem>
                  <SelectItem value="tempo_decorrido">Tempo Decorrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.trigger_type === "tempo_decorrido" && (
              <div className="space-y-2">
                <Label htmlFor="delay">Aguardar (horas)</Label>
                <Input
                  id="delay"
                  type="number"
                  value={formData.trigger_config?.delay_hours || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trigger_config: { ...formData.trigger_config, delay_hours: parseInt(e.target.value) },
                    })
                  }
                  placeholder="1"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem Template</Label>
              <Textarea
                id="mensagem"
                value={formData.actions?.send_message?.template || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    actions: {
                      ...formData.actions,
                      send_message: {
                        template: e.target.value,
                        channel: "whatsapp",
                      },
                    },
                  })
                }
                placeholder="Olá {nome}! Obrigado pelo interesse..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{nome}"} para inserir o nome do lead dinamicamente
              </p>
            </div>
          </TabsContent>

          <TabsContent value="flow">
            <AutomationFlowBuilder
              automacao={automacao}
              initialBlocks={generatedBlocks}
              onSave={(nodes, edges) => {
                console.log("Salvando fluxo:", nodes, edges);
              }}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
