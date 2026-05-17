import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { FiltrosBusca } from '../domain/FiltrosBusca';

interface InternalState {
  filtros: FiltrosBusca;
  set(filtros: FiltrosBusca): void;
}

/**
 * Store de filtros: classe que wrappa Zustand porque tem método de domínio
 * (sync com URL) — ver 05-arquitetura §6.3.
 *
 * `sincronizarComUrl()` é chamada uma vez no boot da página Buscar, e
 * `aplicar()` espelha a mudança no URL search params via history.replaceState
 * pra não poluir histórico de navegação.
 */
export class FiltrosBuscaStore {
  readonly use: UseBoundStore<StoreApi<InternalState>>;
  private inscrito = false;

  constructor() {
    this.use = create<InternalState>((set) => ({
      filtros: FiltrosBusca.vazio(),
      set: (filtros) => set({ filtros }),
    }));
  }

  /**
   * Lê filtros da URL atual e instala listener pra popstate (back/forward).
   * Idempotente — pode ser chamada várias vezes.
   */
  sincronizarComUrl(): void {
    if (this.inscrito) return;
    this.inscrito = true;
    this.lerDaUrl();
    window.addEventListener('popstate', () => this.lerDaUrl());
  }

  aplicar(filtros: FiltrosBusca): void {
    this.use.getState().set(filtros);
    const params = filtros.toQueryParams().toString();
    const novaUrl = params ? `${window.location.pathname}?${params}` : window.location.pathname;
    window.history.replaceState(null, '', novaUrl);
  }

  atual(): FiltrosBusca {
    return this.use.getState().filtros;
  }

  private lerDaUrl(): void {
    try {
      const f = FiltrosBusca.fromUrl(new URLSearchParams(window.location.search));
      this.use.getState().set(f);
    } catch {
      this.use.getState().set(FiltrosBusca.vazio());
    }
  }
}
