import { describe, expect, it } from 'vitest';
import { Casa } from './Casa';
import { DomainError } from '@/shared/lib/errors';

function rowMinima(over: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'tenda-pai-joao',
    nome: 'Tenda Pai João',
    descricao: null,
    sacerdote_nome: null,
    tradicao_principal: 'umbanda',
    status: 'aprovada',
    fonte: 'proprio',

    logradouro: null,
    numero: null,
    complemento: null,
    bairro: 'Cordeiros',
    cidade: 'Itajaí',
    estado: 'SC',
    cep: null,
    endereco_visibilidade: 'sob_contato',

    coord_lat: null,
    coord_lng: null,

    aceita_visitantes: 'jogo_previo',
    foto_registro: 'parcial',

    whatsapp: null,
    telefone: null,
    email_contato: null,

    texto_antes_visita: null,

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aprovada_em: new Date().toISOString(),
    aprovada_por: '22222222-2222-2222-2222-222222222222',

    ...over,
  };
}

describe('Casa', () => {
  describe('fromRow', () => {
    it('parseia row válida', () => {
      const c = Casa.fromRow(rowMinima());
      expect(c.nome).toBe('Tenda Pai João');
      expect(c.slug.toString()).toBe('tenda-pai-joao');
      expect(c.tradicaoPrincipal).toBe('umbanda');
    });

    it('rejeita row com campo obrigatório faltando', () => {
      const row = rowMinima();
      delete (row as Record<string, unknown>).cidade;
      expect(() => Casa.fromRow(row)).toThrow(DomainError);
    });
  });

  describe('estaVerificada', () => {
    it('é true quando fonte=proprio e status=aprovada', () => {
      const c = Casa.fromRow(rowMinima({ fonte: 'proprio', status: 'aprovada' }));
      expect(c.estaVerificada()).toBe(true);
    });

    it('é true quando fonte=reivindicada e status=aprovada', () => {
      const c = Casa.fromRow(rowMinima({ fonte: 'reivindicada', status: 'aprovada' }));
      expect(c.estaVerificada()).toBe(true);
    });

    it('é false quando fonte=indicacao mesmo com status=aprovada (regra do passo 2)', () => {
      const c = Casa.fromRow(rowMinima({ fonte: 'indicacao', status: 'aprovada' }));
      expect(c.estaVerificada()).toBe(false);
    });

    it('é false quando status != aprovada', () => {
      const c = Casa.fromRow(rowMinima({ fonte: 'proprio', status: 'pendente' }));
      expect(c.estaVerificada()).toBe(false);
    });
  });

  describe('enderecoPublico', () => {
    it('retorna null quando visibilidade != publico', () => {
      const c = Casa.fromRow(rowMinima({ endereco_visibilidade: 'sob_contato' }));
      expect(c.enderecoPublico()).toBeNull();
    });

    it('retorna null quando visibilidade=publico mas não há campos preenchidos', () => {
      const c = Casa.fromRow(
        rowMinima({
          endereco_visibilidade: 'publico',
          logradouro: null,
          numero: null,
          bairro: null,
        }),
      );
      // Sobra só Itajaí/SC — não é null.
      expect(c.enderecoPublico()).toContain('Itajaí/SC');
    });

    it('compõe endereço quando visibilidade=publico', () => {
      const c = Casa.fromRow(
        rowMinima({
          endereco_visibilidade: 'publico',
          logradouro: 'Rua das Flores',
          numero: '100',
          bairro: 'Centro',
        }),
      );
      const e = c.enderecoPublico();
      expect(e).toContain('Rua das Flores');
      expect(e).toContain('100');
      expect(e).toContain('Centro');
      expect(e).toContain('Itajaí/SC');
    });
  });

  describe('podeSerEditadaPor', () => {
    const dirigentes = new Set(['user-dirigente']);

    it('false sem sessão', () => {
      const c = Casa.fromRow(rowMinima());
      expect(c.podeSerEditadaPor(null, dirigentes)).toBe(false);
    });

    it('true para admin mesmo sem ser dirigente', () => {
      const c = Casa.fromRow(rowMinima());
      const sess = { userId: 'admin', podeAdministrar: () => true };
      expect(c.podeSerEditadaPor(sess, dirigentes)).toBe(true);
    });

    it('true para dirigente da casa', () => {
      const c = Casa.fromRow(rowMinima());
      const sess = { userId: 'user-dirigente', podeAdministrar: () => false };
      expect(c.podeSerEditadaPor(sess, dirigentes)).toBe(true);
    });

    it('false para outro usuário', () => {
      const c = Casa.fromRow(rowMinima());
      const sess = { userId: 'curioso', podeAdministrar: () => false };
      expect(c.podeSerEditadaPor(sess, dirigentes)).toBe(false);
    });
  });
});
