import { z } from 'zod';
import { ApiError, type ApiClient } from '@/shared/lib/ApiClient';
import { ServiceError } from '@/shared/lib/errors';
import { userRoleSchema } from '../schemas';
import { SessaoUsuario } from '../domain/SessaoUsuario';

const usuarioApiSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  nomeCompleto: z.string().nullable(),
  nomeExibicao: z.string().nullable(),
  papel: userRoleSchema,
});

function sessaoDaApi(raw: unknown): SessaoUsuario {
  const u = usuarioApiSchema.parse(raw);
  return SessaoUsuario.criar({
    userId: u.id,
    email: u.email,
    profile: { id: u.id, nome_completo: u.nomeCompleto, nome_exibicao: u.nomeExibicao, role: u.papel },
  });
}

/** Erro da API vira ServiceError com o mesmo código e a mensagem já em pt-BR. */
function traduzir(e: unknown, codigoPadrao: string): ServiceError {
  if (e instanceof ApiError) return new ServiceError(e.codigo, e.message, { cause: e });
  return new ServiceError(codigoPadrao, 'Algo deu errado. Tente novamente.', { cause: e });
}

export interface CadastroPayload {
  nomeCompleto: string;
  nomeExibicao?: string;
  email: string;
  senha: string;
  eDirigencia?: boolean;
}

type Ouvinte = (sessao: SessaoUsuario | null) => void;

/**
 * Auth contra a encruza-api. Sessão é o cookie httpOnly; aqui só se chama a
 * API e se avisa quem escuta (SessaoStore) quando a sessão muda.
 */
export class AuthService {
  private readonly ouvintes = new Set<Ouvinte>();

  constructor(private readonly api: ApiClient) {}

  /** Inscreve um ouvinte de mudança de sessão. Devolve a função de cancelar. */
  aoMudarSessao(fn: Ouvinte): () => void {
    this.ouvintes.add(fn);
    return () => this.ouvintes.delete(fn);
  }

  private avisar(sessao: SessaoUsuario | null): SessaoUsuario | null {
    for (const fn of this.ouvintes) fn(sessao);
    return sessao;
  }

  async login(email: string, senha: string): Promise<SessaoUsuario> {
    try {
      const s = sessaoDaApi(await this.api.post('/auth/entrar', { email, senha }));
      this.avisar(s);
      return s;
    } catch (e) {
      throw traduzir(e, 'AUTH_LOGIN_FALHOU');
    }
  }

  /**
   * Cria a conta e a API manda o link de confirmação. A resposta é a mesma
   * exista ou não o e-mail; a conta só entra depois de confirmar.
   */
  async cadastrar(payload: CadastroPayload): Promise<void> {
    try {
      await this.api.post('/auth/cadastro', {
        nomeCompleto: payload.nomeCompleto,
        nomeExibicao: payload.nomeExibicao ?? null,
        email: payload.email,
        senha: payload.senha,
        ehDirigencia: payload.eDirigencia ?? false,
      });
    } catch (e) {
      throw traduzir(e, 'AUTH_CADASTRO_FALHOU');
    }
  }

  async reenviarConfirmacao(email: string): Promise<void> {
    try {
      await this.api.post('/auth/reenviar-confirmacao', { email });
    } catch (e) {
      throw traduzir(e, 'AUTH_REENVIAR_FALHOU');
    }
  }

  /** Consome o link do e-mail; a API já deixa logado. */
  async confirmarEmail(token: string): Promise<SessaoUsuario> {
    try {
      const s = sessaoDaApi(await this.api.post('/auth/confirmar', { token }));
      this.avisar(s);
      return s;
    } catch (e) {
      throw traduzir(e, 'AUTH_CONFIRMAR_FALHOU');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/sair');
    } catch (e) {
      throw traduzir(e, 'AUTH_LOGOUT_FALHOU');
    } finally {
      this.avisar(null);
    }
  }

  async recuperarSenha(email: string): Promise<void> {
    try {
      await this.api.post('/auth/esqueci-senha', { email });
    } catch (e) {
      throw traduzir(e, 'AUTH_RECUPERAR_FALHOU');
    }
  }

  /** Troca a senha pelo link; a API derruba todas as sessões (inclusive esta). */
  async redefinirSenha(token: string, senha: string): Promise<void> {
    try {
      await this.api.post('/auth/redefinir-senha', { token, senha });
      this.avisar(null);
    } catch (e) {
      throw traduzir(e, 'AUTH_REDEFINIR_FALHOU');
    }
  }

  /** Sessão do cookie atual, ou null se não houver. */
  async sessaoAtual(): Promise<SessaoUsuario | null> {
    try {
      return sessaoDaApi(await this.api.get('/auth/eu'));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw traduzir(e, 'AUTH_SESSAO_FALHOU');
    }
  }
}
