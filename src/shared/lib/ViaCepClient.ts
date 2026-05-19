import { z } from 'zod';
import { ServiceError } from './errors';

const VIA_CEP_BASE = 'https://viacep.com.br/ws';

const respostaSchema = z.union([
  z.object({
    cep: z.string(),
    logradouro: z.string(),
    complemento: z.string(),
    bairro: z.string(),
    localidade: z.string(),
    uf: z.string(),
  }),
  z.object({ erro: z.literal(true) }),
  // Variante mais recente: { erro: "true" } como string
  z.object({ erro: z.string() }),
]);

export interface EnderecoPorCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

/**
 * Cliente da API ViaCEP (https://viacep.com.br). Free, sem auth, sem cookies.
 * Retorna null quando o CEP não é encontrado (em vez de lançar).
 */
export class ViaCepClient {
  // Wrapping em arrow preserva o `this=globalThis` que o fetch nativo precisa
  // em browser (Firefox/Safari lançam "Illegal invocation" sem isso).
  constructor(
    private readonly fetchImpl: typeof fetch = (...args) => fetch(...args),
  ) {}

  async buscarPorCep(cep: string): Promise<EnderecoPorCep | null> {
    const limpo = cep.replace(/\D/g, '');
    if (limpo.length !== 8) return null;

    let resp: Response;
    try {
      resp = await this.fetchImpl(`${VIA_CEP_BASE}/${limpo}/json/`);
    } catch (e) {
      throw new ServiceError('VIACEP_FETCH_FALHOU', 'Não foi possível consultar o CEP.', {
        cause: e,
      });
    }
    if (!resp.ok) {
      throw new ServiceError('VIACEP_HTTP', `ViaCEP retornou ${resp.status}.`);
    }
    const json = (await resp.json()) as unknown;
    const parsed = respostaSchema.safeParse(json);
    if (!parsed.success) {
      throw new ServiceError('VIACEP_FORMATO', 'Resposta inesperada do ViaCEP.', {
        cause: parsed.error,
      });
    }
    if ('erro' in parsed.data) return null;
    return {
      cep: parsed.data.cep,
      logradouro: parsed.data.logradouro,
      complemento: parsed.data.complemento,
      bairro: parsed.data.bairro,
      cidade: parsed.data.localidade,
      uf: parsed.data.uf,
    };
  }
}
