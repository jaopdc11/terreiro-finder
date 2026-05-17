import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { GeocodingService } from './GeocodingService';
import { ServiceError } from './errors';

const URL_NOM = 'https://nominatim.openstreetmap.org/search';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function svc(): GeocodingService {
  // fetch globalmente — MSW intercepta. Sem rate limit visível nesses testes
  // (cada teste cria nova instância → ultimoChamado=0).
  return new GeocodingService();
}

describe('GeocodingService', () => {
  it('retorna coordenadas quando Nominatim devolve resultado', async () => {
    server.use(
      http.get(URL_NOM, () =>
        HttpResponse.json([
          { lat: '-26.9078', lon: '-48.6614', display_name: 'Itajaí, SC, Brasil' },
        ]),
      ),
    );

    const r = await svc().buscar('Itajaí SC');
    expect(r).not.toBeNull();
    expect(r?.coordenadas.lat).toBeCloseTo(-26.9078, 3);
    expect(r?.rotulo).toContain('Itajaí');
  });

  it('retorna null quando consulta é muito curta (sem chamada HTTP)', async () => {
    // Sem handler → MSW retornaria onUnhandledRequest:error. Aqui não rola HTTP.
    const r = await svc().buscar('ai');
    expect(r).toBeNull();
  });

  it('retorna null quando Nominatim devolve lista vazia', async () => {
    server.use(http.get(URL_NOM, () => HttpResponse.json([])));
    const r = await svc().buscar('xyz123 sem resultado');
    expect(r).toBeNull();
  });

  it('lança ServiceError em 429 (rate limit)', async () => {
    server.use(http.get(URL_NOM, () => new HttpResponse(null, { status: 429 })));
    await expect(svc().buscar('Itajaí')).rejects.toThrow(ServiceError);
  });

  it('lança ServiceError em 500', async () => {
    server.use(http.get(URL_NOM, () => new HttpResponse(null, { status: 500 })));
    await expect(svc().buscar('Itajaí')).rejects.toThrow(ServiceError);
  });

  it('lança ServiceError quando rede falha', async () => {
    server.use(http.get(URL_NOM, () => HttpResponse.error()));
    await expect(svc().buscar('Itajaí')).rejects.toThrow(ServiceError);
  });
});
