import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseOptimizedRealtimeOptions {
  table: string;
  queryKey: readonly any[];
  enabled?: boolean;
  filter?: {
    column: string;
    value: any;
  };
}

/**
 * Hook otimizado para subscriptions de realtime do Supabase
 * - Cleanup automático de channels
 * - Invalidação de cache do React Query
 * - Suporte a filtros
 * - Previne múltiplas subscriptions
 */
export function useOptimizedRealtime({
  table,
  queryKey,
  enabled = true,
  filter,
}: UseOptimizedRealtimeOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  const handleChange = useCallback(() => {
    // Invalidate queries quando houver mudanças
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  useEffect(() => {
    if (!enabled || isSubscribedRef.current) return;

    const channelName = `${table}-changes-${Date.now()}`;
    
    // Criar configuração do filtro
    const filterConfig: any = {
      event: '*',
      schema: 'public',
      table,
    };

    if (filter) {
      filterConfig.filter = `${filter.column}=eq.${filter.value}`;
    }

    // Criar e subscrever ao channel
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', filterConfig, handleChange)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [enabled, table, filter?.column, filter?.value, handleChange]);

  return {
    isSubscribed: isSubscribedRef.current,
  };
}

/**
 * Hook para múltiplas subscriptions de realtime
 */
export function useMultipleRealtime(subscriptions: UseOptimizedRealtimeOptions[]) {
  const results = subscriptions.map(sub => 
    useOptimizedRealtime(sub)
  );

  return {
    allSubscribed: results.every(r => r.isSubscribed),
    subscriptions: results,
  };
}

/**
 * Hook simplificado para realtime (compatibilidade com código legado)
 * @deprecated Use useOptimizedRealtime com queryKey ao invés
 */
export function useRealtimeTable(
  table: string, 
  callback: () => void | Promise<void>
) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channelName = `${table}-simple-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
      }, () => {
        callback();
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, callback]);
}
