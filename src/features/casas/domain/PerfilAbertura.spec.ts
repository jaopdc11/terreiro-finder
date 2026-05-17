import { describe, expect, it } from 'vitest';
import { PerfilAbertura } from './PerfilAbertura';
import { DomainError } from '@/shared/lib/errors';

describe('PerfilAbertura', () => {
  it('padrao retorna combinação conservadora', () => {
    const p = PerfilAbertura.padrao();
    expect(p.enderecoVisibilidade).toBe('sob_contato');
    expect(p.aceitaVisitantes).toBe('jogo_previo');
    expect(p.fotoRegistro).toBe('parcial');
  });

  it('parse aceita valores válidos', () => {
    const p = PerfilAbertura.parse({
      enderecoVisibilidade: 'publico',
      aceitaVisitantes: 'aberto',
      fotoRegistro: 'permitido',
    });
    expect(p.enderecoEhPublico()).toBe(true);
  });

  it('rejeita enum inválido', () => {
    expect(() =>
      PerfilAbertura.parse({
        enderecoVisibilidade: 'fechado-pra-festa',
        aceitaVisitantes: 'aberto',
        fotoRegistro: 'permitido',
      }),
    ).toThrow(DomainError);
  });

  it('mutação retorna nova instância (imutabilidade)', () => {
    const p1 = PerfilAbertura.padrao();
    const p2 = p1.comEnderecoVisibilidade('publico');
    expect(p1).not.toBe(p2);
    expect(p1.enderecoVisibilidade).toBe('sob_contato');
    expect(p2.enderecoVisibilidade).toBe('publico');
  });

  it('exigeIndicacaoPraVisitar reflete só_indicacao', () => {
    const p = PerfilAbertura.padrao().comAceitaVisitantes('so_indicacao');
    expect(p.exigeIndicacaoPraVisitar()).toBe(true);
  });
});
