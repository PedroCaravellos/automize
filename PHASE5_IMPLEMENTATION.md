# FASE 5: Features Avançadas - Implementação Completa

## 📋 Visão Geral

Esta fase implementa features avançadas que elevam significativamente a experiência do usuário, incluindo undo/redo, atualizações otimistas, realtime especializado e gestão de animações de sucesso.

## 🎯 Objetivos Alcançados

### 1. **Sistema de Undo/Redo**
- ✅ Hook `useUndoRedo` genérico para qualquer estado
- ✅ Hook `useListUndoRedo` especializado para listas
- ✅ Histórico com limite configurável
- ✅ Toasts opcionais para feedback
- ✅ Callbacks para ações de undo/redo

### 2. **Atualizações Otimistas**
- ✅ Hook `useOptimisticUpdate` para estados únicos
- ✅ Hook `useOptimisticList` para operações CRUD em listas
- ✅ Rollback automático em caso de erro
- ✅ Indicadores visuais de estados otimistas
- ✅ Integração com toasts

### 3. **Realtime Especializado**
- ✅ Hook `useRealtimeTable` com estatísticas
- ✅ Hook `useMultipleRealtimeTables` para dashboards
- ✅ Métricas de eventos em tempo real
- ✅ Status de conexão por tabela
- ✅ Notificações opcionais de eventos

### 4. **Gerenciamento de Animações**
- ✅ Hook `useSuccessAnimation` para feedback visual
- ✅ Hook `useActionFeedback` para ações assíncronas
- ✅ Hook `useAnimationSequence` para multi-step
- ✅ Tipos de animação (success, error, warning, info, celebration)

## 📦 Novos Arquivos Criados

```
src/
├── hooks/
│   ├── useUndoRedo.ts              # Sistema de undo/redo
│   ├── useOptimisticUpdate.ts      # Atualizações otimistas
│   ├── useRealtimeTable.ts         # Realtime com estatísticas
│   └── useSuccessAnimation.ts      # Gerenciamento de animações
```

## 🚀 Como Usar

### 1. Undo/Redo Básico

```tsx
import { useUndoRedo } from '@/hooks/useUndoRedo';

function TextEditor() {
  const {
    state: text,
    set: setText,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo('', {
    maxHistorySize: 50,
    enableToasts: true,
  });

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button onClick={undo} disabled={!canUndo}>
          Desfazer (Ctrl+Z)
        </Button>
        <Button onClick={redo} disabled={!canRedo}>
          Refazer (Ctrl+Y)
        </Button>
      </div>
      
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}
```

### 2. Undo/Redo para Listas

```tsx
import { useListUndoRedo } from '@/hooks/useUndoRedo';

function TaskList() {
  const {
    items: tasks,
    addItem,
    removeItem,
    updateItem,
    reorderItems,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useListUndoRedo(initialTasks, {
    enableToasts: true,
  });

  const handleAddTask = () => {
    addItem({
      id: Date.now(),
      title: 'Nova tarefa',
      completed: false,
    });
  };

  const handleToggle = (id: number) => {
    const task = tasks.find(t => t.id === id);
    updateItem(id, { completed: !task?.completed });
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button onClick={undo} disabled={!canUndo}>
          <Undo className="mr-2 h-4 w-4" />
          Desfazer
        </Button>
        <Button onClick={redo} disabled={!canRedo}>
          <Redo className="mr-2 h-4 w-4" />
          Refazer
        </Button>
        <Button onClick={handleAddTask}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onDelete={removeItem}
          />
        ))}
      </div>
    </div>
  );
}
```

### 3. Atualizações Otimistas

```tsx
import { useOptimisticList } from '@/hooks/useOptimisticUpdate';
import { supabase } from '@/integrations/supabase/client';

function NegociosList() {
  const {
    list: negocios,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    isOptimistic,
  } = useOptimisticList(initialNegocios);

  const handleCreate = async (data: NegocioInput) => {
    const result = await addOptimistic(
      { id: 'temp', ...data } as Negocio,
      async () => {
        const { data, error } = await supabase
          .from('negocios')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      {
        successMessage: 'Negócio criado com sucesso!',
        errorMessage: 'Erro ao criar negócio',
        showToasts: true,
      }
    );

    if (result.success) {
      console.log('Negócio criado:', result.data);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Negocio>) => {
    await updateOptimistic(
      id,
      updates,
      async () => {
        const { data, error } = await supabase
          .from('negocios')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    );
  };

  const handleDelete = async (id: string) => {
    await removeOptimistic(
      id,
      async () => {
        const { error } = await supabase
          .from('negocios')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      }
    );
  };

  return (
    <div className="space-y-4">
      {negocios.map(negocio => (
        <Card
          key={negocio.id}
          className={cn(
            isOptimistic(negocio.id) && "opacity-50 animate-pulse"
          )}
        >
          <CardHeader>
            <CardTitle>{negocio.nome}</CardTitle>
            {isOptimistic(negocio.id) && (
              <Badge variant="secondary">Salvando...</Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => handleUpdate(negocio.id, { ativo: !negocio.ativo })}>
                Toggle
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(negocio.id)}
              >
                Deletar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 4. Realtime com Estatísticas

```tsx
import { useRealtimeTable } from '@/hooks/useRealtimeTable';

