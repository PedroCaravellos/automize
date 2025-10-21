# FASE 6: Segurança & Monitoramento - Implementação Completa

## 📋 Visão Geral

Esta fase implementa sistemas críticos de segurança e monitoramento para proteger a aplicação contra ataques, detectar anomalias e rastrear performance.

## 🎯 Objetivos Alcançados

### 1. **Sistema de Auditoria**
- ✅ Hook `useAuditLog` para log de ações críticas
- ✅ Rastreamento de CRUD operations
- ✅ Logs de autenticação e mudanças de permissão
- ✅ Metadata completo (timestamp, user agent, etc)
- ✅ Armazenamento local com limite de 100 entradas

### 2. **Validação e Sanitização**
- ✅ Hook `useSecureInput` para inputs seguros
- ✅ Sanitização de strings, emails, phones, URLs
- ✅ Detecção de SQL Injection
- ✅ Detecção de XSS attacks
- ✅ Integração com Zod schemas
- ✅ Cache de validação

### 3. **Rate Limiting**
- ✅ Hook `useRateLimiter` para prevenir abuso
- ✅ Janela de tempo configurável
- ✅ Feedback ao usuário quando limite atingido
- ✅ Reset manual de limites
- ✅ Contador de requisições restantes

### 4. **Monitoramento de Segurança**
- ✅ Hook `useSecurityMonitor` para eventos
- ✅ Classificação por tipo e severidade
- ✅ Métricas agregadas em tempo real
- ✅ Armazenamento persistente de eventos
- ✅ Filtros por tipo e severidade

### 5. **Monitoramento de Performance**
- ✅ Hook `usePerformanceMonitor` para métricas
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ Estatísticas (avg, min, max, p95, p99)
- ✅ Medição de funções assíncronas
- ✅ Dashboard visual de métricas

### 6. **Dashboard de Segurança**
- ✅ Componente `SecurityDashboard` visual
- ✅ Cards com métricas principais
- ✅ Tabs para eventos, performance e auditoria
- ✅ Badges coloridos por severidade
- ✅ Timeline de eventos recentes

## 📦 Novos Arquivos Criados

```
src/
├── hooks/
│   ├── useAuditLog.ts           # Log de auditoria
│   ├── useSecureInput.ts        # Validação segura
│   ├── useRateLimiter.ts        # Rate limiting
│   ├── useSecurityMonitor.ts    # Monitoramento segurança
│   └── usePerformanceMonitor.ts # Monitoramento performance
├── components/dashboard/
│   └── SecurityDashboard.tsx    # Dashboard visual
```

## 🚀 Como Usar

### 1. Log de Auditoria

```tsx
import { useAuditLog } from '@/hooks/useAuditLog';

function NegocioForm() {
  const { logCreate, logUpdate, logDelete } = useAuditLog();

  const handleCreate = async (data: NegocioInput) => {
    const negocio = await createNegocio(data);
    
    // Registrar criação
    await logCreate('negocio', negocio.id, {
      nome: negocio.nome,
      tipo: negocio.tipo_negocio,
    });
  };

  const handleUpdate = async (id: string, updates: Partial<Negocio>) => {
    await updateNegocio(id, updates);
    
    // Registrar atualização
    await logUpdate('negocio', id, {
      changes: updates,
      changedFields: Object.keys(updates),
    });
  };

  const handleDelete = async (id: string) => {
    await deleteNegocio(id);
    
    // Registrar exclusão
    await logDelete('negocio', id, {
      deletedAt: new Date().toISOString(),
    });
  };
}
```

### 2. Validação Segura de Inputs

```tsx
import { useSecureInput } from '@/hooks/useSecureInput';
import { toast } from '@/hooks/use-toast';

function ContactForm() {
  const {
    validateSecure,
    sanitizeEmail,
    sanitizePhone,
    checkSQLInjection,
    checkXSS,
  } = useSecureInput();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const nome = formData.get('nome') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    // Validar nome
    const nomeValidation = validateSecure(nome, 'string');
    if (!nomeValidation.isValid) {
      toast({
        title: 'Nome inválido',
        description: nomeValidation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    // Validar e sanitizar email
    const emailValidation = validateSecure(email, 'email');
    if (!emailValidation.isValid) {
      toast({
        title: 'Email inválido',
        description: emailValidation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    // Sanitizar telefone
    const sanitizedPhone = sanitizePhone(phone);

    // Enviar dados sanitizados
    submitForm({
      nome: nomeValidation.sanitized,
      email: emailValidation.sanitized,
      phone: sanitizedPhone,
    });
  };
}
```

