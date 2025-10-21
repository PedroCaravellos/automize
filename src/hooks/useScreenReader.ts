import { useEffect, useRef, useCallback } from 'react';

type AnnouncementPriority = 'polite' | 'assertive';

/**
 * Hook para fazer anúncios para leitores de tela
 * Usa ARIA live regions para comunicar mudanças dinâmicas
 */
export function useScreenReader() {
  const politeRegionRef = useRef<HTMLDivElement | null>(null);
  const assertiveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Cria regiões live se não existirem
    if (!politeRegionRef.current) {
      const politeRegion = document.createElement('div');
      politeRegion.setAttribute('role', 'status');
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      politeRegion.className = 'sr-only';
      document.body.appendChild(politeRegion);
      politeRegionRef.current = politeRegion;
    }

    if (!assertiveRegionRef.current) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.setAttribute('role', 'alert');
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.className = 'sr-only';
      document.body.appendChild(assertiveRegion);
      assertiveRegionRef.current = assertiveRegion;
    }

    return () => {
      politeRegionRef.current?.remove();
      assertiveRegionRef.current?.remove();
    };
  }, []);

  const announce = useCallback((message: string, priority: AnnouncementPriority = 'polite') => {
    const region = priority === 'polite' ? politeRegionRef.current : assertiveRegionRef.current;
    
    if (region) {
      // Limpa e depois adiciona a mensagem para garantir que seja anunciada
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
  }, []);

  return { announce };
}

/**
 * Hook para gerenciar o título da página de forma acessível
 * Atualiza o título e anuncia mudanças de navegação
 */
export function usePageTitle(title: string, announceChange: boolean = true) {
  const { announce } = useScreenReader();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    if (announceChange && previousTitle !== title) {
      announce(`Navegou para ${title}`, 'polite');
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, announceChange, announce]);
}
