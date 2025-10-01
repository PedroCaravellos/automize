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
import { MessageSquare, Clock, GitBranch, Webhook, UserPlus, Plus } from 'lucide-react';

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
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: type === 'trigger' ? 'input' : type === 'condition' ? 'default' : 'default',
      data: {
        label: nodeTypes.find((t) => t.type === type)?.label || type,
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
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar de blocos */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Adicionar Bloco</h3>
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
          <li>• Use Zoom e Pan para navegar no canvas</li>
        </ul>
      </Card>
    </div>
  );
}