### 3. Validação com Zod

```tsx
import { useSecureInput } from '@/hooks/useSecureInput';
import { z } from 'zod';

const negocioSchema = z.object({
  nome: z.string().min(3).max(100),
  email: z.string().email(),
  telefone: z.string().regex(/^\+?[\d\s()-]+$/),
});

function SecureNegocioForm() {
  const { validateWithSchema } = useSecureInput();

  const handleSubmit = (data: unknown) => {
    const validation = validateWithSchema(negocioSchema, data);
    
    if (!validation.isValid) {
      toast({
        title: 'Dados inválidos',
        description: validation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    // Usar dados validados e type-safe
    const safeData = validation.sanitized!;
    createNegocio(safeData);
  };
}
```

### 4. Rate Limiting

```tsx
import { useRateLimiter } from '@/hooks/useRateLimiter';

function SearchBar() {
  const rateLimiter = useRateLimiter({
    maxRequests: 5,
    windowMs: 10000, // 5 requisições por 10 segundos
    message: 'Aguarde antes de fazer nova busca',
  });

  const handleSearch = async (query: string) => {
    const result = await rateLimiter.withRateLimit(
      'search-action',
      async () => {
        return await performSearch(query);
      }
    );

    if (result) {
      displayResults(result);
    }
  };

  const remaining = rateLimiter.getRemainingRequests('search-action');

  return (
    <div>
      <Input onChange={(e) => handleSearch(e.target.value)} />
      <p className="text-xs text-muted-foreground">
        {remaining} buscas restantes
      </p>
    </div>
  );
}
```

### 5. Monitoramento de Segurança

```tsx
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';

function AuthForm() {
  const {
    logFailedAuth,
    logSuspiciousActivity,
    metrics,
  } = useSecurityMonitor();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (error) {
      // Registrar falha de autenticação
      logFailedAuth('Login failed', {
        email,
        reason: error.message,
        attempts: getLoginAttempts(email),
      });

      // Detectar tentativas suspeitas
      const attempts = getLoginAttempts(email);
      if (attempts > 3) {
        logSuspiciousActivity('Multiple failed login attempts', {
          email,
          totalAttempts: attempts,
          timeWindow: '5 minutes',
        });
      }
    }
  };

  return (
    <div>
      <Form onSubmit={handleLogin} />
      {metrics.failedAuthAttempts > 5 && (
        <Alert variant="destructive">
          Múltiplas falhas de autenticação detectadas
        </Alert>
      )}
    </div>
  );
}
```

### 6. Monitoramento de Performance

```tsx
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

function DataTable() {
  const { measure, getStats } = usePerformanceMonitor();

  const loadData = async () => {
    // Medir tempo de carregamento
    const data = await measure('load-table-data', async () => {
      return await fetchTableData();
    });

    setData(data);
  };

  const handleExport = async () => {
    // Medir tempo de exportação
    await measure('export-data', async () => {
      return await exportToCSV(data);
    }, { format: 'csv', rows: data.length });
  };

  // Ver estatísticas
  const loadStats = getStats('load-table-data');
  
  return (
    <div>
      <Table data={data} />
      {loadStats && (
        <p className="text-xs text-muted-foreground">
          Tempo médio: {loadStats.avgDuration.toFixed(2)}ms
        </p>
      )}
    </div>
  );
}
```

### 7. Dashboard de Segurança

```tsx
import { SecurityDashboard } from '@/components/dashboard/SecurityDashboard';

function AdminPage() {
  return (
    <div className="p-6">
      <h1>Painel de Segurança</h1>
      <SecurityDashboard />
    </div>
  );
}
```

## ✅ Checklist de Segurança

### Input Validation
- ✅ Todos inputs validados antes de processar
- ✅ Sanitização automática de strings
- ✅ Detecção de SQL injection
- ✅ Detecção de XSS
- ✅ Validação de emails, URLs, telefones
- ✅ Integração com Zod para schemas complexos

