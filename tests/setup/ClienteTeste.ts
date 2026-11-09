import { ApiClient } from '@/shared/lib/ApiClient';

/**
 * ApiClient do front rodando em Node, fazendo o papel do navegador:
 * guarda o cookie de sessão, manda Origin (a API exige nas escritas) e um
 * IP falso por cliente (X-Forwarded-For) pra o rate limit por IP da API não
 * misturar os testes.
 */
export class ClienteTeste {
  private cookie: string | null = null;
  readonly api: ApiClient;
  private readonly ip = `10.${rand()}.${rand()}.${rand()}`;

  constructor(apiUrl: string, private readonly origem: string) {
    this.api = new ApiClient(apiUrl, this.fetcher);
  }

  get logado(): boolean {
    return this.cookie !== null;
  }

  private readonly fetcher: typeof fetch = async (entrada, init) => {
    const headers = new Headers(init?.headers);
    headers.set('Origin', this.origem);
    headers.set('X-Forwarded-For', this.ip);
    if (this.cookie) headers.set('Cookie', this.cookie);
    const resposta = await fetch(entrada, { ...init, headers });
    for (const c of resposta.headers.getSetCookie()) {
      const [par] = c.split(';');
      if (!par) continue;
      const valor = par.slice(par.indexOf('=') + 1);
      // clearCookie manda valor vazio (e expira no passado)
      this.cookie = valor === '' ? null : par;
    }
    return resposta;
  };

  async entrar(email: string, senha: string): Promise<this> {
    await this.api.post('/auth/entrar', { email, senha });
    return this;
  }
}

function rand(): number {
  return Math.floor(Math.random() * 250) + 1;
}
