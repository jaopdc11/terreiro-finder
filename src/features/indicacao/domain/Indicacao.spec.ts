import { describe, expect, it } from 'vitest';
import { Indicacao } from './Indicacao';
import { DomainError } from '@/shared/lib/errors';

const UID = '11111111-1111-1111-1111-111111111111';

function row(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: '22222222-2222-2222-2222-222222222222',
    user_id: UID,
    nome: 'Casa Indicada Pela Maria',
    cidade: 'Itajaí',
    estado: 'SC',
    bairro: 'Cordeiros',
    tradicao_principal: 'umbanda',
    observacoes: 'Conheço pela minha tia',
    canal_contato: 'Instagram @casa-da-aruanda',
    status: 'pendente',
    casa_id: null,
    moderado_por: null,
    moderado_em: null,
    motivo_recusa: null,
    created_at: new Date().toISOString(),
    ...over,
  };
}

describe('Indicacao', () => {
  it('parseia row válida', () => {
    const i = Indicacao.fromRow(row());
    expect(i.nome).toBe('Casa Indicada Pela Maria');
    expect(i.tradicaoPrincipal).toBe('umbanda');
    expect(i.estaPendente()).toBe(true);
  });

  it('rejeita row sem campo obrigatório', () => {
    const r = row();
    delete (r as Record<string, unknown>).cidade;
    expect(() => Indicacao.fromRow(r)).toThrow(DomainError);
  });

  describe('paraNovaCasa', () => {
    it('produz payload da casa nascendo pendente + fonte=indicacao', () => {
      const i = Indicacao.fromRow(row());
      const payload = i.paraNovaCasa('casa-indicada-pela-maria');
      expect(payload.status).toBe('pendente');
      expect(payload.fonte).toBe('indicacao');
      expect(payload.tradicao_principal).toBe('umbanda');
      expect(payload.endereco_visibilidade).toBe('sob_contato');
      expect(payload.slug).toBe('casa-indicada-pela-maria');
    });

    it('falha se indicação não tiver tradição definida', () => {
      const i = Indicacao.fromRow(row({ tradicao_principal: null }));
      expect(() => i.paraNovaCasa('x')).toThrow(DomainError);
    });

    it('valida o slug recebido', () => {
      const i = Indicacao.fromRow(row());
      expect(() => i.paraNovaCasa('Slug Invalido')).toThrow();
    });
  });
});
