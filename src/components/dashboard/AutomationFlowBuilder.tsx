import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Clock, 
  GitBranch, 
  Webhook, 
  UserCheck, 
  Play,
  Save,
  Plus
} from 'lucide-react';

interface AutomationStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  label: string;
  config: Record<string, any>;
}

interface AutomationFlowBuilderProps {
  automacaoId?: string;
  onSave: (steps: AutomationStep[], connections: Edge[]) => void;
}

const nodeTypes = {
  trigger: ({ data }: { data: any }) => (
    <Card className="p-3 border-2 border-primary bg-primary/10 min-w-[200px]">
      <div className="flex items-center gap-2">
        <Play className="h-4 w-4 text-primary" />
        <span className="font-semibold text-primary">Gatilho</span>
      </div>
      <p className="text-sm mt-1">{data.label}</p>
    </Card>
  ),
  action: ({ data }: { data: any }) => (
    <Card className="p-3 border-2 border-blue-500 bg-blue-50 min-w-[200px]">
      <div className="flex items-center gap-2">
        {data.icon}
        <span className="font-semibold text-blue-700">Ação</span>
      </div>
      <p className="text-sm mt-1">{data.label}</p>
    </Card>
  ),
  condition: ({ data }: { data: any }) => (
    <Card className="p-3 border-2 border-yellow-500 bg-yellow-50 min-w-[200px]">
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-yellow-700" />
        <span className="font-semibold text-yellow-700">Condição</span>
      </div>
      <p className="text-sm mt-1">{data.label}</p>
    </Card>
  ),
  delay: ({ data }: { data: any }) => (
    <Card className="p-3 border-2 border-purple-500 bg-purple-50 min-w-[200px]">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-purple-700" />
        <span className="font-semibold text-purple-700">Aguardar</span>
      </div>
      <p className="text-sm mt-1">{data.label}</p>
    </Card>
  ),
};

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { label: 'Novo Lead Criado' },
  },
];

export default function AutomationFlowBuilder({ automacaoId, onSave }: AutomationFlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: 'hsl(var(--primary))' }
    }, eds)),
    [setEdges]
  );

  const addNode = (type: 'action' | 'condition' | 'delay', config: any) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 200 },
      data: { 
        label: config.label,
        icon: config.icon,
        config 
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = () => {
    const steps: AutomationStep[] = nodes.map(node => ({
      id: node.id,
      type: node.type as any,
      label: node.data.label,
      config: node.data.config || {}
    }));
    
    onSave(steps, edges);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Construtor de Fluxo</h3>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Automação
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNode('action', {
              label: 'Enviar Mensagem',
              icon: <MessageSquare className="h-4 w-4 text-blue-700" />,
              type: 'send_message'
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Enviar Mensagem
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNode('delay', {
              label: 'Aguardar 1 hora',
              type: 'delay',
              duration: 3600
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Aguardar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNode('condition', {
              label: 'Verificar Resposta',
              type: 'check_response'
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Condição
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNode('action', {
              label: 'Webhook',
              icon: <Webhook className="h-4 w-4 text-blue-700" />,
              type: 'webhook'
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Webhook
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNode('action', {
              label: 'Atualizar Lead',
              icon: <UserCheck className="h-4 w-4 text-blue-700" />,
              type: 'update_lead'
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Atualizar Lead
          </Button>
        </div>
      </Card>

      {/* Flow Canvas */}
      <Card className="p-0 overflow-hidden">
        <div style={{ width: '100%', height: '600px' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Controls />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      </Card>
    </div>
  );
}

export function AutomationFlowBuilderWrapper(props: AutomationFlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <AutomationFlowBuilder {...props} />
    </ReactFlowProvider>
  );
}