import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeTableOptions<T> {
  queryKey: readonly any[];
  enabled?: boolean;
  showNotifications?: boolean;
  onInsert?: (record: T) => void;
  onUpdate?: (record: T) => void;
  onDelete?: (record: T) => void;
  filter?: { column: string; value: any };
}

interface RealtimeStats {
  inserts: number;
  updates: number;
  deletes: number;
  lastEvent: Date | null;
}

export function useRealtimeTable<T extends Record<string, any>>(tableName: string, options: RealtimeTableOptions<T>) {
  const { queryKey, enabled = true, filter } = options;
  const queryClient = useQueryClient();
  const [stats, setStats] = useState<RealtimeStats>({ inserts: 0, updates: 0, deletes: 0, lastEvent: null });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase.channel(`rt-${tableName}-${Date.now()}`);
    
    ['INSERT', 'UPDATE', 'DELETE'].forEach(event => {
      channel.on('postgres_changes', { event: event as any, schema: 'public', table: tableName }, (payload) => {
        setStats((prev) => ({ ...prev, [event.toLowerCase() + 's']: prev[event.toLowerCase() + 's' as keyof RealtimeStats] as number + 1, lastEvent: new Date() }));
        queryClient.invalidateQueries({ queryKey });
      });
    });

    channel.subscribe((status) => setIsConnected(status === 'SUBSCRIBED'));
    return () => { supabase.removeChannel(channel); setIsConnected(false); };
  }, [enabled, tableName, queryKey, queryClient]);

  const resetStats = useCallback(() => setStats({ inserts: 0, updates: 0, deletes: 0, lastEvent: null }), []);
  const totalEvents = useMemo(() => stats.inserts + stats.updates + stats.deletes, [stats]);

  return { isConnected, stats, totalEvents, resetStats };
}

interface TableConfig {
  name: string;
  queryKey: readonly any[];
  enabled?: boolean;
  filter?: { column: string; value: any };
}

interface MultiTableConnection {
  [tableName: string]: boolean;
}

interface GlobalStats extends RealtimeStats {
  totalEvents: number;
}

export function useMultipleRealtimeTables(tables: TableConfig[]) {
  const [connections, setConnections] = useState<MultiTableConnection>({});
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    inserts: 0,
    updates: 0,
    deletes: 0,
    lastEvent: null,
    totalEvents: 0,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const channels = tables.map((table) => {
      const channel = supabase.channel(`rt-multi-${table.name}-${Date.now()}`);
      
      ['INSERT', 'UPDATE', 'DELETE'].forEach(event => {
        channel.on('postgres_changes', { event: event as any, schema: 'public', table: table.name }, () => {
          setGlobalStats((prev) => ({
            ...prev,
            [event.toLowerCase() + 's']: (prev[event.toLowerCase() + 's' as keyof RealtimeStats] as number) + 1,
            lastEvent: new Date(),
            totalEvents: prev.totalEvents + 1,
          }));
          queryClient.invalidateQueries({ queryKey: table.queryKey });
        });
      });

      channel.subscribe((status) => {
        setConnections((prev) => ({ ...prev, [table.name]: status === 'SUBSCRIBED' }));
      });

      return channel;
    });

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
      setConnections({});
    };
  }, [tables, queryClient]);

  const allConnected = useMemo(() => Object.values(connections).every(Boolean), [connections]);
  
  const resetAllStats = useCallback(() => {
    setGlobalStats({ inserts: 0, updates: 0, deletes: 0, lastEvent: null, totalEvents: 0 });
  }, []);

  return { connections, allConnected, globalStats, resetAllStats };
}
