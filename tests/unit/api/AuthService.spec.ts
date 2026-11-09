import { describe, expect, it } from 'vitest';
import { AuthService } from '@/features/auth/api/AuthService';
import { SessaoStore } from '@/features/auth/stores/SessaoStore';
import { ServiceError } from '@/shared/lib/errors';
import { apiFalsa, erro, ok } from './fetchFalso';

const usuario = {
  id: '277e18be-6598-4249-946a-fcf23f6a400f',
  email: 'mae@teste.dev',
  nomeCompleto: 'Mãe Teste',
  nomeExibicao: 'Mãe',
  papel: 'dirigente',
};

describe('AuthService + SessaoStore', () => {
  it('store carrega a sessão do cookie ao escutar', async () => {
    const { api } = apiFalsa({ 'GET /auth/eu': ok(usuario) });
    const store = new SessaoStore(new AuthService(api));
    await store.escutar();
    expect(store.use.getState().sessao?.nomeExibicao).toBe('Mãe');
    expect(store.use.getState().carregando).toBe(false);
  });

  it('sem cookie (401) a store fica sem sessão', async () => {
    const { api } = apiFalsa({ 'GET /auth/eu': erro(401, 'NAO_AUTENTICADO') });
    const store = new SessaoStore(new AuthService(api));
    await store.escutar();
    expect(store.use.getState().sessao).toBeNull();
  });

  it('login e logout atualizam a store', async () => {
    const { api } = apiFalsa({
      'GET /auth/eu': erro(401, 'NAO_AUTENTICADO'),
      'POST /auth/entrar': ok(usuario),
      'POST /auth/sair': ok(null),
    });
    const auth = new AuthService(api);
    const store = new SessaoStore(auth);
    await store.escutar();
    await auth.login('mae@teste.dev', 'senha-boa-1');
    expect(store.use.getState().sessao?.ehDirigente()).toBe(true);
    await auth.logout();
    expect(store.use.getState().sessao).toBeNull();
  });

  it('confirmar e-mail já loga', async () => {
    const { api, chamadas } = apiFalsa({ 'GET /auth/eu': erro(401, 'NAO_AUTENTICADO'), 'POST /auth/confirmar': ok(usuario) });
    const auth = new AuthService(api);
    const store = new SessaoStore(auth);
    await store.escutar();
    await auth.confirmarEmail('tok');
    expect(chamadas[1]?.corpo).toEqual({ token: 'tok' });
    expect(store.use.getState().sessao?.userId).toBe(usuario.id);
  });

  it('e-mail não confirmado chega como ServiceError com o código da API', async () => {
    const { api } = apiFalsa({ 'POST /auth/entrar': erro(403, 'EMAIL_NAO_CONFIRMADO', 'Confirme seu e-mail antes de entrar.') });
    const e = await new AuthService(api).login('a@b.dev', 'x').catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ServiceError);
    expect(e).toMatchObject({ code: 'EMAIL_NAO_CONFIRMADO', message: 'Confirme seu e-mail antes de entrar.' });
  });

  it('cadastro, reenvio, esqueci e redefinir chamam as rotas certas', async () => {
    const { api, chamadas } = apiFalsa({
      'POST /auth/cadastro': { status: 202, corpo: { status: 'ok', data: { mensagem: 'ok' } } },
      'POST /auth/reenviar-confirmacao': ok(null),
      'POST /auth/esqueci-senha': ok(null),
      'POST /auth/redefinir-senha': ok(null),
    });
    const auth = new AuthService(api);
    await auth.cadastrar({ nomeCompleto: 'Fulano', email: 'f@t.dev', senha: 'senha-boa-1', eDirigencia: true });
    await auth.reenviarConfirmacao('f@t.dev');
    await auth.recuperarSenha('f@t.dev');
    await auth.redefinirSenha('tok', 'senha-nova-1');
    expect(chamadas[0]?.corpo).toEqual({
      nomeCompleto: 'Fulano',
      nomeExibicao: null,
      email: 'f@t.dev',
      senha: 'senha-boa-1',
      ehDirigencia: true,
    });
    expect(chamadas.map((c) => c.url)).toEqual([
      '/auth/cadastro',
      '/auth/reenviar-confirmacao',
      '/auth/esqueci-senha',
      '/auth/redefinir-senha',
    ]);
  });
});
