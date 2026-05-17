import type { SupabaseClient } from '@supabase/supabase-js';
import { ServiceError } from '@/shared/lib/errors';
import { profileRowSchema, type ProfileRow } from '../schemas';
import { SessaoUsuario } from '../domain/SessaoUsuario';

export interface CadastroPayload {
  nomeCompleto: string;
  nomeExibicao?: string;
  email: string;
  senha: string;
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
      throw new ServiceError('AUTH_LOGIN_FALHOU', error?.message ?? 'Login falhou', { cause: error });
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
        },
      },
    });
    if (error || !data.user) {
      throw new ServiceError('AUTH_CADASTRO_FALHOU', error?.message ?? 'Cadastro falhou', {
        cause: error,
      });
    }
    // Sem confirmação de email em dev local: data.session vem preenchida.
    // Em prod, supabase pede confirmação — nesse caso retornamos a sessão só
    // depois do link clicado.
    if (!data.session) {
      throw new ServiceError(
        'AUTH_CONFIRMACAO_PENDENTE',
        'Cadastro criado, confirme seu email pra entrar.',
      );
    }
    return this.montarSessao(data.user.id, data.user.email ?? payload.email);
  }

  async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new ServiceError('AUTH_LOGOUT_FALHOU', error.message, { cause: error });
    }
  }

  async recuperarSenha(email: string, redirectTo: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      throw new ServiceError('AUTH_RECUPERAR_FALHOU', error.message, { cause: error });
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
