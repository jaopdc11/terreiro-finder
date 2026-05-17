import { describe, expect, it } from 'vitest';
import { Slug } from './Slug';
import { DomainError } from '@/shared/lib/errors';

describe('Slug', () => {
  describe('kebab (estática)', () => {
    it('converte texto comum em kebab-case', () => {
      expect(Slug.kebab('Casa de Pai João')).toBe('casa-de-pai-joao');
    });

    it('remove acentos e cedilha', () => {
      expect(Slug.kebab('Tenda Pai Joaquim de Aruanda')).toBe('tenda-pai-joaquim-de-aruanda');
      expect(Slug.kebab('Iansã & Oxóssi')).toBe('iansa-oxossi');
    });

    it('colapsa espaços e símbolos em um único hífen', () => {
      expect(Slug.kebab('  Casa    do  --  Caboclo  ')).toBe('casa-do-caboclo');
    });

    it('retorna string vazia se o texto não tiver caractere alfanumérico', () => {
      expect(Slug.kebab('   --!!  ')).toBe('');
    });
  });

  describe('parse', () => {
    it('aceita slug em formato kebab-case', () => {
      const s = Slug.parse('tenda-caboclo-pena-branca');
      expect(s.toString()).toBe('tenda-caboclo-pena-branca');
    });

    it('rejeita slug com maiúscula', () => {
      expect(() => Slug.parse('Casa-de-Aruanda')).toThrow(DomainError);
    });

    it('rejeita slug com underline', () => {
      expect(() => Slug.parse('casa_aruanda')).toThrow(DomainError);
    });

    it('rejeita slug vazio', () => {
      expect(() => Slug.parse('')).toThrow(DomainError);
    });

    it('rejeita slug com hífen no fim', () => {
      expect(() => Slug.parse('casa-')).toThrow(DomainError);
    });
  });

  describe('deTexto', () => {
    it('gera slug válido a partir de nome com acento', () => {
      expect(Slug.deTexto('Tenda Pai João').toString()).toBe('tenda-pai-joao');
    });

    it('lança DomainError se o texto não vira slug', () => {
      expect(() => Slug.deTexto('  -- ')).toThrow(DomainError);
    });
  });

  describe('deNomeEBairro', () => {
    it('compõe nome + bairro com hífen', () => {
      const s = Slug.deNomeEBairro('Tenda Pai João', 'Cordeiros');
      expect(s.toString()).toBe('tenda-pai-joao-cordeiros');
    });
  });

  describe('comSufixoNumerico', () => {
    it('adiciona -2 ao slug existente', () => {
      const s = Slug.parse('tenda-pai-joao').comSufixoNumerico(2);
      expect(s.toString()).toBe('tenda-pai-joao-2');
    });

    it('rejeita sufixo < 2 (o "base" não usa sufixo)', () => {
      expect(() => Slug.parse('x').comSufixoNumerico(1)).toThrow(DomainError);
    });

    it('rejeita sufixo não inteiro', () => {
      expect(() => Slug.parse('x').comSufixoNumerico(2.5)).toThrow(DomainError);
    });
  });

  describe('equals', () => {
    it('compara por valor', () => {
      expect(Slug.parse('a-b').equals(Slug.parse('a-b'))).toBe(true);
      expect(Slug.parse('a-b').equals(Slug.parse('a-c'))).toBe(false);
    });
  });
});
