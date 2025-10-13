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
  const { negocios, syncNegociosFromDB } = useAuth();
  const [activeTab, setActiveTab] = useState(automacao ? "flow" : "ai");
  const [generatedBlocks, setGeneratedBlocks] = useState<any[]>([]);
  const [generatedAutomation, setGeneratedAutomation] = useState<any>(null);
  const [flowData, setFlowData] = useState<{ nodes: any[], edges: any[] } | null>(null);
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

  // Carrega negócios ao abrir o modal, caso ainda não estejam disponíveis
  useEffect(() => {
    if (open && (!negocios || negocios.length === 0)) {
      console.info('AutomationModal: sincronizando negócios...');
      try {
        syncNegociosFromDB?.();
      } catch (e) {
        console.error('Falha ao sincronizar negócios', e);
      }
    }
  }, [open]);

  // Log de depuração para confirmar o carregamento
  useEffect(() => {
    console.info('AutomationModal: negócios disponíveis', negocios?.length ?? 0);
  }, [negocios]);

  const handleAIAutomationGenerated = (aiAutomation: any) => {
    setGeneratedAutomation(aiAutomation);
    setFormData({
      nome: aiAutomation.nome,
      descricao: aiAutomation.descricao,
      negocio_id: formData.negocio_id,
      trigger_type: aiAutomation.trigger_type,
      trigger_config: aiAutomation.trigger_config || {},
      actions: aiAutomation.actions || {},
    });
    setGeneratedBlocks(aiAutomation.blocos || []);
    
    // Se temos blocos gerados pela IA, preparar o flowData automaticamente
    if (aiAutomation.blocos && aiAutomation.blocos.length > 0) {
      const nodes = aiAutomation.blocos.map((block: any, index: number) => ({
        id: block.id || `node-${index}`,
        type: block.tipo === 'trigger' ? 'input' : 'default',
        data: { 
          label: block.label,
          nodeType: block.tipo,
        },
        position: block.posicao || { x: 250, y: 50 + (index * 100) }
      }));
      
      const edges = [];
      for (let i = 0; i < aiAutomation.blocos.length - 1; i++) {
        edges.push({
          id: `edge-${i}`,
          source: aiAutomation.blocos[i].id || `node-${i}`,
          target: aiAutomation.blocos[i + 1].id || `node-${i + 1}`,
          type: 'smoothstep',
          animated: true,
        });
      }
      
      setFlowData({ nodes, edges });
    }
    
    setActiveTab("flow");
    toast({
      title: "Pronto para editar!",
      description: "Ajuste o fluxo visual conforme necessário e salve.",
    });
  };

  const handleResetAutomation = () => {
    setGeneratedAutomation(null);
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
      // Incluir dados do fluxo visual se existirem
      ...(flowData && {
        trigger_config: {
          ...formData.trigger_config,
          flow_nodes: flowData.nodes,
          flow_edges: flowData.edges,
        }
      })
    };

    console.log('Salvando automação com dados:', dataToSave);

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
            <Select
              value={formData.negocio_id}
              onValueChange={(value) => setFormData({ ...formData, negocio_id: value })}
            >
              <SelectTrigger id="negocio-select" className="w-full">
                <SelectValue placeholder="Escolha um negócio" />
              </SelectTrigger>
              <SelectContent className="z-[1000] bg-popover">
                {negocios?.map((negocio) => (
                  <SelectItem key={negocio.id} value={negocio.id}>
                    {negocio.nome} {negocio.unidade && `- ${negocio.unidade}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  generatedAutomation={generatedAutomation}
                  onAutomationGenerated={handleAIAutomationGenerated}
                  onReset={handleResetAutomation}
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
                  setFlowData({ nodes, edges });
                  toast({
                    title: "Fluxo salvo",
                    description: "O fluxo foi salvo temporariamente. Clique em 'Salvar' abaixo para salvar a automação completa.",
                  });
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
