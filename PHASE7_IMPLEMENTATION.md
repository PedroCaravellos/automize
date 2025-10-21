# FASE 7: Testes - Implementação Completa

## 📋 Visão Geral

Esta fase estabelece uma infraestrutura completa de testes para garantir qualidade, confiabilidade e facilitar manutenção do código.

## 🎯 Objetivos Alcançados

### 1. **Configuração de Testes**
- ✅ Vitest configurado como test runner
- ✅ React Testing Library para testes de componentes
- ✅ Setup global com mocks necessários
- ✅ Configuração de coverage
- ✅ Aliases de path configurados

### 2. **Utilitários de Teste**
- ✅ `renderWithProviders` - render com todos providers
- ✅ Mocks de dados (user, negocio, chatbot, lead)
- ✅ Helpers para testes assíncronos
- ✅ Re-exports do testing-library

### 3. **Testes Unitários de Hooks**
- ✅ Testes para `useUndoRedo`
- ✅ Testes para `useListUndoRedo`
- ✅ Testes para `useSecureInput`
- ✅ Testes para `useRateLimiter`
- ✅ Cobertura completa de casos de uso

### 4. **Testes de Componentes**
- ✅ Testes para Button component
- ✅ Exemplos de testes de interação
- ✅ Testes de acessibilidade básicos
- ✅ Testes de variantes e props

## 📦 Arquivos Criados

```
src/
├── test/
│   ├── setup.ts           # Configuração global de testes
│   └── utils.tsx          # Utilitários e helpers
├── hooks/__tests__/
│   ├── useUndoRedo.test.ts
│   ├── useSecureInput.test.ts
│   └── useRateLimiter.test.ts
├── components/ui/__tests__/
│   └── button.test.tsx
vitest.config.ts            # Configuração do Vitest
```

## 🚀 Como Usar

### Executar Testes

```bash
# Rodar todos os testes
npm test

# Rodar testes em watch mode
npm test -- --watch

# Rodar testes com coverage
npm test -- --coverage

# Rodar testes específicos
npm test useUndoRedo

# Rodar testes de um arquivo
npm test button.test
```

### Estrutura de um Teste

```tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '../useCustomHook';

describe('useCustomHook', () => {
  it('deve inicializar com valor padrão', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(0);
  });

  it('deve incrementar valor', () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.increment();
    });

    expect(result.current.value).toBe(1);
  });
});
```

