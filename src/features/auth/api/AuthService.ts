import type { SupabaseClient } from '@supabase/supabase-js';
import { ServiceError } from '@/shared/lib/errors';
import { profileRowSchema, type ProfileRow } from '../schemas';
import { SessaoUsuario } from '../domain/SessaoUsuario';

/**
 * Supabase Auth retorna mensagens em inglês cru ("Invalid login credentials").
 * Mapeamos pras versões em pt-BR que vão pra UI. Match case-insensitive +
 * por substring pra cobrir variações de versão do GoTrue.
 */
function traduzirErroAuth(msg: string | undefined | null): string {
  if (!msg) return 'Algo deu errado.';
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (m.includes('user already registered')) return 'Esse e-mail já está cadastrado.';
  if (m.includes('user not found')) return 'Conta não encontrada.';
  if (m.includes('email rate limit') || m.includes('rate limit exceeded'))
    return 'Muitas tentativas. Tente daqui a alguns minutos.';
  if (m.includes('for security purposes')) return 'Aguarde alguns segundos antes de tentar de novo.';
  if (m.includes('password should be at least')) {
    const min = /at least (\d+)/i.exec(msg)?.[1];
    return min ? `Senha muito curta (mínimo ${min} caracteres).` : 'Senha muito curta.';
  }
  if (m.includes('unable to validate email') || m.includes('invalid email'))
    return 'E-mail inválido.';
  if (m.includes('email signups are disabled')) return 'Cadastro por e-mail desabilitado.';
  if (m.includes('signups not allowed')) return 'Cadastro temporariamente desabilitado.';
  if (m.includes('anonymous sign-ins are disabled')) return 'Login anônimo desabilitado.';
  if (m.includes('network request failed') || m.includes('failed to fetch'))
    return 'Sem conexão. Tente novamente.';
  if (m.includes('weak password')) return 'Senha fraca. Use letras, números e símbolos.';
  if (m.includes('email link is invalid') || m.includes('token has expired'))
    return 'Link expirado. Solicite um novo.';
  return msg;
}

export interface CadastroPayload {
  nomeCompleto: string;
  nomeExibicao?: string;
  email: string;
  senha: string;
  /**
   * Se true, passa `intent='dirigencia'` em user_metadata pro trigger
   * handle_new_user setar profile.role='dirigente' direto. Senão, role
   * default 'visitante'.
   */
  eDirigencia?: boolean;
}

/**
 * Orquestra auth.users + public.profiles.
 * O profile nasce via trigger handle_new_user; aqui só lemos e expomos a sessão de domínio.
 */
export class AuthService {
  constructor(private readonly client: SupabaseClient) {}

  async login(email: string, senha: string): Promise<SessaoUsuario> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password: senha });
    if (error || !data.user || !data.session) {
      throw new ServiceError('AUTH_LOGIN_FALHOU', traduzirErroAuth(error?.message), {
        cause: error,
      });
    }
    return this.montarSessao(data.user.id, data.user.email ?? email);
  }

  async cadastrar(payload: CadastroPayload): Promise<SessaoUsuario> {
    const { data, error } = await this.client.auth.signUp({
      email: payload.email,
      password: payload.senha,
      options: {
        data: {
          nome_completo: payload.nomeCompleto,
          nome_exibicao: payload.nomeExibicao ?? payload.nomeCompleto,
          intent: payload.eDirigencia ? 'dirigencia' : 'visitante',
        },
      },
    });
    if (error || !data.user) {
      throw new ServiceError('AUTH_CADASTRO_FALHOU', traduzirErroAuth(error?.message), {
        cause: error,
      });
    }
    // Sem confirmação de email em dev local: data.session vem preenchida.
    // Em prod, supabase pede confirmação — nesse caso retornamos a sessão só
    // depois do link clicado.
    if (!data.session) {
      throw new ServiceError(
        'AUTH_CONFIRMACAO_PENDENTE',
        'Cadastro criado. Confirme seu email para entrar.',
      );
    }
    return this.montarSessao(data.user.id, data.user.email ?? payload.email);
  }

  /**
   * Logout local — limpa apenas o storage do supabase-js, sem POST /logout.
   * O "global" default pode pendurar a Promise se o servidor demora ou está
   * offline; pra UX da web não vale esperar. O refresh token "vivo" no
   * servidor expira sozinho (sessão dura 1h por padrão).
   */
  async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut({ scope: 'local' });
    if (error) {
      throw new ServiceError('AUTH_LOGOUT_FALHOU', traduzirErroAuth(error.message), {
        cause: error,
      });
    }
  }

  async recuperarSenha(email: string, redirectTo: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      throw new ServiceError('AUTH_RECUPERAR_FALHOU', traduzirErroAuth(error.message), {
        cause: error,
      });
    }
  }

  async sessaoAtual(): Promise<SessaoUsuario | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error || !data.user) return null;
    return this.montarSessao(data.user.id, data.user.email ?? '');
  }

  private async montarSessao(userId: string, email: string): Promise<SessaoUsuario> {
    const profile = await this.profileDe(userId);
    return SessaoUsuario.criar({ userId, email, profile });
  }

  private async profileDe(userId: string): Promise<ProfileRow> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, nome_completo, nome_exibicao, role')
      .eq('id', userId)
      .single();
    if (error || !data) {
      throw new ServiceError('AUTH_PROFILE_AUSENTE', error?.message ?? 'Profile não encontrado', {
        cause: error,
      });
    }
    return profileRowSchema.parse(data);
  }
}
