import { describe, expect, it } from 'vitest';
import { distanciaKm, formataDistancia } from './distancia';

describe('distanciaKm', () => {
  it('mesmo ponto → 0', () => {
    expect(distanciaKm(-26.9, -48.66, -26.9, -48.66)).toBe(0);
  });

  it('Itajaí → Florianópolis ~85 km', () => {
    // Itajaí (-26.9078, -48.6614) → Florianópolis (-27.5954, -48.5480)
    const d = distanciaKm(-26.9078, -48.6614, -27.5954, -48.548);
    expect(d).toBeGreaterThan(75);
    expect(d).toBeLessThan(95);
  });

  it('Rio → São Paulo ~360 km', () => {
    // Rio (-22.9068, -43.1729) → SP (-23.5505, -46.6333)
    const d = distanciaKm(-22.9068, -43.1729, -23.5505, -46.6333);
    expect(d).toBeGreaterThan(350);
    expect(d).toBeLessThan(370);
  });

  it('é simétrico', () => {
    const ab = distanciaKm(-26.9, -48.66, -27.6, -48.55);
    const ba = distanciaKm(-27.6, -48.55, -26.9, -48.66);
    expect(ab).toBeCloseTo(ba, 6);
  });
});

describe('formataDistancia', () => {
  it('< 1 km mostra em metros', () => {
    expect(formataDistancia(0.35)).toBe('350 m');
    expect(formataDistancia(0.05)).toBe('50 m');
  });

  it('1-10 km mostra com 1 casa decimal e vírgula', () => {
    expect(formataDistancia(2.34)).toBe('2,3 km');
    expect(formataDistancia(9.99)).toBe('10,0 km');
  });

  it('≥ 10 km arredonda pra inteiro', () => {
    expect(formataDistancia(14.7)).toBe('15 km');
    expect(formataDistancia(123.4)).toBe('123 km');
  });
});
