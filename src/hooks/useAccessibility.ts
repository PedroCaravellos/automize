import { useEffect, useCallback, useState } from 'react';
import { useScreenReader } from './useScreenReader';

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

/**
 * Hook para detectar e respeitar preferências de acessibilidade do usuário
 */
export function useAccessibilityPreferences(): AccessibilityPreferences {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
  });

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        largeText: window.matchMedia('(min-width: 640px)').matches, // Proxy para texto grande
      });
    };

    updatePreferences();

    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
    ];

    mediaQueries.forEach(mq => mq.addEventListener('change', updatePreferences));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', updatePreferences));
    };
  }, []);

  return preferences;
}

/**
 * Hook para gerenciar anúncios de ações do usuário
 * Útil para feedback de formulários e ações assíncronas
 */
export function useAccessibleAction() {
  const { announce } = useScreenReader();

  const announceSuccess = useCallback((message: string) => {
    announce(`Sucesso: ${message}`, 'polite');
  }, [announce]);

  const announceError = useCallback((message: string) => {
    announce(`Erro: ${message}`, 'assertive');
  }, [announce]);

  const announceLoading = useCallback((message: string) => {
    announce(`Carregando: ${message}`, 'polite');
  }, [announce]);

  const announceInfo = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  return {
    announceSuccess,
    announceError,
    announceLoading,
    announceInfo,
  };
}

/**
 * Hook para adicionar descrições acessíveis dinamicamente
 */
export function useAccessibleDescription(description: string, id?: string) {
  const [descriptionId] = useState(id || `description-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const descElement = document.getElementById(descriptionId);
    if (descElement) {
      descElement.textContent = description;
    }
  }, [description, descriptionId]);

  return descriptionId;
}
