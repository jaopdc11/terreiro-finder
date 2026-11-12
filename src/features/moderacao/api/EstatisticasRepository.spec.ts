import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from '@/shared/lib/ApiClient';
import { EstatisticasRepository } from './EstatisticasRepository';

const periodo = { de: '2026-11-01T03:00:00.000Z', ate: '2026-11-12T03:00:00.000Z' };

function repoCom(data: unknown) {
  const fetcher = vi.fn(async () => new Response(JSON.stringify({ status: 'ok', data }), { status: 200 }));
  return { repo: new EstatisticasRepository(new ApiClient('https://api.teste', fetcher as typeof fetch)), fetcher };
}

describe('EstatisticasRepository', () => {
  it('top manda dim e período e valida as linhas', async () => {
    const { repo, fetcher } = repoCom([{ valor: 'Itajaí', visitas: 4, visitantes: 3 }]);
    expect(await repo.top(periodo, 'cidade')).toEqual([{ valor: 'Itajaí', visitas: 4, visitantes: 3 }]);
    const url = new URL(String((fetcher.mock.calls[0] as unknown[])[0]));
    expect(url.pathname).toBe('/estatisticas/top');
    expect(url.searchParams.get('dim')).toBe('cidade');
    expect(url.searchParams.get('de')).toBe(periodo.de);
  });

  it('resposta fora do formato lança', async () => {
    const { repo } = repoCom([{ tipo: 'contato_whatsapp' }]);
    await expect(repo.eventos(periodo)).rejects.toThrow();
  });
});
