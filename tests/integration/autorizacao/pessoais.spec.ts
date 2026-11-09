import { beforeAll, describe, expect, it } from 'vitest';
import { FavoritosRepository } from '@/features/favoritos/api/FavoritosRepository';
import { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';
import { ModeracaoRepository } from '@/features/moderacao/api/ModeracaoRepository';
import { ApiError } from '@/shared/lib/ApiClient';
import { contextoIntegracao } from '../../setup/contexto';

describe('autorização · favoritos e indicações', () => {
  const ctx = contextoIntegracao();
  let casa: string;
  let pendente: string;

  beforeAll(async () => {
    casa = await ctx.banco.criarCasa({ slug: 'fav', nome: 'Favoritável' });
    pendente = await ctx.banco.criarCasa({ slug: 'fav-pendente', nome: 'Pendente', status: 'pendente' });
  });

  it('ciclo de favoritos é do próprio usuário', async () => {
    const a = await ctx.logado();
    const b = await ctx.logado();
    const repoA = new FavoritosRepository(a.cliente.api);
    await repoA.adicionar(a.usuario.id, casa);
    await repoA.adicionar(a.usuario.id, casa); // idempotente
    expect(await repoA.idsDe(a.usuario.id)).toEqual([casa]);
    // B não vê os favoritos de A, mesmo passando o id de A
    expect(await new FavoritosRepository(b.cliente.api).idsDe(a.usuario.id)).toEqual([]);
    await repoA.remover(a.usuario.id, casa);
    expect(await repoA.idsDe(a.usuario.id)).toEqual([]);
  });

  it('não favorita casa pendente', async () => {
    const { cliente, usuario } = await ctx.logado();
    await expect(new FavoritosRepository(cliente.api).adicionar(usuario.id, pendente)).rejects.toMatchObject({ status: 404 });
  });

  it('anônimo não enxerga favoritos', async () => {
    await expect(new FavoritosRepository(ctx.anonimo().api).idsDe('x')).rejects.toMatchObject({ status: 401 });
  });

  it('indicação nasce pendente e cada um vê só as suas; admin vê todas', async () => {
    const a = await ctx.logado();
    const b = await ctx.logado();
    const criada = await new IndicacoesRepository(a.cliente.api).criarComoVisitante(a.usuario.id, {
      nome: 'Terreiro do Vale',
      cidade: 'Itajaí',
      estado: 'SC',
      canal_contato: '@vale',
    });
    expect(criada.estaPendente()).toBe(true);
    expect((await new IndicacoesRepository(a.cliente.api).listMinhas()).map((i) => i.id)).toEqual([criada.id]);
    expect(await new IndicacoesRepository(b.cliente.api).listMinhas()).toEqual([]);

    const admin = await ctx.logado('admin');
    const fila = await new ModeracaoRepository(admin.cliente.api).fila();
    expect(fila.indicacoes.map((i) => i.id)).toContain(criada.id);
    expect(fila.indicacoes.find((i) => i.id === criada.id)?.userId).toBe(a.usuario.id);
  });

  it('anônimo não indica; não-admin não lê a fila', async () => {
    await expect(new IndicacoesRepository(ctx.anonimo().api).listMinhas()).rejects.toBeInstanceOf(ApiError);
    const { cliente } = await ctx.logado('dirigente');
    await expect(new ModeracaoRepository(cliente.api).fila()).rejects.toMatchObject({ status: 403 });
  });
});
