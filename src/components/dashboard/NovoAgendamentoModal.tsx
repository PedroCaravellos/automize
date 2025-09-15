import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";


interface Negocio {
  id: string;
  nome: string;
  unidade: string | null;
}

interface NovoAgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgendamentoCriado: () => void;
}

export default function NovoAgendamentoModal({
  open,
  onOpenChange,
  onAgendamentoCriado
}: NovoAgendamentoModalProps) {
  
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNegocios, setLoadingNegocios] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: "",
    cliente_telefone: "",
    cliente_email: "",
    servico: "",
    negocio_id: "",
    data: undefined as Date | undefined,
    hora: "",
    status: "agendado" as const,
    observacoes: ""
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
      cliente_nome: "",
      cliente_telefone: "",
      cliente_email: "",
      servico: "",
      negocio_id: "",
      data: undefined,
      hora: "",
      status: "agendado",
      observacoes: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_nome || !formData.servico || !formData.negocio_id || !formData.data || !formData.hora) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Combinar data e hora
      const [hours, minutes] = formData.hora.split(':');
      const dataHora = new Date(formData.data);
      dataHora.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase
        .from('agendamentos')
        .insert({
          cliente_nome: formData.cliente_nome,
          cliente_telefone: formData.cliente_telefone || null,
          cliente_email: formData.cliente_email || null,
          servico: formData.servico,
          negocio_id: formData.negocio_id,
          data_hora: dataHora.toISOString(),
          status: formData.status,
          observacoes: formData.observacoes || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Agendamento criado com sucesso."
      });

      resetForm();
      onOpenChange(false);
      onAgendamentoCriado();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
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
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente Nome */}
          <div className="space-y-2">
            <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
            <Input
              id="cliente_nome"
              value={formData.cliente_nome}
              onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
              placeholder="Nome completo do cliente"
              required
            />
          </div>

          {/* Contatos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente_telefone">Telefone</Label>
              <Input
                id="cliente_telefone"
                value={formData.cliente_telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente_email">E-mail</Label>
              <Input
                id="cliente_email"
                type="email"
                value={formData.cliente_email}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_email: e.target.value }))}
                placeholder="cliente@email.com"
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

          {/* Serviço */}
          <div className="space-y-2">
            <Label htmlFor="servico">Serviço *</Label>
            <Input
              id="servico"
              value={formData.servico}
              onChange={(e) => setFormData(prev => ({ ...prev, servico: e.target.value }))}
              placeholder="Ex: Avaliação física, Treino personalizado, etc."
              required
            />
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data ? format(formData.data, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data}
                    onSelect={(date) => setFormData(prev => ({ ...prev, data: date }))}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora *</Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Status */}
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
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre o agendamento..."
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
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}