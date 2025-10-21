import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUndoRedo, useListUndoRedo } from '../useUndoRedo';

describe('useUndoRedo', () => {
  it('deve inicializar com estado inicial', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));
    expect(result.current.state).toBe('initial');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('deve adicionar ao histórico quando state muda', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));
    
    act(() => {
      result.current.set('second');
    });

    expect(result.current.state).toBe('second');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('deve fazer undo corretamente', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));
    
    act(() => {
      result.current.set('second');
      result.current.set('third');
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toBe('second');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });

  it('deve fazer redo corretamente', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));
    
    act(() => {
      result.current.set('second');
      result.current.undo();
    });

    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toBe('second');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('deve limpar future quando novo state é adicionado', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));
    
    act(() => {
      result.current.set('second');
      result.current.undo();
      result.current.set('third');
    });

    expect(result.current.state).toBe('third');
    expect(result.current.canRedo).toBe(false);
  });

  it('deve respeitar maxHistorySize', () => {
    const { result } = renderHook(() => useUndoRedo('initial', { maxHistorySize: 2 }));
    
    act(() => {
      result.current.set('second');
      result.current.set('third');
      result.current.set('fourth');
    });

    // Deve ter apenas 2 itens no histórico
    act(() => {
      result.current.undo();
      result.current.undo();
    });

    expect(result.current.state).toBe('second');
    expect(result.current.canUndo).toBe(false);
  });
});

describe('useListUndoRedo', () => {
  it('deve adicionar item à lista', () => {
    const { result } = renderHook(() => 
      useListUndoRedo([{ id: 1, name: 'Item 1' }])
    );
    
    act(() => {
      result.current.addItem({ id: 2, name: 'Item 2' });
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[1]).toEqual({ id: 2, name: 'Item 2' });
    expect(result.current.canUndo).toBe(true);
  });

  it('deve remover item da lista', () => {
    const { result } = renderHook(() => 
      useListUndoRedo([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ])
    );
    
    act(() => {
      result.current.removeItem(1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe(2);
    expect(result.current.canUndo).toBe(true);
  });

  it('deve atualizar item da lista', () => {
    const { result } = renderHook(() => 
      useListUndoRedo([{ id: 1, name: 'Item 1' }])
    );
    
    act(() => {
      result.current.updateItem(1, { name: 'Updated Item' });
    });

    expect(result.current.items[0].name).toBe('Updated Item');
    expect(result.current.canUndo).toBe(true);
  });

  it('deve fazer undo de operações na lista', () => {
    const { result } = renderHook(() => 
      useListUndoRedo([{ id: 1, name: 'Item 1' }])
    );
    
    act(() => {
      result.current.addItem({ id: 2, name: 'Item 2' });
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe(1);
  });
});
