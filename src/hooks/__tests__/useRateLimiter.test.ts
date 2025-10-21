import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRateLimiter } from '../useRateLimiter';

describe('useRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });


  it('deve permitir requisições dentro do limite', () => {
    const { result } = renderHook(() => 
      useRateLimiter({ maxRequests: 3, windowMs: 1000 })
    );

    act(() => {
      expect(result.current.checkLimit('test-key')).toBe(true);
      expect(result.current.checkLimit('test-key')).toBe(true);
      expect(result.current.checkLimit('test-key')).toBe(true);
    });

    expect(result.current.getRemainingRequests('test-key')).toBe(0);
  });

  it('deve bloquear requisições acima do limite', () => {
    const { result } = renderHook(() => 
      useRateLimiter({ maxRequests: 2, windowMs: 1000 })
    );

    act(() => {
      result.current.checkLimit('test-key');
      result.current.checkLimit('test-key');
      expect(result.current.checkLimit('test-key')).toBe(false);
    });
  });

  it('deve resetar limite após janela de tempo', () => {
    const { result } = renderHook(() => 
      useRateLimiter({ maxRequests: 2, windowMs: 1000 })
    );

    act(() => {
      result.current.checkLimit('test-key');
      result.current.checkLimit('test-key');
    });

    // Avançar tempo além da janela
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    act(() => {
      expect(result.current.checkLimit('test-key')).toBe(true);
    });
  });

  it('deve manter limites separados para keys diferentes', () => {
    const { result } = renderHook(() => 
      useRateLimiter({ maxRequests: 2, windowMs: 1000 })
    );

    act(() => {
      result.current.checkLimit('key-1');
      result.current.checkLimit('key-1');
      expect(result.current.checkLimit('key-1')).toBe(false);
      expect(result.current.checkLimit('key-2')).toBe(true);
    });
  });

  it('deve executar função com rate limit', async () => {
    const { result } = renderHook(() => 
      useRateLimiter({ maxRequests: 1, windowMs: 1000 })
    );

    const mockFn = vi.fn().mockResolvedValue('result');

    let result1: any;
    let result2: any;

    await act(async () => {
      result1 = await result.current.withRateLimit('test', mockFn);
      result2 = await result.current.withRateLimit('test', mockFn);
    });

    expect(result1).toBe('result');
    expect(result2).toBe(null);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('deve resetar limite manualmente', () => {
    const { result } = renderHook(() => 
      useRateLimiter({ maxRequests: 2, windowMs: 1000 })
    );

    act(() => {
      result.current.checkLimit('test-key');
      result.current.checkLimit('test-key');
      expect(result.current.checkLimit('test-key')).toBe(false);
    });

    act(() => {
      result.current.resetLimit('test-key');
    });

    act(() => {
      expect(result.current.checkLimit('test-key')).toBe(true);
    });
  });
});