### Testar Componentes

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, userEvent } from '@/test/utils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('deve renderizar texto', () => {
    render(<MyComponent text="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('deve chamar callback quando clicado', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<MyComponent onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testar com Providers

```tsx
import { renderWithProviders, mockAuthUser } from '@/test/utils';

describe('DashboardComponent', () => {
  it('deve renderizar para usuário autenticado', () => {
    // Componente será renderizado com AuthProvider, QueryClientProvider, etc
    renderWithProviders(<DashboardComponent />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

### Testar Hooks Assíncronos

```tsx
import { renderHook, waitFor } from '@testing-library/react';

describe('useAsyncData', () => {
  it('deve carregar dados', async () => {
    const { result } = renderHook(() => useAsyncData());
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

### Mock de APIs

```tsx
import { vi } from 'vitest';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

// Mock de hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));
```

## 📋 Padrões de Teste

### 1. Nomenclatura

```tsx
// ✅ CORRETO: Descrição clara
describe('useUndoRedo', () => {
  it('deve inicializar com estado inicial', () => {});
  it('deve adicionar ao histórico quando state muda', () => {});
  it('deve fazer undo corretamente', () => {});
});

// ❌ ERRADO: Descrições vagas
describe('useUndoRedo', () => {
  it('teste 1', () => {});
  it('funciona', () => {});
});
```

### 2. Arrange-Act-Assert (AAA)

```tsx
it('deve incrementar contador', () => {
  // Arrange: Configurar
  const { result } = renderHook(() => useCounter());
  
  // Act: Executar ação
  act(() => {
    result.current.increment();
  });
  
  // Assert: Verificar resultado
  expect(result.current.count).toBe(1);
});
```

### 3. One Assertion Per Test (quando possível)

```tsx
// ✅ CORRETO: Teste focado
it('deve incrementar contador', () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});

it('deve decrementar contador', () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.decrement());
  expect(result.current.count).toBe(-1);
});

// ❌ EVITAR: Múltiplas asserções não relacionadas
it('deve incrementar e decrementar', () => {
  // Muito complexo, dificulta debug
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
  act(() => result.current.decrement());
  expect(result.current.count).toBe(0);
});
```

### 4. Usar describe para agrupar

```tsx
describe('useRateLimiter', () => {
  describe('checkLimit', () => {
    it('deve permitir dentro do limite', () => {});
    it('deve bloquear acima do limite', () => {});
  });

  describe('resetLimit', () => {
    it('deve resetar contador', () => {});
  });
});
```

## 🎯 O que Testar

### Hooks Customizados
- ✅ Estado inicial
- ✅ Mudanças de estado
- ✅ Efeitos colaterais
- ✅ Callbacks
- ✅ Casos de erro

### Componentes
- ✅ Renderização com props diferentes
- ✅ Interações do usuário
- ✅ Estados loading/error/success
- ✅ Acessibilidade (roles, labels)
- ✅ Integração com hooks

### Funções Utilitárias
- ✅ Inputs válidos
- ✅ Inputs inválidos
- ✅ Edge cases
- ✅ Null/undefined
- ✅ Performance (se relevante)

## ❌ O que NÃO Testar

- ❌ Implementação de bibliotecas externas
- ❌ Lógica trivial (getters/setters simples)
- ❌ Código gerado automaticamente
- ❌ Tipos TypeScript (já são verificados pelo compilador)

## 📊 Coverage

```bash
# Gerar relatório de coverage
npm test -- --coverage

# Ver relatório no browser
open coverage/index.html
```

### Metas de Coverage

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

**Nota**: Coverage alto não garante qualidade. Foque em testar comportamentos críticos.

## 🐛 Debugging de Testes

### 1. Usar debug do testing-library

```tsx
import { screen } from '@testing-library/react';

it('teste com debug', () => {
  render(<MyComponent />);
  
  // Mostra HTML atual no console
  screen.debug();
  
  // Mostra elemento específico
  screen.debug(screen.getByRole('button'));
});
```

### 2. Usar logRoles

```tsx
import { logRoles } from '@testing-library/react';

it('listar roles disponíveis', () => {
  const { container } = render(<MyComponent />);
  logRoles(container);
});
```

### 3. Testing Playground

```tsx
import { screen } from '@testing-library/react';

it('encontrar queries', () => {
  render(<MyComponent />);
  
  // Abre browser com queries sugeridas
  screen.logTestingPlaygroundURL();
});
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## 📚 Exemplos Completos

### Testar Form com Validação

```tsx
describe('LoginForm', () => {
  it('deve mostrar erro para email inválido', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
  });

  it('deve submeter form com dados válidos', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Testar Modal

```tsx
describe('ConfirmationModal', () => {
  it('deve abrir e fechar modal', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    
    render(
      <ConfirmationModal open={true} onOpenChange={handleClose}>
        Confirmar ação?
      </ConfirmationModal>
    );
    
    expect(screen.getByText(/confirmar ação/i)).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(handleClose).toHaveBeenCalledWith(false);
  });
});
```

### Testar Lista com Loading

```tsx
describe('UserList', () => {
  it('deve mostrar skeleton durante loading', () => {
    render(<UserList isLoading={true} users={[]} />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('deve mostrar empty state sem usuários', () => {
    render(<UserList isLoading={false} users={[]} />);
    expect(screen.getByText(/nenhum usuário/i)).toBeInTheDocument();
  });

  it('deve renderizar lista de usuários', () => {
    const users = [
      { id: '1', name: 'João' },
      { id: '2', name: 'Maria' },
    ];
    
    render(<UserList isLoading={false} users={users} />);
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
  });
});
```

## 🎓 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 📈 Métricas de Sucesso

- [x] Configuração de testes completa
- [x] Utilitários e mocks criados
- [x] Testes de exemplo para hooks
- [x] Testes de exemplo para componentes
- [x] Documentação completa
- [x] Scripts de teste configurados

**Status: ✅ FASE 7 CONCLUÍDA COM SUCESSO**

---

## 🚀 Próximos Passos

1. **Escrever mais testes** para componentes críticos
2. **Aumentar coverage** gradualmente
3. **Adicionar testes E2E** com Playwright ou Cypress
4. **Configurar CI/CD** para rodar testes automaticamente
5. **Criar snapshots** para componentes UI complexos
6. **Performance testing** para operações críticas

---

**IMPORTANTE**: Testes são um investimento. Comece pelos componentes mais críticos e expanda gradualmente.