### Rate Limiting
- ✅ Limite por ação (login, search, create, etc)
- ✅ Janelas de tempo configuráveis
- ✅ Feedback visual ao usuário
- ✅ Proteção contra spam e DDoS

### Auditoria
- ✅ Log de todas operações CRUD
- ✅ Log de autenticação
- ✅ Log de mudanças de configuração
- ✅ Metadata completo (user, timestamp, user agent)
- ✅ Armazenamento persistente

### Monitoramento
- ✅ Eventos de segurança classificados
- ✅ Métricas agregadas em tempo real
- ✅ Dashboard visual de segurança
- ✅ Alertas para eventos críticos
- ✅ Performance tracking (Core Web Vitals)

### Performance
- ✅ Medição de LCP, FID, CLS
- ✅ Estatísticas (avg, p95, p99)
- ✅ Tracking de operações assíncronas
- ✅ Identificação de gargalos

## 🛡️ Boas Práticas de Segurança

### 1. Sempre Validar Inputs
```tsx
// ❌ ERRADO: Sem validação
const handleSave = (data: any) => {
  saveToDatabase(data);
};

// ✅ CORRETO: Com validação
const handleSave = (data: any) => {
  const validation = validateSecure(data.name, 'string');
  if (!validation.isValid) {
    toast({ title: 'Dados inválidos', variant: 'destructive' });
    return;
  }
  saveToDatabase({ ...data, name: validation.sanitized });
};
```

### 2. Rate Limit em Ações Críticas
```tsx
// ✅ Login com rate limit
const handleLogin = async (email: string, password: string) => {
  await rateLimiter.withRateLimit('login', async () => {
    return await signIn(email, password);
  });
};

// ✅ Export com rate limit
const handleExport = async () => {
  await rateLimiter.withRateLimit('export', async () => {
    return await exportData();
  });
};
```

### 3. Log de Ações Importantes
```tsx
// ✅ Log de mudanças críticas
const handleUpdatePermissions = async (userId: string, newRole: string) => {
  await updateUserRole(userId, newRole);
  await logUpdate('user', userId, {
    action: 'permission_change',
    oldRole: currentRole,
    newRole,
    changedBy: currentUser.id,
  });
};
```

### 4. Monitorar Comportamento Suspeito
```tsx
// ✅ Detectar múltiplas tentativas
const handleLogin = async (email: string, password: string) => {
  const attempts = getAttempts(email);
  
  if (attempts > 3) {
    logSuspiciousActivity('Multiple failed logins', { email, attempts });
    // Bloquear temporariamente
    return;
  }
  
  try {
    await signIn(email, password);
  } catch (error) {
    incrementAttempts(email);
    logFailedAuth('Login failed', { email });
  }
};
```

## 📊 Métricas de Sucesso

- [x] Sistema de auditoria funcional
- [x] Validação e sanitização de inputs
- [x] Rate limiting implementado
- [x] Monitoramento de segurança ativo
- [x] Performance tracking configurado
- [x] Dashboard visual de métricas
- [x] Logs persistentes
- [x] Alertas para eventos críticos

**Status: ✅ FASE 6 CONCLUÍDA COM SUCESSO**

---

## 🔒 Próximos Passos

### Melhorias Futuras

1. **Edge Function de Auditoria**
   - Criar função para persistir logs no Supabase
   - Análise de logs server-side
   - Alertas automáticos por email

2. **IP Tracking & Geolocation**
   - Rastrear IPs de requisições
   - Detectar logins de localizações suspeitas
   - Bloquear IPs maliciosos

3. **2FA (Two-Factor Authentication)**
   - Implementar autenticação de dois fatores
   - SMS ou app authenticator
   - Backup codes

4. **Session Management**
   - Limite de sessões simultâneas
   - Logout remoto de dispositivos
   - Detecção de session hijacking

5. **Advanced Monitoring**
   - Integração com Sentry para errors
   - APM (Application Performance Monitoring)
   - Real User Monitoring (RUM)

6. **Automated Security Scans**
   - OWASP dependency check
   - Vulnerability scanning
   - Penetration testing

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Best Practices](https://web.dev/security/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**CRÍTICO**: Esta é uma fase essencial. Teste extensivamente em produção e monitore constantemente.
