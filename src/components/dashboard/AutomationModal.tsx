import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutomationFlowBuilder from "./AutomationFlowBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface AutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automacao?: any;
  onSave: (data: any) => void;
}

export default function AutomationModal({ open, onOpenChange, automacao, onSave }: AutomationModalProps) {
  const { negocios } = useAuth();
  const [activeTab, setActiveTab] = useState("config");
  const [formData, setFormData] = useState({
    nome: automacao?.nome || "",
    descricao: automacao?.descricao || "",
    negocio_id: automacao?.negocio_id || "",
    trigger_type: automacao?.trigger_type || "novo_lead",
    trigger_config: automacao?.trigger_config || {},
    actions: automacao?.actions || {},
  });

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="flow">Fluxo Visual</TabsTrigger>
          </TabsList>

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
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um negócio" />
                </SelectTrigger>
                <SelectContent>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
