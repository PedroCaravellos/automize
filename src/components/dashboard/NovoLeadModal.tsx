import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Negocio {
  id: string;
  nome: string;
  unidade: string | null;
}

interface NovoLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCriado: () => void;
}

export default function NovoLeadModal({
  open,
  onOpenChange,
  onLeadCriado
}: NovoLeadModalProps) {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNegocios, setLoadingNegocios] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    negocio_id: "",
    origem: "" as "chatbot" | "whatsapp" | "site" | "indicacao" | "outro" | "",
    status: "novo" as const,
    pipeline_stage: "inicial" as const,
    interesse: "",
    observacoes: "",
    valor_estimado: ""
  });

  // Fetch negocios from database when modal opens
  useEffect(() => {
    if (open) {
      fetchNegocios();
    }
  }, [open]);

  const fetchNegocios = async () => {
    setLoadingNegocios(true);
    try {
      const { data, error } = await supabase
        .from('negocios')
        .select('id, nome, unidade');

      if (error) {
        throw error;
      }

      setNegocios((data || []) as Negocio[]);
    } catch (error) {
      console.error('Erro ao buscar negócios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os negócios.",
        variant: "destructive"
      });
    } finally {
      setLoadingNegocios(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      telefone: "",
      email: "",
      negocio_id: "",
      origem: "",
      status: "novo",
      pipeline_stage: "inicial",
      interesse: "",
      observacoes: "",
      valor_estimado: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.negocio_id || !formData.origem) {
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
        .insert({
          nome: formData.nome,
          telefone: formData.telefone || null,
          email: formData.email || null,
          negocio_id: formData.negocio_id,
          origem: formData.origem,
          status: formData.status,
          pipeline_stage: formData.pipeline_stage,
          observacoes: formData.interesse ? `${formData.interesse}${formData.observacoes ? ' | ' + formData.observacoes : ''}` : formData.observacoes || null,
          valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Lead criado com sucesso."
      });

      resetForm();
      onOpenChange(false);
      onLeadCriado();
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
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

          {/* Negócio */}
          <div className="space-y-2">
            <Label>Negócio *</Label>
            <Select 
              value={formData.negocio_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, negocio_id: value }))}
              disabled={loadingNegocios}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingNegocios ? "Carregando..." : "Selecione um negócio"} />
              </SelectTrigger>
              <SelectContent>
                {negocios.map((negocio) => (
                  <SelectItem key={negocio.id} value={negocio.id}>
                    {negocio.nome}{negocio.unidade ? ` - ${negocio.unidade}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Origem */}
          <div className="space-y-2">
            <Label>Origem *</Label>
            <Select 
              value={formData.origem} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, origem: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Como conheceu a academia?" />
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

          {/* Status e Pipeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label>Etapa do Pipeline</Label>
              <Select 
                value={formData.pipeline_stage} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, pipeline_stage: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
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

          {/* Interesse e valor estimado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interesse">Interesse Principal</Label>
              <Input
                id="interesse"
                value={formData.interesse}
                onChange={(e) => setFormData(prev => ({ ...prev, interesse: e.target.value }))}
                placeholder="Ex: Musculação, Natação..."
              />
            </div>
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
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre o lead..."
              rows={3}
            />
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
              {loading ? "Criando..." : "Criar Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}