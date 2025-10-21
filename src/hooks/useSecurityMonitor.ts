import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  type: 'suspicious_activity' | 'failed_auth' | 'rate_limit' | 'invalid_input' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  failedAuthAttempts: number;
  suspiciousActivities: number;
  lastEventAt: Date | null;
}

/**
 * Hook para monitoramento de segurança em tempo real
 * Detecta e registra eventos de segurança
 */
export function useSecurityMonitor() {
  const { user } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    failedAuthAttempts: 0,
    suspiciousActivities: 0,
    lastEventAt: null,
  });

  useEffect(() => {
    // Carregar eventos do localStorage
    try {
      const stored = localStorage.getItem('security_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        setEvents(parsed.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })));
      }
    } catch (error) {
      console.error('[SecurityMonitor] Failed to load events:', error);
    }
  }, []);

  useEffect(() => {
    // Calcular métricas
    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const failedAuthAttempts = events.filter(e => e.type === 'failed_auth').length;
    const suspiciousActivities = events.filter(e => e.type === 'suspicious_activity').length;
    const lastEvent = events.length > 0 ? events[events.length - 1] : null;

    setMetrics({
      totalEvents: events.length,
      criticalEvents,
      failedAuthAttempts,
      suspiciousActivities,
      lastEventAt: lastEvent?.timestamp || null,
    });
  }, [events]);

  const logEvent = useCallback((event: Omit<SecurityEvent, 'timestamp'>) => {
    const newEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    setEvents(prev => {
      const updated = [...prev, newEvent];
      // Manter apenas últimos 100 eventos
      const limited = updated.slice(-100);
      
      // Salvar no localStorage
      try {
        localStorage.setItem('security_events', JSON.stringify(limited));
      } catch (error) {
        console.error('[SecurityMonitor] Failed to save events:', error);
      }
      
      return limited;
    });

    // Log crítico no console
    if (event.severity === 'critical' || event.severity === 'high') {
      console.warn('[SecurityMonitor] Security event:', newEvent);
    }
  }, []);

  const logSuspiciousActivity = useCallback((message: string, metadata?: Record<string, any>) => {
    logEvent({
      type: 'suspicious_activity',
      severity: 'high',
      message,
      metadata,
    });
  }, [logEvent]);

  const logFailedAuth = useCallback((message: string, metadata?: Record<string, any>) => {
    logEvent({
      type: 'failed_auth',
      severity: 'medium',
      message,
      metadata,
    });
  }, [logEvent]);

  const logInvalidInput = useCallback((message: string, metadata?: Record<string, any>) => {
    logEvent({
      type: 'invalid_input',
      severity: 'low',
      message,
      metadata,
    });
  }, [logEvent]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    localStorage.removeItem('security_events');
  }, []);

  const getEventsByType = useCallback((type: SecurityEvent['type']) => {
    return events.filter(e => e.type === type);
  }, [events]);

  const getEventsBySeverity = useCallback((severity: SecurityEvent['severity']) => {
    return events.filter(e => e.severity === severity);
  }, [events]);

  return {
    events,
    metrics,
    logEvent,
    logSuspiciousActivity,
    logFailedAuth,
    logInvalidInput,
    clearEvents,
    getEventsByType,
    getEventsBySeverity,
  };
}
