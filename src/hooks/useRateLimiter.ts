import { useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RequestRecord {
  count: number;
  resetAt: number;
}

/**
 * Hook para rate limiting client-side
 * Previne abuso e spam de ações
 */
export function useRateLimiter(config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
  const requestsRef = useRef(new Map<string, RequestRecord>());

  const checkLimit = useCallback(
    (key: string): boolean => {
      const now = Date.now();
      const record = requestsRef.current.get(key);

      if (!record || now > record.resetAt) {
        // Nova janela de tempo
        requestsRef.current.set(key, {
          count: 1,
          resetAt: now + config.windowMs,
        });
        return true;
      }

      if (record.count >= config.maxRequests) {
        const remainingTime = Math.ceil((record.resetAt - now) / 1000);
        toast({
          title: 'Limite de requisições atingido',
          description: config.message || `Aguarde ${remainingTime}s antes de tentar novamente`,
          variant: 'destructive',
        });
        return false;
      }

      // Incrementa contador
      record.count++;
      requestsRef.current.set(key, record);
      return true;
    },
    [config]
  );

  const withRateLimit = useCallback(
    async <T,>(key: string, fn: () => Promise<T>): Promise<T | null> => {
      if (!checkLimit(key)) {
        return null;
      }
      return await fn();
    },
    [checkLimit]
  );

  const getRemainingRequests = useCallback(
    (key: string): number => {
      const record = requestsRef.current.get(key);
      if (!record) return config.maxRequests;
      
      const now = Date.now();
      if (now > record.resetAt) return config.maxRequests;
      
      return Math.max(0, config.maxRequests - record.count);
    },
    [config.maxRequests]
  );

  const resetLimit = useCallback((key: string) => {
    requestsRef.current.delete(key);
  }, []);

  return {
    checkLimit,
    withRateLimit,
    getRemainingRequests,
    resetLimit,
  };
}
