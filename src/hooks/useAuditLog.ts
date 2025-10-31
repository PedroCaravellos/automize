import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AuditAction = 
  | 'create' | 'update' | 'delete' | 'view'
  | 'login' | 'logout' | 'export' | 'import'
  | 'settings_change' | 'permission_change';

export type AuditResource = 
  | 'negocio' | 'chatbot' | 'lead' | 'agendamento' 
  | 'automacao' | 'venda' | 'user' | 'integration';

interface AuditLogEntry {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details?: Record<string, any>;
  metadata?: {
    ip?: string;
    userAgent?: string;
    location?: string;
  };
}

/**
 * Hook para registro de auditoria de ações críticas
 * Registra todas as ações importantes para compliance e segurança
 */
export function useAuditLog() {
  const { user } = useAuth();

  const log = useCallback(async (entry: AuditLogEntry) => {
    if (!user?.id) {
      console.warn('[AuditLog] No user ID available, skipping log');
      return;
    }

    try {
      const logEntry = {
        user_id: user.id,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resourceId,
        details: entry.details || {},
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          ...entry.metadata,
        },
      };

      // Save to localStorage for demonstration
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      logs.push(logEntry);
      if (logs.length > 100) logs.shift(); // Manter apenas últimos 100
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('[AuditLog] Failed to log action:', error);
    }
  }, [user]);

  const logCreate = useCallback(
    (resource: AuditResource, resourceId: string, details?: Record<string, any>) => {
      return log({ action: 'create', resource, resourceId, details });
    },
    [log]
  );

  const logUpdate = useCallback(
    (resource: AuditResource, resourceId: string, details?: Record<string, any>) => {
      return log({ action: 'update', resource, resourceId, details });
    },
    [log]
  );

  const logDelete = useCallback(
    (resource: AuditResource, resourceId: string, details?: Record<string, any>) => {
      return log({ action: 'delete', resource, resourceId, details });
    },
    [log]
  );

  const logView = useCallback(
    (resource: AuditResource, resourceId?: string, details?: Record<string, any>) => {
      return log({ action: 'view', resource, resourceId, details });
    },
    [log]
  );

  const getRecentLogs = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('audit_logs') || '[]');
    } catch {
      return [];
    }
  }, []);

  return {
    log,
    logCreate,
    logUpdate,
    logDelete,
    logView,
    getRecentLogs,
  };
}
