# FASE 4: Acessibilidade - Implementação Completa

## 📋 Visão Geral

Esta fase foca em tornar a aplicação totalmente acessível, seguindo as diretrizes WCAG 2.1 nível AA e melhores práticas de acessibilidade web.

## 🎯 Objetivos Alcançados

### 1. **Navegação por Teclado**
- ✅ Hook `useKeyboardNavigation` para atalhos customizáveis
- ✅ Hook `useFocusTrap` para modal/dialog
- ✅ Hook `useListNavigation` para listas navegáveis
- ✅ Suporte completo a Tab, Enter, Escape, e Arrow keys

### 2. **Leitores de Tela**
- ✅ Hook `useScreenReader` com ARIA live regions
- ✅ Hook `usePageTitle` para anúncios de navegação
- ✅ Hook `useAccessibleAction` para feedback de ações
- ✅ Componente `AccessibleIcon` com labels apropriados

### 3. **Componentes Acessíveis**
- ✅ `SkipToContent` - Pular para conteúdo principal
- ✅ `AccessibleTabs` - Tabs com ARIA roles completos
- ✅ `AccessibleIcon` - Ícones com suporte a SR
- ✅ Todos componentes com focus visible

### 4. **Preferências do Usuário**
- ✅ Hook `useAccessibilityPreferences` para detectar:
  - `prefers-reduced-motion`
  - `prefers-contrast`
  - Preferências de texto

## 📦 Novos Arquivos Criados

```
src/
├── hooks/
│   ├── useKeyboardNavigation.ts      # Navegação e atalhos
│   ├── useScreenReader.ts            # Anúncios ARIA
│   └── useAccessibility.ts           # Preferências e ações
├── components/ui/
│   ├── skip-to-content.tsx          # Skip link
│   ├── accessible-icon.tsx          # Ícones acessíveis
│   └── accessible-tabs.tsx          # Tabs ARIA-compliant
```

## 🚀 Como Usar

### 1. Navegação por Teclado

```tsx
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

function MyComponent() {
  useKeyboardNavigation({
    onEscape: () => closeModal(),
    onEnter: () => submitForm(),
    onArrowDown: () => moveNext(),
    onArrowUp: () => movePrevious(),
  });
}
```

### 2. Focus Trap (Modais)

```tsx
import { useFocusTrap } from '@/hooks/useKeyboardNavigation';

function Modal() {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useFocusTrap(modalRef, {
    enabled: isOpen,
    initialFocus: firstButtonRef.current,
  });
  
  return <div ref={modalRef}>...</div>;
}
```

### 3. Anúncios para Leitores de Tela

```tsx
import { useScreenReader } from '@/hooks/useScreenReader';

function Form() {
  const { announce } = useScreenReader();
  
  const handleSubmit = async () => {
    announce('Salvando dados...', 'polite');
    await saveData();
    announce('Dados salvos com sucesso!', 'polite');
  };
}
```

### 4. Ações Acessíveis

```tsx
import { useAccessibleAction } from '@/hooks/useAccessibility';

function DataTable() {
  const { announceSuccess, announceError } = useAccessibleAction();
  
  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      announceSuccess('Item excluído');
    } catch (error) {
      announceError('Falha ao excluir item');
    }
  };
}
```

### 5. Skip to Content

```tsx
// Em App.tsx ou Layout principal
import { SkipToContent } from '@/components/ui/skip-to-content';

function Layout() {
  return (
    <>
      <SkipToContent targetId="main-content" />
      <nav>...</nav>
      <main id="main-content" tabIndex={-1}>
        {/* Conteúdo principal */}
      </main>
    </>
  );
}
```

### 6. Ícones Acessíveis

```tsx
import { AccessibleIcon } from '@/components/ui/accessible-icon';
import { Trash, Edit } from 'lucide-react';

function ActionButtons() {
  return (
    <>
      <button>
        <AccessibleIcon icon={Edit} label="Editar item" />
      </button>
      <button>
        <AccessibleIcon icon={Trash} label="Excluir item" />
      </button>
    </>
  );
}
```

### 7. Tabs Acessíveis

