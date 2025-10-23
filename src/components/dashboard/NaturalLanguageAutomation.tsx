import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Trash2, Edit2, CheckCircle2, Clock } from "lucide-react";
import { AutomacaoItem } from "@/types";

interface SimpleAutomation {
  id: string;
  description: string;
  active: boolean;
  trigger: string;
  action: string;
}

interface NaturalLanguageAutomationProps {
  automacoes: AutomacaoItem[];
  onCreateAutomation?: (description: string) => void;
}

export default function NaturalLanguageAutomation({ 
  automacoes,
  onCreateAutomation 
}: NaturalLanguageAutomationProps) {
  const [newAutomation, setNewAutomation] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [simpleAutomations, setSimpleAutomations] = useState<SimpleAutomation[]>([
    {
      id: '1',
      description: 'Quando alguém perguntar sobre preços → Enviar tabela',
      active: true,
      trigger: 'Pergunta sobre preços',
      action: 'Enviar tabela de preços'
    },
    {
      id: '2',
      description: 'Quando lead não responder 3 dias → Enviar follow-up',
      active: true,
      trigger: 'Lead sem resposta há 3 dias',
      action: 'Enviar "Olá! Ainda tem interesse?"'
    },
    {
      id: '3',
      description: '1 dia antes do agendamento → Enviar lembrete',
      active: false,
      trigger: '24h antes de agendamento',
      action: 'Enviar lembrete via WhatsApp'
    }
  ]);

  const handleCreate = () => {
    if (!newAutomation.trim()) return;
    
    setIsCreating(true);
    
    // Simular criação
    setTimeout(() => {
      const newAuto: SimpleAutomation = {
        id: Date.now().toString(),
        description: newAutomation,
        active: false,
        trigger: 'Auto-detectado',
        action: 'Auto-configurado'
      };
      
      setSimpleAutomations(prev => [...prev, newAuto]);
      setNewAutomation("");
      setIsCreating(false);
      
      onCreateAutomation?.(newAutomation);
    }, 1500);
  };

  const handleToggle = (id: string) => {
    setSimpleAutomations(prev => 
      prev.map(auto => 
        auto.id === id 
          ? { ...auto, active: !auto.active }
          : auto
      )
    );
  };

  const handleDelete = (id: string) => {
    setSimpleAutomations(prev => prev.filter(auto => auto.id !== id));
  };

  const suggestions = [
    "Quando lead não responder 2 dias → Enviar mensagem",
    "Quando alguém perguntar horários → Mostrar disponibilidade",
    "Após 5 mensagens → Oferecer agendar visita",
    "Quando lead marcar como interessado → Notificar vendedor"
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Automações</h2>
        <Badge variant="secondary" className="ml-auto">
          {simpleAutomations.filter(a => a.active).length} ativas
        </Badge>
      </div>

      {/* Criar nova automação */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Descreva o que você quer automatizar..."
            value={newAutomation}
            onChange={(e) => setNewAutomation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            disabled={isCreating}
          />
          <Button 
            onClick={handleCreate}
            disabled={!newAutomation.trim() || isCreating}
          >
            {isCreating ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Sugestões */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setNewAutomation(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de automações */}
      <div className="space-y-3">
        {simpleAutomations.map((automation) => (
          <Card 
            key={automation.id} 
            className={`p-4 transition-all ${
              automation.active 
                ? 'bg-primary/5 border-primary/30' 
                : 'bg-card/50 border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {automation.active ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-2">
                  {automation.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    ⚡ {automation.trigger}
                  </Badge>
                  <span>→</span>
                  <Badge variant="outline" className="text-xs">
                    📨 {automation.action}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggle(automation.id)}
                >
                  {automation.active ? 'Pausar' : 'Ativar'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(automation.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {simpleAutomations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Zap className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Nenhuma automação criada ainda</p>
          <p className="text-xs mt-1">Descreva o que você quer automatizar acima</p>
        </div>
      )}
    </Card>
  );
}
