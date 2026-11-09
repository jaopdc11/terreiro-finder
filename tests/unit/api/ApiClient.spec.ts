import { describe, expect, it } from 'vitest';
import { ApiClient, ApiError } from '@/shared/lib/ApiClient';
import { apiFalsa, erro, ok } from './fetchFalso';

describe('ApiClient', () => {
  it('desembrulha o envelope e manda cookie (credentials include)', async () => {
    const { api, chamadas } = apiFalsa({ 'GET /saude': ok({ x: 1 }) });
    await expect(api.get('/saude')).resolves.toEqual({ x: 1 });
    expect(chamadas[0]?.credentials).toBe('include');
  });

  it('monta query string ignorando vazios', async () => {
    const { api, chamadas } = apiFalsa({ 'GET /casas': ok([]) });
    await api.get('/casas', { tradicao: 'umbanda', cidade: undefined, bairro: '' });
    expect(chamadas[0]?.url).toBe('/casas?tradicao=umbanda');
  });

  it('manda JSON no POST e nada quando não há corpo', async () => {
    const { api, chamadas } = apiFalsa({ 'POST /a': ok(null), 'POST /b': ok(null) });
    await api.post('/a', { k: 'v' });
    await api.post('/b');
    expect(chamadas[0]?.corpo).toEqual({ k: 'v' });
    expect(chamadas[1]?.corpo).toBeUndefined();
  });

  it('erro da API vira ApiError com status, código e detalhes', async () => {
    const { api } = apiFalsa({ 'POST /casas': erro(422, 'ENTRADA_INVALIDA', 'Confira', { nome: 'curto' }) });
    const e = await api.post('/casas', {}).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect(e).toMatchObject({ status: 422, codigo: 'ENTRADA_INVALIDA', message: 'Confira', detalhes: { nome: 'curto' } });
  });

  it('resposta fora do envelope vira RESPOSTA_INESPERADA', async () => {
    const { api } = apiFalsa({ 'GET /x': { status: 502, corpo: 'bad gateway' } });
    await expect(api.get('/x')).rejects.toMatchObject({ codigo: 'RESPOSTA_INESPERADA', status: 502 });
  });

  it('falha de rede vira SEM_CONEXAO', async () => {
    const api = new ApiClient('https://api.teste', async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(api.get('/x')).rejects.toMatchObject({ codigo: 'SEM_CONEXAO', status: 0 });
  });

  it('upload vai em multipart no campo foto', async () => {
    const { api, chamadas } = apiFalsa({ 'POST /casas/1/fotos': ok({}) });
    await api.enviarArquivo('/casas/1/fotos', new Blob(['x']), 'a.jpg');
    const form = chamadas[0]?.corpo;
    if (!(form instanceof FormData)) throw new Error('esperava FormData');
    expect(form.get('foto')).toBeInstanceOf(Blob);
  });
});
