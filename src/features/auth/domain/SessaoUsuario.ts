import { DomainError } from '@/shared/lib/errors';
import { profileRowSchema, type ProfileRow, type UserRole } from '../schemas';

/**
 * Sessão = usuário autenticado + role do profile.
 * Imutável; criada na fronteira (AuthService) e consumida por hooks/guards.
 */
export class SessaoUsuario {
  private constructor(
    readonly userId: string,
    readonly email: string,
    readonly nomeExibicao: string,
    readonly role: UserRole,
  ) {}

  static criar(input: { userId: string; email: string; profile: ProfileRow }): SessaoUsuario {
    const profile = profileRowSchema.parse(input.profile);
    if (profile.id !== input.userId) {
      throw new DomainError(
        'SESSAO_PROFILE_DESALINHADO',
        'Profile não pertence ao usuário autenticado',
      );
    }
    const nome =
      profile.nome_exibicao?.trim() ||
      profile.nome_completo?.trim() ||
      input.email.split('@')[0] ||
      'visitante';
    return new SessaoUsuario(input.userId, input.email, nome, profile.role);
  }

  is(role: UserRole): boolean {
    return this.role === role;
  }

  podeAdministrar(): boolean {
    return this.role === 'admin';
  }

  ehDirigente(): boolean {
    return this.role === 'dirigente' || this.role === 'admin';
  }
}
