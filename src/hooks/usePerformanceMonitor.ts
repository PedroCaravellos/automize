import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  totalMeasurements: number;
  p95: number;
  p99: number;
}

/**
 * Hook para monitoramento de performance
 * Rastreia métricas de performance da aplicação
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const measurementsRef = useRef(new Map<string, number[]>());

  useEffect(() => {
    // Monitorar Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          recordMetric('LCP', lastEntry.startTime, {
            element: (lastEntry as any).element?.tagName,
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as any;
            recordMetric('FID', fidEntry.processingStart - fidEntry.startTime, {
              type: fidEntry.name,
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift) - simplificado
        const clsObserver = new PerformanceObserver((list) => {
          let cls = 0;
          list.getEntries().forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          });
          if (cls > 0) {
            recordMetric('CLS', cls * 1000); // Converter para ms
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.error('[PerformanceMonitor] Failed to setup observers:', error);
      }
    }
  }, []);

  const recordMetric = useCallback((name: string, duration: number, metadata?: Record<string, any>) => {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date(),
      metadata,
    };

    setMetrics(prev => {
      const updated = [...prev, metric];
      return updated.slice(-100); // Manter últimas 100
    });

    // Armazenar para estatísticas
    const measurements = measurementsRef.current.get(name) || [];
    measurements.push(duration);
    if (measurements.length > 100) measurements.shift();
    measurementsRef.current.set(name, measurements);

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`, metadata);
  }, []);

  const measure = useCallback(<T,>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    return new Promise(async (resolve, reject) => {
      const start = performance.now();
      try {
        const result = await fn();
        const duration = performance.now() - start;
        recordMetric(name, duration, metadata);
        resolve(result);
      } catch (error) {
        const duration = performance.now() - start;
        recordMetric(name, duration, { ...metadata, error: true });
        reject(error);
      }
    });
  }, [recordMetric]);

  const getStats = useCallback((name: string): PerformanceStats | null => {
    const measurements = measurementsRef.current.get(name);
    if (!measurements || measurements.length === 0) return null;

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      avgDuration: sum / sorted.length,
      minDuration: sorted[0],
      maxDuration: sorted[sorted.length - 1],
      totalMeasurements: sorted.length,
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }, []);

  const getAllStats = useCallback((): Record<string, PerformanceStats> => {
    const stats: Record<string, PerformanceStats> = {};
    measurementsRef.current.forEach((_, name) => {
      const stat = getStats(name);
      if (stat) stats[name] = stat;
    });
    return stats;
  }, [getStats]);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
    measurementsRef.current.clear();
  }, []);

  return {
    metrics,
    recordMetric,
    measure,
    getStats,
    getAllStats,
    clearMetrics,
  };
}
