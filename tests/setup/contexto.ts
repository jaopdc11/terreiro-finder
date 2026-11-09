import { afterAll, beforeAll, inject } from 'vitest';
import { BancoTeste } from './BancoTeste';
import { ClienteTeste } from './ClienteTeste';

/**
 * Contexto de um arquivo de integração: banco limpo no início, helpers pra
 * criar clientes (anônimo / logado) contra a API real.
 */
export function contextoIntegracao() {
  let banco: BancoTeste | null = null;
  const ctx = {
    get banco(): BancoTeste {
      if (!banco) throw new Error('banco só existe dentro dos testes (depois do beforeAll)');
      return banco;
    },
    anonimo(): ClienteTeste {
      return new ClienteTeste(inject('apiUrl'), inject('origem'));
    },
    async logado(papel: 'visitante' | 'dirigente' | 'admin' = 'visitante') {
      const u = await ctx.banco.criarUsuario({ papel });
      const cliente = await new ClienteTeste(inject('apiUrl'), inject('origem')).entrar(u.email, u.senha);
      return { cliente, usuario: u };
    },
  };
  beforeAll(async () => {
    banco = new BancoTeste(inject('dbUrl'));
    await banco.limparTudo();
  });
  afterAll(async () => {
    await banco?.fechar();
  });
  return ctx;
}
