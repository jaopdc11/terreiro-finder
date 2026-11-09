import { describe, expect, it } from 'vitest';
import { inject } from 'vitest';
import { AuthService } from '@/features/auth/api/AuthService';
import { ultimoLinkPara } from '../../setup/ambienteApi';
import { contextoIntegracao } from '../../setup/contexto';

function tokenDo(link: string | null): string {
  const t = link ? new URL(link).searchParams.get('token') : null;
  if (!t) throw new Error('link de e-mail não encontrado no log da API');
  return t;
}

async function esperarLink(email: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const link = ultimoLinkPara(inject('logApi'), email);
    if (link) return tokenDo(link);
    await new Promise((r) => setTimeout(r, 100));
  }
  return tokenDo(null);
}

describe('auth (integração)', () => {
  const ctx = contextoIntegracao();

  it('cadastro → não entra antes de confirmar → confirma pelo link e já fica logado', async () => {
    const cliente = ctx.anonimo();
    const auth = new AuthService(cliente.api);
    const email = `cad-${Date.now()}@teste.local`;
    await auth.cadastrar({ nomeCompleto: 'Pessoa Nova', email, senha: 'senha-forte-1', eDirigencia: true });
    await expect(auth.login(email, 'senha-forte-1')).rejects.toMatchObject({ code: 'EMAIL_NAO_CONFIRMADO' });

    const s = await auth.confirmarEmail(await esperarLink(email));
    expect(s.ehDirigente()).toBe(true);
    expect((await auth.sessaoAtual())?.email).toBe(email);
  });

  it('cadastro com e-mail existente responde igual (não revela conta)', async () => {
    const u = await ctx.banco.criarUsuario();
    await expect(
      new AuthService(ctx.anonimo().api).cadastrar({ nomeCompleto: 'Outra', email: u.email, senha: 'outra-senha-1' }),
    ).resolves.toBeUndefined();
  });

  it('login, sessão e logout', async () => {
    const u = await ctx.banco.criarUsuario({ nome: 'Fulana' });
    const auth = new AuthService(ctx.anonimo().api);
    await expect(auth.login(u.email, 'senha-errada-1')).rejects.toMatchObject({ code: 'CREDENCIAIS_INVALIDAS' });
    expect((await auth.login(u.email, u.senha)).nomeExibicao).toBe('Fulana');
    await auth.logout();
    expect(await auth.sessaoAtual()).toBeNull();
  });

  it('esqueci a senha → redefinir derruba a sessão e a senha nova vale', async () => {
    const u = await ctx.banco.criarUsuario();
    const logado = ctx.anonimo();
    await new AuthService(logado.api).login(u.email, u.senha);

    const auth = new AuthService(ctx.anonimo().api);
    await auth.recuperarSenha(u.email);
    await auth.redefinirSenha(await esperarLink(u.email), 'senha-nova-123');

    expect(await new AuthService(logado.api).sessaoAtual()).toBeNull();
    await expect(auth.login(u.email, u.senha)).rejects.toMatchObject({ code: 'CREDENCIAIS_INVALIDAS' });
    expect((await auth.login(u.email, 'senha-nova-123')).email).toBe(u.email);
  });
});
