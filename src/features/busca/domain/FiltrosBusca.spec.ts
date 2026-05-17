import { describe, expect, it } from 'vitest';
import { FiltrosBusca } from './FiltrosBusca';
import { DomainError } from '@/shared/lib/errors';

describe('FiltrosBusca', () => {
  it('vazio() retorna instância sem filtros', () => {
    const f = FiltrosBusca.vazio();
    expect(f.estaVazio()).toBe(true);
    expect(f.toQueryParams().toString()).toBe('');
  });

  it('parse aceita objeto bem formado', () => {
    const f = FiltrosBusca.parse({
      tradicao: 'umbanda',
      cidade: 'Itajaí',
      tags: ['caboclo', 'pretovelho'],
    });
    expect(f.tradicao).toBe('umbanda');
    expect(f.cidade).toBe('Itajaí');
    expect(f.tags).toEqual(['caboclo', 'pretovelho']);
  });

  it('parse rejeita tradição inválida', () => {
    expect(() => FiltrosBusca.parse({ tradicao: 'xyz' })).toThrow(DomainError);
  });

  describe('mutadores retornam nova instância', () => {
    it('comTradicao', () => {
      const a = FiltrosBusca.vazio();
      const b = a.comTradicao('candomble');
      expect(a).not.toBe(b);
      expect(a.tradicao).toBeNull();
      expect(b.tradicao).toBe('candomble');
    });

    it('comTagAlternada adiciona e remove', () => {
      const a = FiltrosBusca.vazio().comTagAlternada('caboclo');
      expect(a.tags).toEqual(['caboclo']);
      const b = a.comTagAlternada('caboclo');
      expect(b.tags).toEqual([]);
    });

    it('mudar tradição zera tags (eram específicas da anterior)', () => {
      const f = FiltrosBusca.vazio()
        .comTradicao('umbanda')
        .comTagAlternada('caboclo')
        .comTradicao('candomble');
      expect(f.tags).toEqual([]);
      expect(f.tradicao).toBe('candomble');
    });

    it('manter mesma tradição preserva tags', () => {
      const f = FiltrosBusca.vazio()
        .comTradicao('umbanda')
        .comTagAlternada('caboclo')
        .comTradicao('umbanda');
      expect(f.tags).toEqual(['caboclo']);
    });

    it('comNacaoCandomble seta nação só quando tradição é candomble', () => {
      const f = FiltrosBusca.vazio()
        .comTradicao('candomble')
        .comNacaoCandomble('ketu');
      expect(f.nacaoCandomble).toBe('ketu');
    });

    it('mudar tradição zera nacaoCandomble e soAbertasQuimbanda', () => {
      const a = FiltrosBusca.vazio()
        .comTradicao('candomble')
        .comNacaoCandomble('ketu')
        .comTradicao('quimbanda');
      expect(a.nacaoCandomble).toBeNull();

      const b = FiltrosBusca.vazio()
        .comTradicao('quimbanda')
        .comSoAbertasQuimbanda(true)
        .comTradicao('umbanda');
      expect(b.soAbertasQuimbanda).toBe(false);
    });
  });

  describe('serialização URL', () => {
    it('round-trip toQueryParams → fromUrl', () => {
      const original = FiltrosBusca.parse({
        tradicao: 'umbanda',
        cidade: 'Itajaí',
        aceitaVisitantes: 'aberto',
        tags: ['caboclo', 'marinheiro'],
      });
      const recriada = FiltrosBusca.fromUrl(original.toQueryParams());
      expect(recriada.tradicao).toBe('umbanda');
      expect(recriada.cidade).toBe('Itajaí');
      expect(recriada.aceitaVisitantes).toBe('aberto');
      expect(new Set(recriada.tags)).toEqual(new Set(['caboclo', 'marinheiro']));
    });

    it('fromUrl ignora params desconhecidos', () => {
      const f = FiltrosBusca.fromUrl(new URLSearchParams('tradicao=umbanda&zalupa=1'));
      expect(f.tradicao).toBe('umbanda');
    });

    it('toQueryParams omite filtros nulos', () => {
      const f = FiltrosBusca.vazio().comCidade('Itajaí');
      const p = f.toQueryParams();
      expect(p.has('tradicao')).toBe(false);
      expect(p.get('cidade')).toBe('Itajaí');
    });

    it('round-trip preserva nacaoCandomble e soAbertasQuimbanda', () => {
      const original = FiltrosBusca.vazio()
        .comTradicao('candomble')
        .comNacaoCandomble('jeje');
      const recriada = FiltrosBusca.fromUrl(original.toQueryParams());
      expect(recriada.nacaoCandomble).toBe('jeje');

      const original2 = FiltrosBusca.vazio()
        .comTradicao('quimbanda')
        .comSoAbertasQuimbanda(true);
      const recriada2 = FiltrosBusca.fromUrl(original2.toQueryParams());
      expect(recriada2.soAbertasQuimbanda).toBe(true);
    });
  });

  describe('toQueryKey', () => {
    it('é determinístico independente da ordem das tags', () => {
      const a = FiltrosBusca.vazio()
        .comTradicao('umbanda')
        .comTagAlternada('caboclo')
        .comTagAlternada('marinheiro');
      const b = FiltrosBusca.vazio()
        .comTradicao('umbanda')
        .comTagAlternada('marinheiro')
        .comTagAlternada('caboclo');
      expect(JSON.stringify(a.toQueryKey())).toBe(JSON.stringify(b.toQueryKey()));
    });

    it('queryKey muda quando um filtro muda', () => {
      const a = FiltrosBusca.vazio().comTradicao('umbanda');
      const b = a.comCidade('Itajaí');
      expect(JSON.stringify(a.toQueryKey())).not.toBe(JSON.stringify(b.toQueryKey()));
    });
  });
});
