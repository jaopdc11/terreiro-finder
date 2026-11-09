import { vi } from 'vitest';
import { ApiClient } from '@/shared/lib/ApiClient';

export interface Chamada {
  url: string;
  metodo: string;
  corpo: unknown;
  credentials: RequestCredentials | undefined;
}

/**
 * ApiClient com fetch falso: cada rota "METODO /caminho" devolve um corpo de
 * envelope. Guarda as chamadas pra conferir método, URL e corpo.
 */
export function apiFalsa(rotas: Record<string, { status?: number; corpo: unknown }>) {
  const chamadas: Chamada[] = [];
  const fetcher = vi.fn(async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const url = String(entrada).replace('https://api.teste', '');
    const metodo = init?.method ?? 'GET';
    const corpo =
      init?.body instanceof FormData ? init.body : init?.body ? JSON.parse(String(init.body)) : undefined;
    chamadas.push({ url, metodo, corpo, credentials: init?.credentials });
    const chave = `${metodo} ${url.split('?')[0]}`;
    const r = rotas[chave];
    if (!r) throw new Error(`rota não mockada: ${chave}`);
    return new Response(JSON.stringify(r.corpo), { status: r.status ?? 200 });
  });
  return { api: new ApiClient('https://api.teste/', fetcher), chamadas };
}

export const ok = (data: unknown) => ({ corpo: { status: 'ok', data } });
export const erro = (status: number, codigo: string, mensagem = 'falhou', detalhes?: Record<string, string>) => ({
  status,
  corpo: { status: 'erro', erro: { codigo, mensagem, ...(detalhes ? { detalhes } : {}) } },
});

export const CASA_ID = '0f55e921-50bc-447a-9726-c6104a937d3c';

export function casaApi(m: Record<string, unknown> = {}) {
  return {
    id: CASA_ID,
    slug: 'tenda-pai-joaquim',
    nome: 'Tenda Pai Joaquim',
    tradicaoPrincipal: 'umbanda',
    fonte: 'proprio',
    verificada: true,
    endereco: {
      logradouro: null,
      numero: null,
      complemento: null,
      bairro: 'Centro',
      cidade: 'Itajaí',
      estado: 'SC',
      cep: null,
      coordLat: -26.91,
      coordLng: -48.66,
      aproximado: true,
    },
    perfil: {
      descricao: 'Casa de caridade',
      sacerdoteNome: null,
      textoAntesVisita: null,
      whatsapp: '47999999999',
      telefone: null,
      emailContato: null,
      site: null,
    },
    abertura: { enderecoVisibilidade: 'sob_contato', aceitaVisitantes: 'aberto', fotoRegistro: 'proibido' },
    aprovadaEm: '2026-11-09T12:00:00.000Z',
    ...m,
  };
}
