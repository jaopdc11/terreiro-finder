import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SessaoUsuario } from '../domain/SessaoUsuario';
import type { AuthService } from '../api/AuthService';

interface InternalState {
  sessao: SessaoUsuario | null;
  carregando: boolean;
  setSessao(sessao: SessaoUsuario | null): void;
  setCarregando(b: boolean): void;
}

/**
 * Classe que wrappa um Zustand interno — escolha intencional pra abrigar
 * o método de domínio `escutar()` que cruza com supabase.auth.onAuthStateChange.
 * (Stores sem regra de domínio ficam em Zustand puro — ver 05-arquitetura §6.3.)
 */
export class SessaoStore {
  readonly use: UseBoundStore<StoreApi<InternalState>>;
  private inscricao: { unsubscribe: () => void } | null = null;

  constructor(
    private readonly client: SupabaseClient,
    private readonly auth: AuthService,
  ) {
    this.use = create<InternalState>((set) => ({
      sessao: null,
      carregando: true,
      setSessao: (sessao) => set({ sessao, carregando: false }),
      setCarregando: (b) => set({ carregando: b }),
    }));
  }

  /** Inicializa: carrega sessão atual e fica escutando supabase.auth. */
  async escutar(): Promise<void> {
    this.use.getState().setCarregando(true);
    try {
      const inicial = await this.auth.sessaoAtual();
      this.use.getState().setSessao(inicial);
    } catch {
      this.use.getState().setSessao(null);
    }

    const { data } = this.client.auth.onAuthStateChange(async (evento) => {
      if (evento === 'SIGNED_OUT') {
        this.use.getState().setSessao(null);
        return;
      }
      try {
        const s = await this.auth.sessaoAtual();
        this.use.getState().setSessao(s);
      } catch {
        this.use.getState().setSessao(null);
      }
    });
    this.inscricao = data.subscription;
  }

  parar(): void {
    this.inscricao?.unsubscribe();
    this.inscricao = null;
  }

  entrarComo(sessao: SessaoUsuario): void {
    this.use.getState().setSessao(sessao);
  }

  sair(): void {
    this.use.getState().setSessao(null);
  }
}
