import { describe, expect, it } from 'vitest';
import { Contato } from './Contato';
import { DomainError } from '@/shared/lib/errors';

describe('Contato', () => {
  it('aceita só WhatsApp', () => {
    const c = Contato.parse({ whatsapp: '47999999999' });
    expect(c.whatsapp).toBe('47999999999');
    expect(c.email).toBeNull();
  });

  it('aceita só email', () => {
    const c = Contato.parse({ email: 'contato@casa.org' });
    expect(c.email).toBe('contato@casa.org');
  });

  it('rejeita objeto sem nenhum canal', () => {
    expect(() => Contato.parse({})).toThrow(DomainError);
  });

  it('rejeita email mal formado', () => {
    expect(() => Contato.parse({ email: 'sem-arroba' })).toThrow(DomainError);
  });

  it('rejeita telefone muito curto', () => {
    expect(() => Contato.parse({ telefone: '123' })).toThrow(DomainError);
  });

  it('aceita telefone com máscara', () => {
    const c = Contato.parse({ telefone: '(47) 99999-1234' });
    expect(c.telefone).toBe('(47) 99999-1234');
  });

  describe('deRow', () => {
    it('retorna null quando todos os campos estão vazios', () => {
      expect(Contato.deRow({ whatsapp: null, telefone: null, email_contato: null })).toBeNull();
    });

    it('monta a partir dos campos do banco', () => {
      const c = Contato.deRow({ whatsapp: '47999', email_contato: 'a@b.org' });
      expect(c?.whatsapp).toBe('47999');
      expect(c?.email).toBe('a@b.org');
    });
  });

  describe('principal', () => {
    it('prefere whatsapp sobre telefone e email', () => {
      const c = Contato.parse({
        whatsapp: '47999990001',
        telefone: '4733330001',
        email: 'a@b.org',
      });
      expect(c.principal()).toEqual({ tipo: 'whatsapp', valor: '47999990001' });
    });

    it('cai pra telefone quando não há whatsapp', () => {
      const c = Contato.parse({ telefone: '4733330001' });
      expect(c.principal()).toEqual({ tipo: 'telefone', valor: '4733330001' });
    });
  });
});
