import { describe, expect, it } from 'vitest';
import { Coordenadas } from './Coordenadas';
import { DomainError } from '@/shared/lib/errors';

describe('Coordenadas', () => {
  it('cria com lat/lng válidos', () => {
    const c = Coordenadas.parse({ lat: -26.9078, lng: -48.6614 }); // Itajaí
    expect(c.lat).toBeCloseTo(-26.9078);
    expect(c.lng).toBeCloseTo(-48.6614);
  });

  it('rejeita lat fora do range', () => {
    expect(() => Coordenadas.parse({ lat: 91, lng: 0 })).toThrow(DomainError);
    expect(() => Coordenadas.parse({ lat: -91, lng: 0 })).toThrow(DomainError);
  });

  it('rejeita lng fora do range', () => {
    expect(() => Coordenadas.parse({ lat: 0, lng: 181 })).toThrow(DomainError);
  });

  it('rejeita tipos inválidos', () => {
    expect(() => Coordenadas.parse({ lat: 'a', lng: 0 })).toThrow(DomainError);
  });

  describe('deRow', () => {
    it('retorna null quando ambos são null', () => {
      expect(Coordenadas.deRow(null, null)).toBeNull();
    });

    it('cria instância quando ambos vêm numéricos', () => {
      const c = Coordenadas.deRow(-26.9, -48.6);
      expect(c).not.toBeNull();
      expect(c?.lat).toBe(-26.9);
    });

    it('lança erro se só um veio (par inconsistente)', () => {
      expect(() => Coordenadas.deRow(-26.9, null)).toThrow(DomainError);
    });
  });

  it('equals compara por valor', () => {
    expect(Coordenadas.parse({ lat: 1, lng: 2 }).equals(Coordenadas.parse({ lat: 1, lng: 2 }))).toBe(
      true,
    );
    expect(Coordenadas.parse({ lat: 1, lng: 2 }).equals(Coordenadas.parse({ lat: 1, lng: 3 }))).toBe(
      false,
    );
  });
});
