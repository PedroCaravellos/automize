import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  academia_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  origem: string;
  status: string;
  pipeline_stage: string;
  observacoes?: string;
  valor_estimado?: number;
  created_at: string;
}

interface EditLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onLeadUpdated: () => void;
}

export default function EditLeadModal({
  open,
  onOpenChange,
  lead,
  onLeadUpdated
}: EditLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    origem: "",
    status: "",
    pipeline_stage: "",
    observacoes: "",
    valor_estimado: ""
  });

  // Populate form when lead changes
  useEffect(() => {
    if (lead) {
      setFormData({
        nome: lead.nome || "",
        telefone: lead.telefone || "",
        email: lead.email || "",
        origem: lead.origem || "",
        status: lead.status || "",
        pipeline_stage: lead.pipeline_stage || "",
        observacoes: lead.observacoes || "",
        valor_estimado: lead.valor_estimado ? lead.valor_estimado.toString() : ""
      });
    } else {
      setFormData({
        nome: "",
        telefone: "",
        email: "",
        origem: "",
        status: "",
        pipeline_stage: "",
        observacoes: "",
        valor_estimado: ""
      });
    }
  }, [lead, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lead || !formData.nome || !formData.status || !formData.pipeline_stage) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          nome: formData.nome,
          telefone: formData.telefone || null,
          email: formData.email || null,
          origem: formData.origem,
          status: formData.status,
          pipeline_stage: formData.pipeline_stage,
          observacoes: formData.observacoes || null,
          valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : null
        })
        .eq('id', lead.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Lead atualizado com sucesso."
      });

      onOpenChange(false);
      onLeadUpdated();
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lead.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      novo: 'Novo',
      contatado: 'Contatado',
      qualificado: 'Qualificado',
      perdido: 'Perdido',
      convertido: 'Convertido',
    };
    return colors[status as keyof typeof colors] || status;
  };

  const getPipelineStageLabel = (stage: string) => {
    const labels = {
      inicial: 'Inicial',
      interesse: 'Interesse',
      visita_agendada: 'Visita Agendada',
      proposta: 'Proposta',
      fechamento: 'Fechamento',
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Lead *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome completo do lead"
              required
            />
          </div>

          {/* Contatos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="lead@email.com"
              />
            </div>
          </div>

          {/* Origem */}
          <div className="space-y-2">
            <Label>Origem</Label>
            <Select 
              value={formData.origem} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, origem: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Origem do lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chatbot">Chatbot</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="indicacao">Indicação</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status e Pipeline Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status do lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contatado">Contatado</SelectItem>
                  <SelectItem value="qualificado">Qualificado</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Etapa do Pipeline *</Label>
              <Select 
                value={formData.pipeline_stage} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, pipeline_stage: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Etapa do pipeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inicial">Inicial</SelectItem>
                  <SelectItem value="interesse">Interesse</SelectItem>
                  <SelectItem value="visita_agendada">Visita Agendada</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="fechamento">Fechamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Valor Estimado */}
          <div className="space-y-2">
            <Label htmlFor="valor_estimado">Valor Estimado (R$)</Label>
            <Input
              id="valor_estimado"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor_estimado}
              onChange={(e) => setFormData(prev => ({ ...prev, valor_estimado: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre o lead..."
              rows={4}
            />
          </div>

          {/* Informações do Lead */}
          <div className="bg-muted p-3 rounded-lg text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>Status Atual:</strong> {getStatusColor(lead.status)}
              </div>
              <div>
                <strong>Pipeline:</strong> {getPipelineStageLabel(lead.pipeline_stage)}
              </div>
              <div>
                <strong>Criado em:</strong> {new Date(lead.created_at).toLocaleDateString('pt-BR')}
              </div>
              <div>
                <strong>Origem:</strong> {lead.origem}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}