import { describe, expect, it } from 'vitest';
import { BlocoUmbanda } from './BlocoUmbanda';
import { DomainError } from '@/shared/lib/errors';

const CASA = '11111111-1111-1111-1111-111111111111';

describe('BlocoUmbanda', () => {
  it('vazio retorna instância com campos zerados/nulos', () => {
    const b = BlocoUmbanda.vazio(CASA);
    expect(b.casaId).toBe(CASA);
    expect(b.sincretismo).toBeNull();
    expect(b.linhagem).toEqual([]);
    expect(b.linhasTrabalhadas).toEqual([]);
  });

  it('fromRow parseia campos vindos do banco', () => {
    const b = BlocoUmbanda.fromRow({
      casa_id: CASA,
      sincretismo: 'parcial',
      influencia_kardecista: 'acentuada',
      sacralizacao: 'sim',
      linhagem: ['branca'],
      linhas_trabalhadas: ['caboclo', 'pretovelho'],
    });
    expect(b.sincretismo).toBe('parcial');
    expect(b.influenciaKardecista).toBe('acentuada');
    expect(b.linhasTrabalhadas).toEqual(['caboclo', 'pretovelho']);
  });

  it('rejeita row com casa_id ausente', () => {
    expect(() =>
      BlocoUmbanda.fromRow({ sincretismo: 'parcial' }),
    ).toThrow(DomainError);
  });

  it('aceita arrays vazios como default', () => {
    const b = BlocoUmbanda.fromRow({
      casa_id: CASA,
      sincretismo: null,
      influencia_kardecista: null,
      sacralizacao: null,
    });
    expect(b.linhagem).toEqual([]);
  });

  it('com() retorna nova instância (imutabilidade)', () => {
    const b1 = BlocoUmbanda.vazio(CASA);
    const b2 = b1.com({ sincretismo: 'forte', linhasTrabalhadas: ['caboclo'] });
    expect(b1).not.toBe(b2);
    expect(b1.sincretismo).toBeNull();
    expect(b2.sincretismo).toBe('forte');
    expect(b2.linhasTrabalhadas).toEqual(['caboclo']);
  });

  it('com() preserva campos não informados', () => {
    const base = BlocoUmbanda.vazio(CASA).com({
      sincretismo: 'parcial',
      linhagem: ['branca'],
    });
    const novo = base.com({ sacralizacao: 'sim' });
    expect(novo.sincretismo).toBe('parcial');
    expect(novo.linhagem).toEqual(['branca']);
    expect(novo.sacralizacao).toBe('sim');
  });
});
