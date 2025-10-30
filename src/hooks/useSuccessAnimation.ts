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

interface ActionFeedbackOptions<T> {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
}

export function useActionFeedback<T = any>(defaultDuration = 3000) {
  const [isLoading, setIsLoading] = useState(false);
  const { animation, triggerSuccess, triggerError } = useSuccessAnimation(defaultDuration);

  const executeWithFeedback = useCallback(async (action: () => Promise<T>, options: ActionFeedbackOptions<T> = {}) => {
    const { successMessage = 'Sucesso!', errorMessage = 'Erro ao executar ação', onSuccess, onError } = options;
    
    setIsLoading(true);
    try {
      const result = await action();
      setIsLoading(false);
      triggerSuccess(successMessage, () => onSuccess?.(result));
      return { success: true, data: result };
    } catch (error) {
      setIsLoading(false);
      triggerError(errorMessage, () => onError?.(error as Error));
      return { success: false, error: error as Error };
    }
  }, [triggerSuccess, triggerError]);

  return { isLoading, executeWithFeedback, animation };
}

interface AnimationStep {
  message: string;
  type: AnimationType;
  duration: number;
}

export function useAnimationSequence() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { animation, trigger } = useSuccessAnimation();

  const playSequence = useCallback((steps: AnimationStep[], onComplete?: () => void) => {
    setIsPlaying(true);
    setCurrentStep(0);

    const playStep = (index: number) => {
      if (index >= steps.length) {
        setIsPlaying(false);
        onComplete?.();
        return;
      }

      const step = steps[index];
      setCurrentStep(index);
      trigger({
        type: step.type,
        message: step.message,
        duration: step.duration,
        onComplete: () => playStep(index + 1),
      });
    };

    playStep(0);
  }, [trigger]);

  return { currentStep, isPlaying, playSequence, animation };
}