function LeadsSection() {
  const { data: leads } = useLeads();
  
  const {
    isConnected,
    stats,
    totalEvents,
    resetStats,
  } = useRealtimeTable('leads', {
    queryKey: ['leads'],
    enabled: true,
    showNotifications: true,
    onInsert: (lead) => {
      console.log('Novo lead:', lead);
    },
    filter: {
      column: 'negocio_id',
      value: negocioId,
    },
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Badge variant={isConnected ? "success" : "secondary"}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </Badge>
        
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>{stats.inserts} inserções</span>
          <span>{stats.updates} atualizações</span>
          <span>{stats.deletes} exclusões</span>
          <span>{totalEvents} eventos totais</span>
        </div>

        <Button onClick={resetStats} variant="ghost" size="sm">
          Resetar Stats
        </Button>
      </div>

      <LeadsTable data={leads} />
    </div>
  );
}
```

### 5. Multiple Realtime Tables

```tsx
import { useMultipleRealtimeTables } from '@/hooks/useRealtimeTable';

function Dashboard() {
  const {
    connections,
    allConnected,
    globalStats,
    resetAllStats,
  } = useMultipleRealtimeTables([
    { name: 'negocios', queryKey: ['negocios'] },
    { name: 'chatbots', queryKey: ['chatbots'] },
    { name: 'leads', queryKey: ['leads'] },
    { name: 'agendamentos', queryKey: ['agendamentos'] },
  ]);

  return (
    <div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Status Realtime</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(connections).map(([table, connected]) => (
              <div key={table} className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  connected ? "bg-green-500" : "bg-gray-500"
                )} />
                <span className="text-sm">{table}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex gap-4 text-sm">
            <span>{globalStats.inserts} inserções</span>
            <span>{globalStats.updates} atualizações</span>
            <span>{globalStats.deletes} exclusões</span>
          </div>

          {globalStats.lastEvent && (
            <p className="text-xs text-muted-foreground mt-2">
              Último evento: {globalStats.lastEvent.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <DashboardContent />
    </div>
  );
}
```

### 6. Animações de Sucesso

```tsx
import { useSuccessAnimation } from '@/hooks/useSuccessAnimation';
import { SuccessAnimation } from '@/components/ui/success-animation';

function CreateNegocioForm() {
  const {
    animation,
    triggerSuccess,
    triggerError,
  } = useSuccessAnimation();

  const handleSubmit = async (data: NegocioInput) => {
    try {
      await createNegocio(data);
      triggerSuccess('Negócio criado com sucesso!');
    } catch (error) {
      triggerError('Erro ao criar negócio');
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        {/* Form fields */}
      </Form>

      {animation.show && (
        <SuccessAnimation
          type={animation.type}
          message={animation.message}
        />
      )}
    </>
  );
}
```

### 7. Feedback de Ações Assíncronas

```tsx
import { useActionFeedback } from '@/hooks/useSuccessAnimation';
import { SuccessAnimation } from '@/components/ui/success-animation';
import { LoadingOverlay } from '@/components/ui/loading-states';

function DataForm() {
  const {
    isLoading,
    executeWithFeedback,
    animation,
  } = useActionFeedback();

  const handleSave = async () => {
    const result = await executeWithFeedback(
      async () => {
        return await saveData();
      },
      {
        successMessage: 'Dados salvos com sucesso!',
        errorMessage: 'Erro ao salvar dados',
        onSuccess: (result) => {
          console.log('Saved:', result);
          router.push('/dashboard');
        },
      }
    );

    if (result.success) {
      // Lógica adicional
    }
  };

  return (
    <div className="relative">
      {isLoading && <LoadingOverlay message="Salvando..." />}
      
      <Form>
        {/* Form content */}
        <Button onClick={handleSave} disabled={isLoading}>
          Salvar
        </Button>
      </Form>

      {animation.show && (
        <SuccessAnimation
          type={animation.type}
          message={animation.message}
        />
      )}
    </div>
  );
}
```

### 8. Sequências de Animação

```tsx
import { useAnimationSequence } from '@/hooks/useSuccessAnimation';
import { SuccessAnimation } from '@/components/ui/success-animation';

function OnboardingWizard() {
  const {
    currentStep,
    isPlaying,
    playSequence,
    animation,
  } = useAnimationSequence();

  const handleComplete = () => {
    playSequence(
      [
        { message: 'Criando negócio...', type: 'info', duration: 1500 },
        { message: 'Configurando chatbot...', type: 'info', duration: 1500 },
        { message: 'Configurando integrações...', type: 'info', duration: 1500 },
        { message: 'Tudo pronto! 🎉', type: 'celebration', duration: 3000 },
      ],
      () => {
        router.push('/dashboard');
      }
    );
  };

  return (
    <div>
      <WizardSteps currentStep={currentStep} />
      
      <Button onClick={handleComplete} disabled={isPlaying}>
        Finalizar Configuração
      </Button>

      {animation.show && (
        <SuccessAnimation
          type={animation.type}
          message={animation.message}
        />
      )}
    </div>
  );
}
```

## ✅ Casos de Uso Práticos

### 1. Editor de Texto com Undo/Redo
```tsx
function RichTextEditor() {
  const {
    state: content,
    set: setContent,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo('', { maxHistorySize: 100 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'z' && e.shiftKey || e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return <Editor value={content} onChange={setContent} />;
}
```

### 2. Drag & Drop com Undo
```tsx
function KanbanBoard() {
  const {
    items: columns,
    updateItem,
    undo,
    canUndo,
  } = useListUndoRedo(initialColumns);

  const handleDragEnd = (result: DragResult) => {
    // Lógica de reordenação
    updateItem(result.columnId, { tasks: newTasks });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* Kanban UI */}
      <Button onClick={undo} disabled={!canUndo}>
        Desfazer movimento
      </Button>
    </DndContext>
  );
}
```

### 3. CRUD Otimista Completo
```tsx
function OptimisticCRUD() {
  const {
    list,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
  } = useOptimisticList(data);

  // Create
  const create = (item) => addOptimistic(item, () => api.create(item));
  
  // Update
  const update = (id, changes) => 
    updateOptimistic(id, changes, () => api.update(id, changes));
  
  // Delete
  const remove = (id) => 
    removeOptimistic(id, () => api.delete(id));

  return <DataTable data={list} onCreate={create} onUpdate={update} onDelete={remove} />;
}
```

## 📊 Benefícios

### Performance
- ⚡ **UI instantânea** com atualizações otimistas
- ⚡ **Sem bloqueios** durante operações assíncronas
- ⚡ **Rollback automático** mantém consistência

### UX
- 🎯 **Feedback imediato** em todas as ações
- 🎯 **Undo/Redo** aumenta confiança do usuário
- 🎯 **Estatísticas realtime** aumentam transparência
- 🎯 **Animações contextuais** melhoram percepção

### Developer Experience
- 🛠️ **APIs simples** e intuitivas
- 🛠️ **Type-safe** com TypeScript
- 🛠️ **Reutilizáveis** em qualquer componente
- 🛠️ **Bem documentados** com exemplos

## 🎓 Boas Práticas

### 1. Undo/Redo
- Use `maxHistorySize` apropriado (50-100 para textos, 20-30 para listas)
- Evite adicionar ao histórico mudanças idênticas
- Implemente atalhos de teclado (Ctrl+Z, Ctrl+Y)

### 2. Atualizações Otimistas
- Use IDs temporários únicos (`temp-${Date.now()}`)
- Sempre implemente rollback
- Mostre indicador visual de estado otimista
- Teste casos de erro extensivamente

### 3. Realtime
- Sempre limpe subscriptions no cleanup
- Use filtros server-side quando possível
- Monitore conexões em produção
- Implemente reconexão automática

### 4. Animações
- Respeite `prefers-reduced-motion`
- Use durações curtas (1-3 segundos)
- Não abuse de celebrações
- Permita cancelamento manual

## 🔄 Integração com Outras Fases

### Com Fase 2 (Performance)
```tsx
const { data } = useQuery(['items'], fetchItems);
const { list, updateOptimistic } = useOptimisticList(data);
useRealtimeTable('items', { queryKey: ['items'] });
```

### Com Fase 3 (UX/UI)
```tsx
const { triggerSuccess } = useSuccessAnimation();
const { list } = useOptimisticList(data);

return (
  <>
    <ResponsiveTable data={list} />
    {animation.show && <SuccessAnimation {...animation} />}
  </>
);
```

### Com Fase 4 (Acessibilidade)
```tsx
const { announce } = useScreenReader();
const { undo } = useUndoRedo(state, {
  onUndo: () => announce('Alteração desfeita', 'polite'),
});
```

## 📈 Métricas de Sucesso

- [x] Sistema de undo/redo funcional
- [x] Atualizações otimistas com rollback
- [x] Realtime com estatísticas
- [x] Animações de feedback implementadas
- [x] Hooks documentados e testáveis
- [x] Exemplos práticos criados
- [x] Integração com fases anteriores

**Status: ✅ FASE 5 CONCLUÍDA COM SUCESSO**

---

## 🚀 Próximos Passos

1. **Implementar hooks em componentes existentes**
2. **Adicionar testes unitários**
3. **Criar Storybook stories**
4. **Documentar patterns de uso**
5. **Monitorar performance em produção**
