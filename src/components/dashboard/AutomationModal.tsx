import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AutomationFlowBuilderWrapper } from './AutomationFlowBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  MessageSquare, 
  Clock, 
  Calendar,
  UserPlus,
  Activity
} from 'lucide-react';

interface Automacao {
  id?: string;
  nome: string;
  descricao?: string;
  trigger_type: string;
  trigger_config: any;
  actions: any;
  ativo: boolean;
  negocio_id: string;
  created_at?: string;
}

interface AutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automacao?: Automacao;
  negocioId: string;
  onSave: (automacao: Automacao) => void;
}

const triggerTypes = [
  {
    value: 'novo_lead',
    label: 'Novo Lead Criado',
    icon: <UserPlus className="h-4 w-4" />,
    description: 'Dispara quando um novo lead é criado no sistema'
  },
  {
    value: 'agendamento',
    label: 'Agendamento Realizado',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Dispara quando um agendamento é feito'
  },
  {
    value: 'mensagem_recebida',
    label: 'Mensagem Recebida',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Dispara quando uma mensagem é recebida do cliente'
  },
  {
    value: 'tempo_inatividade',
    label: 'Tempo de Inatividade',
    icon: <Clock className="h-4 w-4" />,
    description: 'Dispara após um período sem interação'
  },
  {
    value: 'status_mudanca',
    label: 'Mudança de Status',
    icon: <Activity className="h-4 w-4" />,
    description: 'Dispara quando o status do lead muda'
  }
];

export default function AutomationModal({ 
  open, 
  onOpenChange, 
  automacao, 
  negocioId, 
  onSave 
}: AutomationModalProps) {
  const [formData, setFormData] = useState<Automacao>({
    nome: '',
    descricao: '',
    trigger_type: 'novo_lead',
    trigger_config: {},
    actions: {},
    ativo: true,
    negocio_id: negocioId
  });
  
  const [currentTab, setCurrentTab] = useState('config');

  useEffect(() => {
    if (automacao) {
      setFormData(automacao);
    } else {
      setFormData({
        nome: '',
        descricao: '',
        trigger_type: 'novo_lead',
        trigger_config: {},
        actions: {},
        ativo: true,
        negocio_id: negocioId
      });
    }
  }, [automacao, negocioId]);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const handleFlowSave = (steps: any[], connections: any[]) => {
    setFormData(prev => ({
      ...prev,
      actions: {
        steps,
        connections
      }
    }));
  };

  const selectedTrigger = triggerTypes.find(t => t.value === formData.trigger_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {automacao ? 'Editar Automação' : 'Nova Automação'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="flow">Fluxo Visual</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome da Automação</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Boas-vindas para novos leads"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                    />
                    <Label htmlFor="ativo">Automação Ativa</Label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o que esta automação faz..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gatilho */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Gatilho (Trigger)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo de Gatilho</Label>
                  <Select
                    value={formData.trigger_type}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      trigger_type: value,
                      trigger_config: {} 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          <div className="flex items-center gap-2">
                            {trigger.icon}
                            <div>
                              <div>{trigger.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {trigger.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTrigger && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {selectedTrigger.icon}
                        <Badge>{selectedTrigger.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedTrigger.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Configurações específicas do gatilho */}
                {formData.trigger_type === 'tempo_inatividade' && (
                  <div>
                    <Label htmlFor="tempo">Tempo de Inatividade (horas)</Label>
                    <Input
                      id="tempo"
                      type="number"
                      min="1"
                      value={formData.trigger_config.tempo || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        trigger_config: { ...prev.trigger_config, tempo: parseInt(e.target.value) }
                      }))}
                      placeholder="24"
                    />
                  </div>
                )}

                {formData.trigger_type === 'mensagem_recebida' && (
                  <div>
                    <Label htmlFor="palavras_chave">Palavras-chave (separadas por vírgula)</Label>
                    <Input
                      id="palavras_chave"
                      value={formData.trigger_config.palavras_chave || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        trigger_config: { ...prev.trigger_config, palavras_chave: e.target.value }
                      }))}
                      placeholder="preço, valor, quanto custa"
                    />
                  </div>
                )}

                {formData.trigger_type === 'status_mudanca' && (
                  <div>
                    <Label htmlFor="status_origem">Status de Origem</Label>
                    <Select
                      value={formData.trigger_config.status_origem || ''}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        trigger_config: { ...prev.trigger_config, status_origem: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="contato">Em Contato</SelectItem>
                        <SelectItem value="interessado">Interessado</SelectItem>
                        <SelectItem value="negociacao">Negociação</SelectItem>
                        <SelectItem value="perdido">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flow">
            <AutomationFlowBuilderWrapper
              automacaoId={automacao?.id}
              onSave={handleFlowSave}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {automacao ? 'Atualizar' : 'Criar'} Automação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}