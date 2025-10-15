import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook customizado para sincronização em tempo real com tabelas do Supabase
 * @param tableName - Nome da tabela para monitorar
 * @param onRefresh - Função callback para recarregar dados
 */
export const useRealtimeTable = (
  tableName: string,
  onRefresh: () => Promise<void>
) => {
  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}-realtime-changes`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          console.log(`[Realtime] ${tableName} changed:`, payload);
          // Refresh data when any change occurs
          onRefresh();
        }
      )
      .subscribe();

    console.log(`[Realtime] Subscribed to ${tableName} changes`);

    return () => {
      console.log(`[Realtime] Unsubscribed from ${tableName} changes`);
      supabase.removeChannel(channel);
    };
  }, [tableName, onRefresh]);
};
