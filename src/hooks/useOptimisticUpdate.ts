import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
  successMessage?: string;
  errorMessage?: string;
  showToasts?: boolean;
}

export function useOptimisticUpdate<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const previousDataRef = useRef<T>(initialData);

  useEffect(() => {
    setData(initialData);
    previousDataRef.current = initialData;
  }, [initialData]);

  const update = useCallback(async (optimisticData: T, asyncAction: () => Promise<T>, options: OptimisticUpdateOptions<T> = {}) => {
    const { onSuccess, onError, successMessage = 'Sucesso', errorMessage = 'Erro', showToasts = true } = options;
    previousDataRef.current = data;
    setData(optimisticData);
    setIsOptimistic(true);

    try {
      const result = await asyncAction();
      setData(result);
      setIsOptimistic(false);
      if (showToasts) toast({ title: successMessage });
      onSuccess?.(result);
      return { success: true, data: result };
    } catch (error) {
      setData(previousDataRef.current);
      setIsOptimistic(false);
      if (showToasts) toast({ title: errorMessage, variant: 'destructive' });
      onError?.(error as Error, previousDataRef.current);
      return { success: false, error: error as Error };
    }
  }, [data]);

  return { data, isOptimistic, update };
}

export function useOptimisticList<T extends { id: string | number }>(initialList: T[]) {
  const [list, setList] = useState<T[]>(initialList);
  const [optimisticIds, setOptimisticIds] = useState<Set<string | number>>(new Set());

  useEffect(() => setList(initialList), [initialList]);

  const addOptimistic = useCallback(async (item: T, asyncAction: () => Promise<T>, options: OptimisticUpdateOptions<T> = {}) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { ...item, id: tempId as any };
    setList((prev) => [...prev, optimisticItem]);
    setOptimisticIds((prev) => new Set(prev).add(tempId));

    try {
      const result = await asyncAction();
      setList((prev) => prev.map((i) => (i.id === tempId ? result : i)));
      setOptimisticIds((prev) => { const s = new Set(prev); s.delete(tempId); return s; });
      if (options.showToasts !== false) toast({ title: options.successMessage || 'Item adicionado' });
      options.onSuccess?.(result);
      return { success: true, data: result };
    } catch (error) {
      setList((prev) => prev.filter((i) => i.id !== tempId));
      setOptimisticIds((prev) => { const s = new Set(prev); s.delete(tempId); return s; });
      if (options.showToasts !== false) toast({ title: options.errorMessage || 'Erro', variant: 'destructive' });
      return { success: false, error: error as Error };
    }
  }, []);

  const updateOptimistic = useCallback(async (id: string | number, updates: Partial<T>, asyncAction: () => Promise<T>, options: OptimisticUpdateOptions<T> = {}) => {
    setList((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    setOptimisticIds((prev) => new Set(prev).add(id));

    try {
      const result = await asyncAction();
      setList((prev) => prev.map((i) => (i.id === id ? result : i)));
      setOptimisticIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      if (options.showToasts !== false) toast({ title: options.successMessage || 'Item atualizado' });
      options.onSuccess?.(result);
      return { success: true, data: result };
    } catch (error) {
      setList(initialList);
      setOptimisticIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      if (options.showToasts !== false) toast({ title: options.errorMessage || 'Erro', variant: 'destructive' });
      return { success: false, error: error as Error };
    }
  }, [initialList]);

  const removeOptimistic = useCallback(async (id: string | number, asyncAction: () => Promise<void>, options: OptimisticUpdateOptions<void> = {}) => {
    const itemToRemove = list.find((i) => i.id === id);
    setList((prev) => prev.filter((i) => i.id !== id));
    setOptimisticIds((prev) => new Set(prev).add(id));

    try {
      await asyncAction();
      setOptimisticIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      if (options.showToasts !== false) toast({ title: options.successMessage || 'Item removido' });
      options.onSuccess?.(undefined as any);
      return { success: true };
    } catch (error) {
      if (itemToRemove) setList((prev) => [...prev, itemToRemove]);
      setOptimisticIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      if (options.showToasts !== false) toast({ title: options.errorMessage || 'Erro', variant: 'destructive' });
      return { success: false, error: error as Error };
    }
  }, [list]);

  const isOptimistic = useCallback((id: string | number) => optimisticIds.has(id), [optimisticIds]);

  return { list, addOptimistic, updateOptimistic, removeOptimistic, isOptimistic };
}
