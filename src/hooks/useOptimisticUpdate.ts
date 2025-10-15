import { useState } from 'react';

interface OptimisticUpdateOptions<T> {
  updateFn: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useOptimisticUpdate<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (
    newData: T,
    { updateFn, onSuccess, onError }: OptimisticUpdateOptions<T>
  ) => {
    const previousData = data;
    
    // Optimistic update
    setData(newData);
    setIsUpdating(true);
    setError(null);

    try {
      await updateFn(newData);
      onSuccess?.();
    } catch (err) {
      // Rollback on error
      setData(previousData);
      const error = err instanceof Error ? err : new Error('Update failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    data,
    isUpdating,
    error,
    update,
    setData,
  };
}
