import { describe, expect, it } from 'vitest';
import { Reivindicacao } from './Reivindicacao';
import { DomainError } from '@/shared/lib/errors';

const UID = '11111111-1111-1111-1111-111111111111';
const CASA = '22222222-2222-2222-2222-222222222222';

function row(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: '33333333-3333-3333-3333-333333333333',
    user_id: UID,
    casa_id: CASA,
    observacoes: 'Sou da dirigência há 8 anos.',
    status: 'pendente',
    moderado_por: null,
    moderado_em: null,
    motivo_recusa: null,
    created_at: new Date().toISOString(),
    ...over,
  };
}

describe('Reivindicacao', () => {
  it('parseia row válida', () => {
    const r = Reivindicacao.fromRow(row());
    expect(r.userId).toBe(UID);
    expect(r.casaId).toBe(CASA);
    expect(r.estaPendente()).toBe(true);
    expect(r.podeSerAprovada()).toBe(true);
  });

  it('rejeita row sem campo obrigatório', () => {
    const r = row();
    delete (r as Record<string, unknown>).casa_id;
    expect(() => Reivindicacao.fromRow(r)).toThrow(DomainError);
  });

  it('podeSerAprovada é false quando já moderada', () => {
    const aprovada = Reivindicacao.fromRow(
      row({
        status: 'aprovada',
        moderado_por: '99999999-9999-9999-9999-999999999999',
        moderado_em: new Date().toISOString(),
      }),
    );
    expect(aprovada.podeSerAprovada()).toBe(false);

    const recusada = Reivindicacao.fromRow(
      row({
        status: 'recusada',
        moderado_por: '99999999-9999-9999-9999-999999999999',
        motivo_recusa: 'Não respondeu',
      }),
    );
    expect(recusada.podeSerAprovada()).toBe(false);
  });

  it('preserva motivoRecusa e moderadoEm quando recusada', () => {
    const r = Reivindicacao.fromRow(
      row({
        status: 'recusada',
        motivo_recusa: 'Sinal cruzado contradiz',
        moderado_em: '2026-05-17T12:00:00Z',
        moderado_por: '99999999-9999-9999-9999-999999999999',
      }),
    );
    expect(r.motivoRecusa).toBe('Sinal cruzado contradiz');
    expect(r.moderadoEm).toBeInstanceOf(Date);
  });
});
