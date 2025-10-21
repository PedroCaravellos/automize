# Hooks Customizados - Guia de Uso

## Hooks de Negócio (Business Data)

### `useNegocios()`
Busca todos os negócios do usuário com cache inteligente.

```typescript
import { useNegocios } from '@/hooks/useBusinessData';

function Component() {
  const { data: negocios, isLoading, error } = useNegocios();
  
  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar</div>;
  
  return (
    <div>
      {negocios.map(n => <div key={n.id}>{n.nome}</div>)}
    </div>
  );
}
```

### `useCreateNegocio()`
Cria um novo negócio com feedback automático.

```typescript
import { useCreateNegocio } from '@/hooks/useBusinessData';

function CreateButton() {
  const createNegocio = useCreateNegocio();
  
  const handleCreate = () => {
    createNegocio.mutate({
      nome: "Novo Negócio",
      segmento: "Academia",
      tipoNegocio: "academia"
    });
  };
  
  return (
    <Button 
      onClick={handleCreate} 
      disabled={createNegocio.isPending}
    >
      {createNegocio.isPending ? 'Criando...' : 'Criar'}
    </Button>
  );
}
```

### `useUpdateNegocio()`
Atualiza um negócio existente.

```typescript
const updateNegocio = useUpdateNegocio();

updateNegocio.mutate({
  id: '123',
  updates: {
    nome: "Nome Atualizado"
  }
});
```

### `useDeleteNegocio()`
Remove um negócio.

```typescript
const deleteNegocio = useDeleteNegocio();

deleteNegocio.mutate('negocio-id');
```

---

## Hook Centralizado

### `useDashboardData()`
Agrega todos os dados do dashboard em um único hook.

```typescript
import { useDashboardData } from '@/hooks/useDashboardData';

function Dashboard() {
  const {
    negocios,
    chatbots,
    leads,
    automacoes,
    agendamentos,
    negocioIds,
    isLoading,
    hasError,
    metrics,
  } = useDashboardData();
  
  return (
    <div>
      <h1>Total Negócios: {metrics.totalNegocios}</h1>
      <h1>Leads: {metrics.totalLeads}</h1>
      <h1>Chatbots Ativos: {metrics.chatbotsAtivos}</h1>
    </div>
  );
}
```

**Métricas disponíveis:**
- `totalNegocios`
- `totalChatbots`
- `chatbotsAtivos`
- `totalLeads`
- `leadsNovos`
- `totalAutomacoes`
- `automacoesAtivas`
- `totalAgendamentos`
- `agendamentosHoje`

---

## Realtime Otimizado

### `useOptimizedRealtime()`
Subscrição otimizada ao realtime do Supabase.

```typescript
import { useOptimizedRealtime } from '@/hooks/useOptimizedRealtime';
import { businessKeys } from '@/hooks/useBusinessData';

function Component() {
  const { user } = useAuth();
  
  // Subscrever a mudanças na tabela negocios
  useOptimizedRealtime({
    table: 'negocios',
    queryKey: businessKeys.negocios(user?.id || ''),
    enabled: !!user?.id,
    filter: {
      column: 'user_id',
      value: user.id
    }
  });
  
  // Dados são automaticamente atualizados via React Query
  const { data: negocios } = useNegocios();
  
  return <div>{/* ... */}</div>;
}
```

### `useMultipleRealtime()`
Para múltiplas subscriptions simultâneas.

```typescript
import { useMultipleRealtime } from '@/hooks/useOptimizedRealtime';

function Component() {
  const { allSubscribed } = useMultipleRealtime([
    {
      table: 'negocios',
      queryKey: businessKeys.negocios(userId),
      enabled: !!userId,
    },
    {
      table: 'chatbots',
      queryKey: businessKeys.chatbots(negocioIds),
      enabled: negocioIds.length > 0,
    }
  ]);
  
  return <div>Status: {allSubscribed ? 'Conectado' : 'Conectando...'}</div>;
}
```

---

## Hooks de Performance

### `debounce()`
Para inputs de busca.

```typescript
import { debounce } from '@/lib/performance';
import { useState, useMemo } from 'react';

function SearchInput() {
  const [search, setSearch] = useState('');
  
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      // Fazer busca aqui
      console.log('Buscando:', value);
    }, 300),
    []
  );
  
  return (
    <input 
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
      }}
    />
  );
}
```

### `measurePerformance()`
Para medir performance de operações.

```typescript
import { measurePerformance } from '@/lib/performance';

async function heavyOperation() {
  await measurePerformance('fetch-data', async () => {
    const data = await fetch('/api/data');
    return data.json();
  });
}
// Console: [Performance] fetch-data: 245.67ms
```

---

## Boas Práticas

### 1. Sempre use os hooks de negócio
❌ **Errado:**
```typescript
const { data } = await supabase.from('negocios').select();
```

✅ **Correto:**
```typescript
const { data: negocios } = useNegocios();
```

### 2. Use o hook centralizado quando possível
❌ **Errado:**
```typescript
const negocios = useNegocios();
const chatbots = useChatbots(negocioIds);
const leads = useLeads(negocioIds);
// ...
```

✅ **Correto:**
```typescript
const { negocios, chatbots, leads, metrics } = useDashboardData();
```

### 3. Memoize callbacks em componentes otimizados
```typescript
const handleClick = useCallback(() => {
  // ação
}, [dependencies]);
```

### 4. Use realtime apenas quando necessário
```typescript
// Apenas em componentes que precisam de updates em tempo real
useOptimizedRealtime({
  table: 'leads',
  queryKey: businessKeys.leads(negocioIds),
  enabled: isRealtimeEnabled && negocioIds.length > 0,
});
```

---

## Troubleshooting

### Dados não atualizam após mutation
**Problema:** Dados não atualizam após criar/editar.

**Solução:** Verifique se a mutation está invalidando o cache correto:
```typescript
queryClient.invalidateQueries({ 
  queryKey: businessKeys.negocios(userId) 
});
```

### Realtime não funciona
**Problema:** Updates em tempo real não aparecem.

**Solução:** 
1. Verifique se o filtro está correto
2. Confirme que a tabela está publicada no Supabase
3. Verifique se o `enabled` está true

### Performance ruim com listas grandes
**Solução:** Use virtualização:
```typescript
import { useVirtual } from 'react-virtual';
```

---

## Query Keys

Sempre use as query keys definidas:

```typescript
export const businessKeys = {
  all: ['business'],
  negocios: (userId: string) => [...businessKeys.all, 'negocios', userId],
  chatbots: (negocioIds: string[]) => [...businessKeys.all, 'chatbots', negocioIds],
  leads: (negocioIds: string[]) => [...businessKeys.all, 'leads', negocioIds],
  automacoes: (userId: string) => [...businessKeys.all, 'automacoes', userId],
  agendamentos: (negocioIds: string[]) => [...businessKeys.all, 'agendamentos', negocioIds],
};
```

Isso garante invalidação correta do cache.
