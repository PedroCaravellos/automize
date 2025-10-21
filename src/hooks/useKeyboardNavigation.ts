import { useEffect, useCallback, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  enabled?: boolean;
}

/**
 * Hook para gerenciar navegação por teclado
 * Facilita a implementação de atalhos e navegação acessível
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const { enabled = true } = options;

  useHotkeys('escape', () => options.onEscape?.(), { enabled });
  useHotkeys('enter', () => options.onEnter?.(), { enabled });
  useHotkeys('up', () => options.onArrowUp?.(), { enabled });
  useHotkeys('down', () => options.onArrowDown?.(), { enabled });
  useHotkeys('left', () => options.onArrowLeft?.(), { enabled });
  useHotkeys('right', () => options.onArrowRight?.(), { enabled });
}

interface FocusTrapOptions {
  enabled?: boolean;
  initialFocus?: HTMLElement | null;
}

/**
 * Hook para trap de foco dentro de um elemento
 * Útil para modais e diálogos acessíveis
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, options: FocusTrapOptions = {}) {
  const { enabled = true, initialFocus } = options;

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Foca no elemento inicial ou no primeiro
    const elementToFocus = initialFocus || firstElement;
    elementToFocus?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    return () => element.removeEventListener('keydown', handleTabKey);
  }, [enabled, ref, initialFocus]);
}

interface ListNavigationOptions {
  items: any[];
  onSelect?: (item: any, index: number) => void;
  loop?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Hook para navegação em listas com teclado
 * Suporta navegação vertical e horizontal
 */
export function useListNavigation(options: ListNavigationOptions) {
  const { items, onSelect, loop = true, orientation = 'vertical' } = options;
  const selectedIndexRef = useRef(0);

  const moveNext = useCallback(() => {
    const currentIndex = selectedIndexRef.current;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= items.length) {
      selectedIndexRef.current = loop ? 0 : currentIndex;
    } else {
      selectedIndexRef.current = nextIndex;
    }
    
    onSelect?.(items[selectedIndexRef.current], selectedIndexRef.current);
  }, [items, onSelect, loop]);

  const movePrevious = useCallback(() => {
    const currentIndex = selectedIndexRef.current;
    const prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      selectedIndexRef.current = loop ? items.length - 1 : 0;
    } else {
      selectedIndexRef.current = prevIndex;
    }
    
    onSelect?.(items[selectedIndexRef.current], selectedIndexRef.current);
  }, [items, onSelect, loop]);

  useKeyboardNavigation({
    onArrowDown: orientation === 'vertical' ? moveNext : undefined,
    onArrowUp: orientation === 'vertical' ? movePrevious : undefined,
    onArrowRight: orientation === 'horizontal' ? moveNext : undefined,
    onArrowLeft: orientation === 'horizontal' ? movePrevious : undefined,
  });

  return {
    selectedIndex: selectedIndexRef.current,
    moveNext,
    movePrevious,
  };
}
