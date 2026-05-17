import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';
import { SeedItajai } from '../../setup/SeedItajai';
import { CasasRepository } from '@/features/casas/api/CasasRepository';
import { FiltrosBusca } from '@/features/busca/domain/FiltrosBusca';
import { Casa } from '@/features/casas/domain/Casa';

describe('CasasRepository (integração)', () => {
  const harness = new SupabaseTestHarness();
  const seed = new SeedItajai(harness.admin);
  let ids: Awaited<ReturnType<typeof seed.popularCasas>>;
  const repoAnon = new CasasRepository(harness.anon());

  beforeAll(async () => {
    ids = await seed.popularCasas();
  });

  afterAll(async () => {
    await seed.limpar();
  });

  it('listAprovadas retorna instâncias Casa (sem rows cruas)', async () => {
    const f = FiltrosBusca.vazio();
    const casas = await repoAnon.listAprovadas(f);
    expect(casas.length).toBeGreaterThanOrEqual(3); // umbanda + candomble + naoVerificada
    expect(casas[0]).toBeInstanceOf(Casa);
  });

  it('RLS esconde casa pendente do anônimo', async () => {
    const casas = await repoAnon.listAprovadas(FiltrosBusca.vazio());
    expect(casas.find((c) => c.id === ids.pendente)).toBeUndefined();
  });

  it('inclui casa indicada já aprovada (mas não verificada) na lista', async () => {
    const casas = await repoAnon.listAprovadas(FiltrosBusca.vazio());
    const indicada = casas.find((c) => c.id === ids.naoVerificada);
    expect(indicada).toBeDefined();
    expect(indicada?.estaVerificada()).toBe(false);
    expect(indicada?.fonte).toBe('indicacao');
  });

  it('filtro por tradição reduz o conjunto', async () => {
    const candomble = await repoAnon.listAprovadas(
      FiltrosBusca.vazio().comTradicao('candomble'),
    );
    expect(candomble.every((c) => c.tradicaoPrincipal === 'candomble')).toBe(true);
    expect(candomble.find((c) => c.id === ids.aprovadaCandomble)).toBeDefined();
    expect(candomble.find((c) => c.id === ids.aprovadaUmbanda)).toBeUndefined();
  });

  it('filtro de cidade=Itajaí mantém o seed', async () => {
    const itajai = await repoAnon.listAprovadas(FiltrosBusca.vazio().comCidade('Itajaí'));
    expect(itajai.find((c) => c.id === ids.aprovadaUmbanda)).toBeDefined();
  });

  it('tags umbanda filtram por overlap (caboclo presente)', async () => {
    const f = FiltrosBusca.vazio().comTradicao('umbanda').comTagAlternada('caboclo');
    const casas = await repoAnon.listAprovadas(f);
    expect(casas.find((c) => c.id === ids.aprovadaUmbanda)).toBeDefined();
    expect(casas.find((c) => c.id === ids.naoVerificada)).toBeUndefined();
  });

  it('tag inexistente devolve vazio', async () => {
    const f = FiltrosBusca.vazio().comTradicao('umbanda').comTagAlternada('inexistente');
    const casas = await repoAnon.listAprovadas(f);
    expect(casas).toEqual([]);
  });

  describe('findBySlug', () => {
    it('retorna Casa aprovada pelo slug', async () => {
      const c = await repoAnon.findBySlug('seed-tenda-pai-joao');
      expect(c).toBeInstanceOf(Casa);
      expect(c?.nome).toContain('Tenda Pai João');
    });

    it('retorna null pra slug que não existe', async () => {
      expect(await repoAnon.findBySlug('nao-existe')).toBeNull();
    });

    it('retorna null pra slug de casa pendente (RLS)', async () => {
      expect(await repoAnon.findBySlug('seed-casa-pendente')).toBeNull();
    });
  });

  it('endereço público só aparece quando visibilidade=publico', async () => {
    const c = await repoAnon.findBySlug('seed-tenda-pai-joao');
    expect(c?.enderecoPublico()).not.toBeNull();

    const c2 = await repoAnon.findBySlug('seed-ile-asa-de-oxossi');
    expect(c2?.enderecoPublico()).toBeNull();
  });
});
