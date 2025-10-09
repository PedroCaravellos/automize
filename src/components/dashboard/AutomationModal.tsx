import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [activeTab, setActiveTab] = useState(automacao ? "flow" : "ai");
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
      setActiveTab("flow");
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
    if (!formData.negocio_id) {
      toast({
        title: "Erro",
        description: "Selecione um negócio antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    const dataToSave = {
      ...formData,
      nome: formData.nome || `Automação ${new Date().toLocaleString('pt-BR')}`,
    };

    onSave(dataToSave);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {automacao ? "Editar Automação" : "Nova Automação"}
          </DialogTitle>
          <DialogDescription>
            Selecione um negócio e crie sua automação. Edite tudo pelo Editor Visual.
          </DialogDescription>
        </DialogHeader>

        {!automacao && (
          <div className="mb-4 space-y-2">
            <Label htmlFor="negocio-select">Selecione o Negócio *</Label>
            <select
              id="negocio-select"
              value={formData.negocio_id}
              onChange={(e) => setFormData({ ...formData, negocio_id: e.target.value })}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="" disabled>Escolha um negócio</option>
              {negocios.map((negocio) => (
                <option key={negocio.id} value={negocio.id}>
                  {negocio.nome} {negocio.unidade && `- ${negocio.unidade}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            {!automacao && (
              <TabsTrigger value="ai">
                <Sparkles className="mr-2 h-4 w-4" />
                Criar com IA
              </TabsTrigger>
            )}
            <TabsTrigger value="flow">Editor Visual</TabsTrigger>
          </TabsList>

            <TabsContent value="ai">
              {!formData.negocio_id ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Selecione um negócio acima para continuar.
                </div>
              ) : (
                <AIAutomationCreator
                  negocioInfo={selectedNegocio}
                  onAutomationGenerated={handleAIAutomationGenerated}
                  onCancel={() => onOpenChange(false)}
                />
              )}
            </TabsContent>

          {activeTab === "flow" && (
            <TabsContent value="flow">
              <AutomationFlowBuilder
                automacao={automacao}
                initialBlocks={generatedBlocks}
                onSave={(nodes, edges) => {
                  console.log("Salvando fluxo:", nodes, edges);
                }}
              />
            </TabsContent>
          )}
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
