import { useEffect, useMemo } from 'react';
import { FiltrosBuscaStore } from '../stores/FiltrosBuscaStore';

let singleton: FiltrosBuscaStore | null = null;

/**
 * Singleton client-side. Não precisa ir pelo ServicesProvider porque
 * FiltrosBuscaStore não depende de SupabaseClient — é puramente UI/URL.
 */
function getStore(): FiltrosBuscaStore {
  if (!singleton) singleton = new FiltrosBuscaStore();
  return singleton;
}

export function useFiltros() {
  const store = useMemo(() => getStore(), []);
  const filtros = store.use((s) => s.filtros);

  useEffect(() => {
    store.sincronizarComUrl();
  }, [store]);

  return { filtros, aplicar: (f: typeof filtros) => store.aplicar(f) };
}