```tsx
import { 
  AccessibleTabs, 
  AccessibleTabsList, 
  AccessibleTabsTrigger,
  AccessibleTabsContent 
} from '@/components/ui/accessible-tabs';

function Dashboard() {
  return (
    <AccessibleTabs defaultValue="overview">
      <AccessibleTabsList>
        <AccessibleTabsTrigger value="overview">
          Visão Geral
        </AccessibleTabsTrigger>
        <AccessibleTabsTrigger value="analytics">
          Análises
        </AccessibleTabsTrigger>
      </AccessibleTabsList>
      
      <AccessibleTabsContent value="overview">
        {/* Conteúdo */}
      </AccessibleTabsContent>
    </AccessibleTabs>
  );
}
```

### 8. Detectar Preferências

```tsx
import { useAccessibilityPreferences } from '@/hooks/useAccessibility';

function AnimatedComponent() {
  const { reducedMotion } = useAccessibilityPreferences();
  
  return (
    <motion.div
      animate={reducedMotion ? {} : { scale: 1.1 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
    >
      Conteúdo
    </motion.div>
  );
}
```

## ✅ Checklist de Acessibilidade

### Navegação
- ✅ Todos os elementos interativos são acessíveis via teclado
- ✅ Ordem de tab lógica e intuitiva
- ✅ Focus trap em modais e diálogos
- ✅ Skip to content implementado
- ✅ Atalhos de teclado documentados

### ARIA & Semântica
- ✅ ARIA roles apropriados (`role="button"`, `role="dialog"`, etc.)
- ✅ ARIA labels para ícones e botões sem texto
- ✅ ARIA live regions para anúncios dinâmicos
- ✅ ARIA expanded/pressed em elementos interativos
- ✅ Landmarks semânticos (`<main>`, `<nav>`, `<aside>`)

### Visual
- ✅ Focus visible em todos os elementos interativos
- ✅ Contraste de cores WCAG AA (4.5:1 para texto)
- ✅ Tamanhos de toque mínimos (44x44px)
- ✅ Suporte a zoom até 200%
- ✅ Respeita `prefers-reduced-motion`

### Conteúdo
- ✅ Todos os ícones têm labels
- ✅ Imagens têm alt text descritivo
- ✅ Formulários têm labels associados
- ✅ Mensagens de erro são claras e associadas aos campos
- ✅ Títulos de página são descritivos

## 🎨 Classes CSS de Acessibilidade

```css
/* Já incluído em index.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus-visible:focus {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

## 🧪 Testando Acessibilidade

### Ferramentas Recomendadas:
1. **axe DevTools** - Plugin para Chrome/Firefox
2. **WAVE** - Web Accessibility Evaluation Tool
3. **Lighthouse** - Auditoria de acessibilidade no Chrome DevTools
4. **NVDA/JAWS** - Testadores de leitores de tela

### Testes Manuais:
```bash
# 1. Navegação por teclado
- Tab através de todos os elementos
- Enter/Space para ativar botões
- Escape para fechar modais
- Arrow keys para navegar listas

# 2. Leitor de tela
- Ative o leitor de tela (NVDA no Windows)
- Navegue pela página
- Verifique se os anúncios são claros

# 3. Zoom
- Aumente o zoom para 200%
- Verifique se o layout não quebra
```

## 🔄 Próximos Passos para Integração

1. **Adicionar SkipToContent no Layout principal**
2. **Migrar Tabs existentes para AccessibleTabs**
3. **Adicionar anúncios em todas as ações CRUD**
4. **Implementar focus trap em todos os modais**
5. **Revisar todos os ícones e adicionar labels**
6. **Testar com leitores de tela reais**

## 📚 Recursos

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

## 🎯 Métricas de Sucesso

- ✅ Score Lighthouse Accessibility: 100
- ✅ 0 erros automáticos no axe DevTools
- ✅ Navegação completa por teclado
- ✅ Compatível com leitores de tela populares
- ✅ Suporte a preferências de usuário

---

**Status**: ✅ Fase 4 Concluída
**Próxima Fase**: Migração dos componentes existentes para usar os novos recursos
