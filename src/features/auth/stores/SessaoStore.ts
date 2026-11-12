import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { SessaoUsuario } from '../domain/SessaoUsuario';
import type { AuthService } from '../api/AuthService';
import { marcarSemAnalytics } from '@/shared/lib/analytics';

interface InternalState {
  sessao: SessaoUsuario | null;
  carregando: boolean;
  setSessao(sessao: SessaoUsuario | null): void;
  setCarregando(b: boolean): void;
}

/**
 * Classe que wrappa um Zustand interno — escolha intencional pra abrigar
 * o método de domínio `escutar()`: carrega a sessão do cookie (GET /auth/eu)
 * e acompanha login/logout/confirmação feitos pelo AuthService.
 * (Stores sem regra de domínio ficam em Zustand puro — ver 05-arquitetura §6.3.)
 */
export class SessaoStore {
  readonly use: UseBoundStore<StoreApi<InternalState>>;
  private cancelar: (() => void) | null = null;

  constructor(private readonly auth: AuthService) {
    this.use = create<InternalState>((set) => ({
      sessao: null,
      carregando: true,
      setSessao: (sessao) => {
        // login de admin agora ou sessão de admin já aberta: este navegador sai do analytics
        if (sessao?.podeAdministrar()) marcarSemAnalytics();
        set({ sessao, carregando: false });
      },
      setCarregando: (b) => set({ carregando: b }),
    }));
  }

  async escutar(): Promise<void> {
    this.cancelar?.();
    this.cancelar = this.auth.aoMudarSessao((s) => this.use.getState().setSessao(s));
    this.use.getState().setCarregando(true);
    try {
      this.use.getState().setSessao(await this.auth.sessaoAtual());
    } catch {
      this.use.getState().setSessao(null);
    }
  }

  parar(): void {
    this.cancelar?.();
    this.cancelar = null;
  }

  entrarComo(sessao: SessaoUsuario): void {
    this.use.getState().setSessao(sessao);
  }

  sair(): void {
    this.use.getState().setSessao(null);
  }
}
