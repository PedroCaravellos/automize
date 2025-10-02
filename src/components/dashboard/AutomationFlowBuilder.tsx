import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, GitBranch, Webhook, UserPlus, Plus, Trash2 } from 'lucide-react';

interface AutomationFlowBuilderProps {
  automacao?: any;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

const nodeTypes = [
  { type: 'trigger', label: 'Gatilho', icon: UserPlus, color: 'bg-primary' },
  { type: 'message', label: 'Mensagem', icon: MessageSquare, color: 'bg-secondary' },
  { type: 'delay', label: 'Aguardar', icon: Clock, color: 'bg-accent' },
  { type: 'condition', label: 'Condição', icon: GitBranch, color: 'bg-warning' },
  { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'bg-info' },
];

export default function AutomationFlowBuilder({ automacao, onSave }: AutomationFlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'input',
      data: { label: 'Novo Lead' },
      position: { x: 250, y: 5 },
      style: { background: 'hsl(var(--primary))', color: 'white', padding: '10px' },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    // Validação: não criar bloco se tipo não existir
    const nodeTypeInfo = nodeTypes.find((t) => t.type === type);
    if (!nodeTypeInfo) {
      console.error('Tipo de bloco inválido:', type);
      return;
    }

    const newNode: Node = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type === 'trigger' ? 'input' : type === 'condition' ? 'default' : 'default',
      data: {
        label: nodeTypeInfo.label,
        nodeType: type, // Adicionar tipo explícito
      },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      style: {
        background: type === 'message' ? 'hsl(var(--secondary))' : 
                   type === 'delay' ? 'hsl(var(--accent))' :
                   type === 'condition' ? 'hsl(var(--warning))' :
                   'hsl(var(--primary))',
        color: 'white',
        padding: '10px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        minWidth: '150px',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteSelectedNodes = () => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelectedNodes();
      }
    },
    [nodes, edges]
  );

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar de blocos */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Adicionar Bloco</h3>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteSelectedNodes}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Remover Selecionados
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <Button
                key={nodeType.type}
                variant="outline"
                size="sm"
                onClick={() => addNode(nodeType.type)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {nodeType.label}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Canvas do fluxo */}
      <Card className="p-0 overflow-hidden" style={{ height: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </Card>

      {/* Botões de ação */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={handleSave}>Salvar Automação</Button>
      </div>

      {/* Legenda */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-2">Como usar:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Clique em "Adicionar Bloco" para criar novos passos</li>
          <li>• Arraste os blocos para organizar seu fluxo</li>
          <li>• Conecte os blocos clicando e arrastando das bolinhas</li>
          <li>• Selecione blocos clicando neles e pressione Delete/Backspace para remover</li>
          <li>• Ou use o botão "Remover Selecionados" para deletar múltiplos blocos</li>
          <li>• Use Zoom e Pan para navegar no canvas</li>
        </ul>
      </Card>
    </div>
  );
}
