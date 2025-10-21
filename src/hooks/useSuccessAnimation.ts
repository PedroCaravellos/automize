import { useState, useCallback, useEffect } from 'react';

type AnimationType = 'success' | 'error' | 'warning' | 'info' | 'celebration';

interface SuccessAnimationState {
  show: boolean;
  type: AnimationType;
  message: string;
  duration: number;
}

interface TriggerOptions {
  type?: AnimationType;
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

export function useSuccessAnimation(defaultDuration = 3000) {
  const [animation, setAnimation] = useState<SuccessAnimationState>({ show: false, type: 'success', message: '', duration: defaultDuration });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const trigger = useCallback((options: TriggerOptions = {}) => {
    const { type = 'success', message = 'Sucesso!', duration = defaultDuration, onComplete } = options;
    if (timeoutId) clearTimeout(timeoutId);
    setAnimation({ show: true, type, message, duration });
    const newTimeoutId = setTimeout(() => { setAnimation((prev) => ({ ...prev, show: false })); onComplete?.(); }, duration);
    setTimeoutId(newTimeoutId);
  }, [defaultDuration, timeoutId]);

  const hide = useCallback(() => { if (timeoutId) clearTimeout(timeoutId); setAnimation((prev) => ({ ...prev, show: false })); }, [timeoutId]);

  const triggerSuccess = useCallback((message?: string, onComplete?: () => void) => trigger({ type: 'success', message, onComplete }), [trigger]);
  const triggerError = useCallback((message?: string, onComplete?: () => void) => trigger({ type: 'error', message, onComplete }), [trigger]);

  useEffect(() => () => { if (timeoutId) clearTimeout(timeoutId); }, [timeoutId]);

  return { animation, trigger, hide, triggerSuccess, triggerError };
}
