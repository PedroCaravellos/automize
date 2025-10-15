import React, { useCallback, useState, useEffect } from 'react';
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
import { MessageSquare, Clock, GitBranch, Webhook, UserPlus, Plus, Trash2, Edit2, Save, Undo2, Redo2 } from 'lucide-react';
import BlockEditModal from './BlockEditModal';
import { toast } from '@/hooks/use-toast';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

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

// Modern color mapping with gradients and consistent styling
const getBlockColors = (tipo: string) => {
  switch (tipo) {
    case 'trigger':
      return { 
        bg: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)', 
        fg: 'hsl(var(--primary-foreground))', 
        br: 'hsl(var(--primary))', 
        minimap: '#6366f1',
        icon: UserPlus
      };
    case 'message':
      return { 
        bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
        fg: 'white', 
        br: '#10b981', 
        minimap: '#10b981',
        icon: MessageSquare
      };
    case 'delay':
      return { 
        bg: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)', 
        fg: 'white', 
        br: '#3b82f6', 
        minimap: '#3b82f6',
        icon: Clock
      };
    case 'condition':
      return { 
        bg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', 
        fg: 'white', 
        br: '#f59e0b', 
        minimap: '#f59e0b',
        icon: GitBranch
      };
    case 'webhook':
      return { 
        bg: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', 
        fg: 'white', 
        br: '#8b5cf6', 
        minimap: '#8b5cf6',
        icon: Webhook
      };
    default:
      return { 
        bg: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)', 
        fg: 'hsl(var(--primary-foreground))', 
        br: 'hsl(var(--primary))', 
        minimap: '#6366f1',
        icon: UserPlus
      };
  }
};

export default function AutomationFlowBuilder({ automacao, initialBlocks, onSave }: AutomationFlowBuilderProps) {
  // Convert AI-generated blocks to nodes and edges
  const convertBlocksToNodes = (blocks: any[]): Node[] => {
    if (!blocks || blocks.length === 0) return [];

    return blocks.map((block, index) => {
      const colors = getBlockColors(block.tipo);
      const Icon = colors.icon;
      return {
        id: block.id || `node-${index}`,
        type: block.tipo === 'trigger' ? 'input' : 'default',
        data: {
          label: (
            <div className="flex items-center gap-2 justify-center">
              <Icon className="h-4 w-4" />
              <span>{block.label}</span>
            </div>
          ),
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
          background: colors.bg,
          color: colors.fg,
          padding: '16px 24px',
          border: `2px solid ${colors.br}`,
          borderRadius: '12px',
          minWidth: '180px',
          minHeight: '60px',
          fontWeight: 600,
          fontSize: '14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease',
        },
      };
    });
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
          data: { 
            label: (
              <div className="flex items-center gap-2 justify-center">
                <UserPlus className="h-4 w-4" />
                <span>Novo Lead</span>
              </div>
            ), 
            nodeType: 'trigger' 
          },
          position: { x: 250, y: 50 },
          style: { 
            background: 'linear-gradient(135deg, #6366f1 0%, #5558e3 100%)', 
            color: 'white', 
            padding: '16px 24px',
            border: '2px solid #6366f1',
            borderRadius: '12px',
            minWidth: '180px',
            minHeight: '60px',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
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


    const colors = getBlockColors(type);
    const Icon = colors.icon;
    
    const newNode: Node = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type === 'trigger' ? 'input' : 'default',
      data: {
        label: (
          <div className="flex items-center gap-2 justify-center">
            <Icon className="h-4 w-4" />
            <span>{nodeTypeInfo.label}</span>
          </div>
        ),
        nodeType: type,
      },
      position: {
        x: 250 + (Math.random() * 100 - 50),
        y: 200 + (nodes.length * 30),
      },
      style: {
        background: colors.bg,
        color: colors.fg,
        padding: '16px 24px',
        border: `2px solid ${colors.br}`,
        borderRadius: '12px',
        minWidth: '180px',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: '14px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
      } as React.CSSProperties,
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
      <Card className="p-6 bg-gradient-to-br from-card via-card to-muted/20 border-2 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
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
            className="flex items-center gap-2 shadow-lg"
          >
            <Trash2 className="h-4 w-4" />
            Remover Selecionados
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            const colors = getBlockColors(nodeType.type);
            return (
              <Button
                key={nodeType.type}
                variant="outline"
                size="lg"
                onClick={() => addNode(nodeType.type)}
                className="flex items-center gap-3 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl border-2"
                style={{
                  borderColor: colors.br,
                  background: `linear-gradient(135deg, ${colors.br}15 0%, ${colors.br}05 100%)`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color: colors.br }} />
                <span className="font-semibold">{nodeType.label}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Canvas do fluxo */}
      <Card className="p-0 overflow-hidden shadow-2xl border-2" style={{ height: '650px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={handleNodeDoubleClick}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { 
              strokeWidth: 2.5,
              stroke: 'hsl(var(--primary) / 0.5)',
            },
          }}
        >
          <Controls className="bg-card/95 backdrop-blur-sm border-2 rounded-xl shadow-xl" />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1.5} 
            color="hsl(var(--muted-foreground) / 0.25)" 
            className="bg-gradient-to-br from-muted/30 to-muted/10" 
          />
          <MiniMap 
            className="bg-card/95 backdrop-blur-sm border-2 rounded-xl shadow-xl" 
            style={{ background: 'hsl(var(--card) / 0.95)' }}
            nodeColor={(node) => {
              const type = node.data?.nodeType || 'default';
              const colors = getBlockColors(type);
              return colors.minimap;
            }}
            maskColor="hsl(var(--muted) / 0.2)"
          />
        </ReactFlow>
      </Card>

      {/* Botões de ação com Undo/Redo */}
      <div className="flex justify-between gap-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            disabled
            className="flex items-center gap-2"
          >
            <Undo2 className="h-4 w-4" />
            Desfazer
          </Button>
          <Button
            variant="outline"
            size="lg"
            disabled
            className="flex items-center gap-2"
          >
            <Redo2 className="h-4 w-4" />
            Refazer
          </Button>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg">Cancelar</Button>
          <Button onClick={handleSave} size="lg" className="flex items-center gap-2 hover-scale">
            <Save className="h-4 w-4" />
            Salvar Automação
          </Button>
        </div>
      </div>

      {/* Legenda melhorada */}
      <Card className="p-5 bg-gradient-to-br from-muted/40 to-muted/20 border-2 shadow-md">
        <h4 className="text-sm font-bold mb-4 flex items-center gap-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <Edit2 className="h-4 w-4 text-primary" />
          Como usar o Editor Visual
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
            <Badge variant="default" className="mt-0.5 shadow-sm">1</Badge>
            <p className="text-sm">
              <strong className="text-foreground">Adicionar:</strong>{' '}
              <span className="text-muted-foreground">Clique nos botões de blocos acima</span>
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
            <Badge variant="default" className="mt-0.5 shadow-sm">2</Badge>
            <p className="text-sm">
              <strong className="text-foreground">Editar:</strong>{' '}
              <span className="text-muted-foreground">Clique 2x em qualquer bloco</span>
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
            <Badge variant="default" className="mt-0.5 shadow-sm">3</Badge>
            <p className="text-sm">
              <strong className="text-foreground">Conectar:</strong>{' '}
              <span className="text-muted-foreground">Arraste das bolinhas laterais</span>
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
            <Badge variant="default" className="mt-0.5 shadow-sm">4</Badge>
            <p className="text-sm">
              <strong className="text-foreground">Remover:</strong>{' '}
              <span className="text-muted-foreground">Selecione e pressione Delete</span>
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
