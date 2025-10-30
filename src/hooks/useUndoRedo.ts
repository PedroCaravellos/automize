import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UndoRedoOptions {
  maxHistorySize?: number;
  onUndo?: () => void;
  onRedo?: () => void;
  enableToasts?: boolean;
}

export function useUndoRedo<T>(initialState: T, options: UndoRedoOptions = {}) {
  const { maxHistorySize = 50, onUndo, onRedo, enableToasts = false } = options;

  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const set = useCallback((newPresent: T | ((prev: T) => T)) => {
    setHistory((currentHistory) => {
      const resolvedPresent = typeof newPresent === 'function'
        ? (newPresent as (prev: T) => T)(currentHistory.present)
        : newPresent;

      if (JSON.stringify(resolvedPresent) === JSON.stringify(currentHistory.present)) {
        return currentHistory;
      }

      const newPast = [...currentHistory.past, currentHistory.present];
      if (newPast.length > maxHistorySize) newPast.shift();

      return { past: newPast, present: resolvedPresent, future: [] };
    });
  }, [maxHistorySize]);

  const undo = useCallback(() => {
    if (!canUndo) return;
    setHistory((currentHistory) => {
      const previous = currentHistory.past[currentHistory.past.length - 1];
      const newPast = currentHistory.past.slice(0, -1);
      if (enableToasts) toast({ title: 'Ação desfeita' });
      onUndo?.();
      return { past: newPast, present: previous, future: [currentHistory.present, ...currentHistory.future] };
    });
  }, [canUndo, enableToasts, onUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    setHistory((currentHistory) => {
      const next = currentHistory.future[0];
      if (enableToasts) toast({ title: 'Ação refeita' });
      onRedo?.();
      return { past: [...currentHistory.past, currentHistory.present], present: next, future: currentHistory.future.slice(1) };
    });
  }, [canRedo, enableToasts, onRedo]);

  const reset = useCallback((newPresent: T) => {
    setHistory({ past: [], present: newPresent, future: [] });
  }, []);

  return { state: history.present, set, undo, redo, canUndo, canRedo, reset };
}

export function useListUndoRedo<T extends { id: string | number }>(initialList: T[], options: UndoRedoOptions = {}) {
  const undoRedo = useUndoRedo(initialList, options);

  const addItem = useCallback((item: T) => undoRedo.set((list) => [...list, item]), [undoRedo]);
  const removeItem = useCallback((id: string | number) => undoRedo.set((list) => list.filter((item) => item.id !== id)), [undoRedo]);
  const updateItem = useCallback((id: string | number, updates: Partial<T>) => 
    undoRedo.set((list) => list.map((item) => item.id === id ? { ...item, ...updates } : item)), [undoRedo]);
  const reorderItems = useCallback((newList: T[]) => undoRedo.set(newList), [undoRedo]);

  return { items: undoRedo.state, addItem, removeItem, updateItem, reorderItems, ...undoRedo };
}
