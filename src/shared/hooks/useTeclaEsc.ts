import { useEffect } from 'react';

/**
 * Quando `ativo`, escuta a tecla Escape na janela e chama `onEsc`.
 * Cleanup automático no unmount ou quando `ativo` vira false.
 */
export function useTeclaEsc(ativo: boolean, onEsc: () => void): void {
  useEffect(() => {
    if (!ativo) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEsc();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ativo, onEsc]);
}
