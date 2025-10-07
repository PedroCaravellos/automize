import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BlockEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: any;
  onSave: (updatedBlock: any) => void;
}

export default function BlockEditModal({ open, onOpenChange, block, onSave }: BlockEditModalProps) {
  const [formData, setFormData] = useState({
    label: "",
    nodeType: "",
    content: "",
    timeValue: "",
    timeUnit: "minutos",
    condition: "",
    webhookUrl: "",
  });

  useEffect(() => {
    if (block) {
      setFormData({
        label: block.data?.label || "",
        nodeType: block.data?.nodeType || block.type || "",
        content: block.data?.content || "",
        timeValue: block.data?.time?.valor || "",
        timeUnit: block.data?.time?.unidade || "minutos",
        condition: block.data?.condition || "",
        webhookUrl: block.data?.webhookUrl || "",
      });
    }
  }, [block]);

  const handleSave = () => {
    const updatedBlock = {
      ...block,
      data: {
        ...block.data,
        label: formData.label,
        nodeType: formData.nodeType,
        content: formData.content,
        time: formData.timeValue ? {
          valor: formData.timeValue,
          unidade: formData.timeUnit,
        } : undefined,
        condition: formData.condition,
        webhookUrl: formData.webhookUrl,
      },
    };
    onSave(updatedBlock);
    onOpenChange(false);
  };

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'trigger': return 'Gatilho';
      case 'message': return 'Mensagem';
      case 'delay': return 'Aguardar';
      case 'condition': return 'Condição';
      case 'webhook': return 'Webhook';
      default: return 'Bloco';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Bloco - {getNodeTypeLabel(formData.nodeType)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Nome do Bloco *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Ex: Mensagem de Boas-vindas"
            />
          </div>

          {formData.nodeType === 'trigger' && (
            <div className="space-y-2">
              <Label htmlFor="triggerType">Tipo de Gatilho</Label>
              <Select
                value={formData.content || "novo_lead"}
                onValueChange={(value) => setFormData({ ...formData, content: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="novo_lead">Novo Lead</SelectItem>
                  <SelectItem value="agendamento">Novo Agendamento</SelectItem>
                  <SelectItem value="follow_up">Follow-up Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.nodeType === 'message' && (
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo da Mensagem *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Olá {nome}! Bem-vindo..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{nome}"}, {"{email}"}, {"{telefone}"} para personalizar
              </p>
            </div>
          )}

          {formData.nodeType === 'delay' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeValue">Tempo de Espera *</Label>
                <Input
                  id="timeValue"
                  type="number"
                  value={formData.timeValue}
                  onChange={(e) => setFormData({ ...formData, timeValue: e.target.value })}
                  placeholder="1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeUnit">Unidade</Label>
                <Select
                  value={formData.timeUnit}
                  onValueChange={(value) => setFormData({ ...formData, timeUnit: value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="minutos">Minutos</SelectItem>
                    <SelectItem value="horas">Horas</SelectItem>
                    <SelectItem value="dias">Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {formData.nodeType === 'condition' && (
            <div className="space-y-2">
              <Label htmlFor="condition">Condição *</Label>
              <Select
                value={formData.condition || "respondeu"}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione uma condição" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="respondeu">Lead Respondeu</SelectItem>
                  <SelectItem value="nao_respondeu">Lead Não Respondeu</SelectItem>
                  <SelectItem value="abriu_link">Lead Abriu Link</SelectItem>
                  <SelectItem value="agendou">Lead Agendou</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.nodeType === 'webhook' && (
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">URL do Webhook *</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://sua-api.com/webhook"
              />
              <p className="text-xs text-muted-foreground">
                Será enviado um POST com os dados do lead
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!formData.label}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
