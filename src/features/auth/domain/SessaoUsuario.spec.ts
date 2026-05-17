import { describe, expect, it } from 'vitest';
import { SessaoUsuario } from './SessaoUsuario';
import { DomainError } from '@/shared/lib/errors';

const UID = '11111111-1111-1111-1111-111111111111';

describe('SessaoUsuario', () => {
  it('é criada a partir de userId+email+profile', () => {
    const s = SessaoUsuario.criar({
      userId: UID,
      email: 'maria@terreiro.org',
      profile: { id: UID, nome_completo: 'Maria de Aruanda', nome_exibicao: 'Mãe Maria', role: 'dirigente' },
    });
    expect(s.userId).toBe(UID);
    expect(s.nomeExibicao).toBe('Mãe Maria');
    expect(s.is('dirigente')).toBe(true);
    expect(s.ehDirigente()).toBe(true);
    expect(s.podeAdministrar()).toBe(false);
  });

  it('cai pra nome_completo quando nome_exibicao é null', () => {
    const s = SessaoUsuario.criar({
      userId: UID,
      email: 'maria@terreiro.org',
      profile: { id: UID, nome_completo: 'Maria', nome_exibicao: null, role: 'visitante' },
    });
    expect(s.nomeExibicao).toBe('Maria');
  });

  it('podeAdministrar só com role=admin', () => {
    const s = SessaoUsuario.criar({
      userId: UID,
      email: 'a@b.org',
      profile: { id: UID, nome_completo: null, nome_exibicao: null, role: 'admin' },
    });
    expect(s.podeAdministrar()).toBe(true);
    expect(s.ehDirigente()).toBe(true);
  });

  it('rejeita profile com id diferente', () => {
    expect(() =>
      SessaoUsuario.criar({
        userId: UID,
        email: 'a@b.org',
        profile: {
          id: '22222222-2222-2222-2222-222222222222',
          nome_completo: null,
          nome_exibicao: null,
          role: 'visitante',
        },
      }),
    ).toThrow(DomainError);
  });
});
