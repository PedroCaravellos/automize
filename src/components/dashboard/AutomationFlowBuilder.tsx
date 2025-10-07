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
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, GitBranch, Webhook, UserPlus, Plus, Trash2, Edit2, Save } from 'lucide-react';
import BlockEditModal from './BlockEditModal';
import { toast } from '@/hooks/use-toast';

interface AutomationFlowBuilderProps {
  automacao?: any;
  initialBlocks?: any[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

const nodeTypes = [
  { type: 'trigger', label: 'Gatilho', icon: UserPlus, color: 'bg-primary' },
  { type: 'message', label: 'Mensagem', icon: MessageSquare, color: 'bg-secondary' },
  { type: 'delay', label: 'Aguardar', icon: Clock, color: 'bg-accent' },
  { type: 'condition', label: 'Condição', icon: GitBranch, color: 'bg-warning' },
  { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'bg-info' },
];

export default function AutomationFlowBuilder({ automacao, initialBlocks, onSave }: AutomationFlowBuilderProps) {
  // Convert AI-generated blocks to nodes and edges
  const convertBlocksToNodes = (blocks: any[]): Node[] => {
    if (!blocks || blocks.length === 0) return [];
    
    const getBlockColor = (tipo: string) => {
      switch (tipo) {
        case 'trigger': return '#6366f1';
        case 'message': return '#10b981';
        case 'delay': return '#f59e0b';
        case 'condition': return '#3b82f6';
        case 'webhook': return '#8b5cf6';
        default: return '#6366f1';
      }
    };

    return blocks.map((block, index) => ({
      id: block.id || `node-${index}`,
      type: block.tipo === 'trigger' ? 'input' : 'default',
      data: {
        label: block.label,
        nodeType: block.tipo,
        content: block.conteudo,
        time: block.tempo,
        condition: block.condicao,
      },
      position: block.posicao || { 
        x: 250, 
        y: 50 + (index * 100) 
      },
      style: {
        background: getBlockColor(block.tipo),
        color: 'white',
        padding: '12px 20px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        minWidth: '150px',
        minHeight: '50px',
        fontWeight: '600',
        fontSize: '14px',
      },
    }));
  };

  const convertBlocksToEdges = (blocks: any[]): Edge[] => {
    if (!blocks || blocks.length <= 1) return [];
    
    const edges: Edge[] = [];
    for (let i = 0; i < blocks.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: blocks[i].id || `node-${i}`,
        target: blocks[i + 1].id || `node-${i + 1}`,
        type: 'smoothstep',
        animated: true,
      });
    }
    return edges;
  };

  const initialNodes = initialBlocks && initialBlocks.length > 0
    ? convertBlocksToNodes(initialBlocks)
    : [
        {
          id: '1',
          type: 'input',
          data: { label: 'Novo Lead', nodeType: 'trigger' },
          position: { x: 250, y: 50 },
          style: { 
            background: '#6366f1', 
            color: 'white', 
            padding: '12px 20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            minWidth: '150px',
            minHeight: '50px',
            fontWeight: '600',
            fontSize: '14px',
          },
        },
      ];

  const initialEdgesFromBlocks = initialBlocks && initialBlocks.length > 0
    ? convertBlocksToEdges(initialBlocks)
    : [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesFromBlocks);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<Node | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

    // Cores sólidas e visíveis para cada tipo de bloco
    const getBlockColor = (blockType: string) => {
      switch (blockType) {
        case 'message':
          return '#10b981'; // Verde sólido
        case 'delay':
          return '#f59e0b'; // Laranja sólido para "Aguardar"
        case 'condition':
          return '#3b82f6'; // Azul sólido para "Condição"
        case 'webhook':
          return '#8b5cf6'; // Roxo sólido
        default:
          return '#6366f1'; // Índigo sólido padrão
      }
    };

    const newNode: Node = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type === 'trigger' ? 'input' : 'default',
      data: {
        label: nodeTypeInfo.label,
        nodeType: type,
      },
      position: {
        // Posicionar no centro visível (200-400px do topo, centro horizontal)
        x: 250 + (Math.random() * 100 - 50),
        y: 200 + (nodes.length * 30),
      },
      style: {
        background: getBlockColor(type),
        color: 'white',
        padding: '12px 20px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        minWidth: '150px',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        fontSize: '14px',
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

  // Sanitização: remove blocos inválidos automaticamente
  React.useEffect(() => {
    setNodes((prev) => {
      const filtered = prev.filter((n) => {
        const data: any = n.data;
        const hasLabel = !!(data && data.label && String(data.label).trim());
        const hasType = !!(data && (data.nodeType || n.type));
        return hasLabel && hasType;
      });
      return filtered.length !== prev.length ? filtered : prev;
    });
  }, [setNodes]);

  const handleNodeDoubleClick: NodeMouseHandler = useCallback((event, node) => {
    setEditingBlock(node);
    setIsEditModalOpen(true);
  }, []);

  const handleBlockUpdate = (updatedBlock: Node) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === updatedBlock.id ? updatedBlock : node))
    );
    toast({
      title: "Bloco atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
    toast({
      title: "Automação salva",
      description: "Sua automação foi salva com sucesso.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar de blocos */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Adicionar Blocos
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Clique nos blocos abaixo para adicionar ao fluxo
            </p>
          </div>
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
        <div className="flex flex-wrap gap-3">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <Button
                key={nodeType.type}
                variant="outline"
                size="lg"
                onClick={() => addNode(nodeType.type)}
                className="flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Icon className="h-5 w-5" />
                {nodeType.label}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Canvas do fluxo */}
      <Card className="p-0 overflow-hidden shadow-lg border-2" style={{ height: '600px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={handleNodeDoubleClick}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Controls className="bg-background border-2 rounded-lg shadow-lg" />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="bg-muted/30" />
          <MiniMap 
            className="bg-background border-2 rounded-lg shadow-lg" 
            nodeColor={(node) => {
              const type = node.data?.nodeType || 'default';
              switch (type) {
                case 'trigger': return '#6366f1';
                case 'message': return '#10b981';
                case 'delay': return '#f59e0b';
                case 'condition': return '#3b82f6';
                case 'webhook': return '#8b5cf6';
                default: return '#6366f1';
              }
            }}
          />
        </ReactFlow>
      </Card>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" size="lg">Cancelar</Button>
        <Button onClick={handleSave} size="lg" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Salvar Automação
        </Button>
      </div>

      {/* Legenda melhorada */}
      <Card className="p-4 bg-muted/30">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Edit2 className="h-4 w-4 text-primary" />
          Como usar o Editor Visual
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">1</Badge>
            <p className="text-sm text-muted-foreground">
              <strong>Adicionar:</strong> Clique nos botões de blocos acima
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">2</Badge>
            <p className="text-sm text-muted-foreground">
              <strong>Editar:</strong> Clique 2x em qualquer bloco
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">3</Badge>
            <p className="text-sm text-muted-foreground">
              <strong>Conectar:</strong> Arraste das bolinhas laterais
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">4</Badge>
            <p className="text-sm text-muted-foreground">
              <strong>Remover:</strong> Selecione e pressione Delete
            </p>
          </div>
        </div>
      </Card>

      <BlockEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        block={editingBlock}
        onSave={handleBlockUpdate}
      />
    </div>
  );
}
