import { z } from 'zod';

/**
 * Erro vindo da encruza-api. `codigo` é estável (o front decide a mensagem
 * por ele quando precisa); `detalhes` traz campo → problema nos 422.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem: string,
    readonly detalhes: Readonly<Record<string, string>> = {},
  ) {
    super(mensagem);
    this.name = 'ApiError';
  }
}

const envelopeErro = z.object({
  status: z.literal('erro'),
  erro: z.object({
    codigo: z.string(),
    mensagem: z.string(),
    detalhes: z.record(z.string()).optional(),
  }),
});

const envelopeOk = z.object({ status: z.literal('ok'), data: z.unknown() });

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Client HTTP da encruza-api. Sessão vai no cookie httpOnly
 * (`credentials: 'include'`); o client só desembrulha o envelope
 * `{status, data}` e transforma erro em ApiError. Quem chama faz o parse
 * do `data` com Zod.
 */
export class ApiClient {
  private readonly base: string;

  constructor(
    base: string,
    private readonly fetcher: typeof fetch = (...args) => globalThis.fetch(...args),
  ) {
    this.base = base.replace(/\/+$/, '');
  }

  static fromEnv(): ApiClient {
    const url = import.meta.env.VITE_API_URL;
    if (!url) throw new Error('VITE_API_URL é obrigatória.');
    return new ApiClient(url);
  }

  get(caminho: string, query?: Record<string, string | undefined>): Promise<unknown> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== '') params.set(k, v);
    const qs = params.toString();
    return this.requisitar('GET', qs ? `${caminho}?${qs}` : caminho);
  }

  post(caminho: string, corpo?: unknown): Promise<unknown> {
    return this.requisitar('POST', caminho, corpo);
  }

  put(caminho: string, corpo?: unknown): Promise<unknown> {
    return this.requisitar('PUT', caminho, corpo);
  }

  delete(caminho: string): Promise<unknown> {
    return this.requisitar('DELETE', caminho);
  }

  /** Upload multipart; a API espera o arquivo no campo `foto`. */
  enviarArquivo(caminho: string, arquivo: Blob, nome: string): Promise<unknown> {
    const form = new FormData();
    form.append('foto', arquivo, nome);
    return this.executar('POST', caminho, { body: form });
  }

  private requisitar(metodo: Metodo, caminho: string, corpo?: unknown): Promise<unknown> {
    const init: RequestInit = {};
    if (corpo !== undefined) {
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(corpo);
    }
    return this.executar(metodo, caminho, init);
  }

  private async executar(metodo: Metodo, caminho: string, init: RequestInit): Promise<unknown> {
    let resposta: Response;
    try {
      resposta = await this.fetcher(`${this.base}${caminho}`, {
        ...init,
        method: metodo,
        credentials: 'include',
      });
    } catch {
      throw new ApiError(0, 'SEM_CONEXAO', 'Sem conexão. Tente novamente.');
    }

    const corpo: unknown = await resposta.json().catch(() => null);
    const ok = envelopeOk.safeParse(corpo);
    if (resposta.ok && ok.success) return ok.data.data;

    const erro = envelopeErro.safeParse(corpo);
    if (erro.success) {
      const e = erro.data.erro;
      throw new ApiError(resposta.status, e.codigo, e.mensagem, e.detalhes ?? {});
    }
    throw new ApiError(resposta.status, 'RESPOSTA_INESPERADA', 'Algo deu errado. Tente novamente.');
  }
}
