import { describe, expect, it, vi } from 'vitest';
import { ViaCepClient } from './ViaCepClient';

function fakeFetch(body: unknown, status = 200): typeof fetch {
  return (() =>
    Promise.resolve(
      new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }),
    )) as unknown as typeof fetch;
}

describe('ViaCepClient', () => {
  it('retorna endereço pra CEP válido', async () => {
    const cli = new ViaCepClient(
      fakeFetch({
        cep: '88307-000',
        logradouro: 'Rua das Cabaças',
        complemento: '',
        bairro: 'Cordeiros',
        localidade: 'Itajaí',
        uf: 'SC',
      }),
    );
    const e = await cli.buscarPorCep('88307000');
    expect(e?.cidade).toBe('Itajaí');
    expect(e?.uf).toBe('SC');
    expect(e?.logradouro).toBe('Rua das Cabaças');
  });

  it('aceita CEP com hífen', async () => {
    const mock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          cep: '01001-000',
          logradouro: 'Praça da Sé',
          complemento: '',
          bairro: 'Sé',
          localidade: 'São Paulo',
          uf: 'SP',
        }),
      ),
    );
    const cli = new ViaCepClient(mock as unknown as typeof fetch);
    await cli.buscarPorCep('01001-000');
    expect(mock).toHaveBeenCalledWith(expect.stringContaining('01001000'));
  });

  it('retorna null pra CEP curto sem chamar API', async () => {
    const mock = vi.fn();
    const cli = new ViaCepClient(mock as unknown as typeof fetch);
    expect(await cli.buscarPorCep('123')).toBeNull();
    expect(mock).not.toHaveBeenCalled();
  });

  it('retorna null quando ViaCEP responde { erro: true }', async () => {
    const cli = new ViaCepClient(fakeFetch({ erro: true }));
    expect(await cli.buscarPorCep('99999999')).toBeNull();
  });

  it('retorna null com { erro: "true" } (variante string)', async () => {
    const cli = new ViaCepClient(fakeFetch({ erro: 'true' }));
    expect(await cli.buscarPorCep('99999999')).toBeNull();
  });

  it('lança ServiceError quando fetch falha', async () => {
    const cli = new ViaCepClient(
      (() => Promise.reject(new Error('network'))) as unknown as typeof fetch,
    );
    await expect(cli.buscarPorCep('88307000')).rejects.toThrow(/CEP/);
  });
});
