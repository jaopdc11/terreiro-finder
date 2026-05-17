import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';
import { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';
import { CasasRepository } from '@/features/casas/api/CasasRepository';
import { ModeracaoService } from '@/features/moderacao/api/ModeracaoService';
import { FiltrosBusca } from '@/features/busca/domain/FiltrosBusca';

const PREFIX = 'mod-svc+';

describe('ModeracaoService (integração)', () => {
  const harness = new SupabaseTestHarness();
  let adminId = '';
  let visitanteId = '';
  let indicacoesAdmin: IndicacoesRepository;
  let casasAdmin: CasasRepository;
  let svcAdmin: ModeracaoService;
  let repoAnon: CasasRepository;

  beforeAll(async () => {
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
    const admin = await harness.criarUsuario({
      email: `${PREFIX}admin@test.local`,
      senha: 'senhaforte',
      role: 'admin',
    });
    adminId = admin.id;
    const visitante = await harness.criarUsuario({
      email: `${PREFIX}visitante@test.local`,
      senha: 'senhaforte',
    });
    visitanteId = visitante.id;

    const adminCliente = await harness.authedClientFor(`${PREFIX}admin@test.local`, 'senhaforte');
    indicacoesAdmin = new IndicacoesRepository(adminCliente);
    casasAdmin = new CasasRepository(adminCliente);
    svcAdmin = new ModeracaoService(indicacoesAdmin, casasAdmin);
    repoAnon = new CasasRepository(harness.anon());
  });

  afterAll(async () => {
    await harness.admin.from('casas').delete().like('nome', '%[MOD]%');
    await harness.admin.from('indicacoes_casa').delete().in('user_id', [visitanteId]);
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
  });

  beforeEach(async () => {
    await harness.admin.from('casas').delete().like('nome', '%[MOD]%');
    await harness.admin.from('indicacoes_casa').delete().in('user_id', [visitanteId]);
  });

  async function indicar(nome: string, tradicao: 'umbanda' | 'candomble' = 'umbanda'): Promise<string> {
    const cli = await harness.authedClientFor(`${PREFIX}visitante@test.local`, 'senhaforte');
    const repo = new IndicacoesRepository(cli);
    const i = await repo.criarComoVisitante(visitanteId, {
      nome: `${nome} [MOD]`,
      cidade: 'Itajaí',
      estado: 'SC',
      bairro: 'Cordeiros',
      tradicao_principal: tradicao,
      canal_contato: 'Instagram @casa',
    });
    return i.id;
  }

  it('passo 1: aprovarIndicacao cria casa pendente fonte=indicacao, invisível a anon', async () => {
    const indId = await indicar('Casa Pra Aprovar');

    const { casaId } = await svcAdmin.aprovarIndicacao(indId, { userId: adminId });

    // Casa existe (admin vê)
    const { data: row } = await harness.admin
      .from('casas')
      .select('status, fonte, slug')
      .eq('id', casaId)
      .single();
    expect(row?.status).toBe('pendente');
    expect(row?.fonte).toBe('indicacao');
    expect(row?.slug).toBe('casa-pra-aprovar-mod');

    // Anon NÃO vê (RLS: status='aprovada' only)
    const casasAnon = await repoAnon.listAprovadas(FiltrosBusca.vazio());
    expect(casasAnon.find((c) => c.id === casaId)).toBeUndefined();
    expect(await repoAnon.findBySlug(row?.slug ?? '')).toBeNull();

    // Indicação ficou aprovada e vinculada
    const indDepois = await indicacoesAdmin.buscarPorId(indId);
    expect(indDepois?.status).toBe('aprovada');
    expect(indDepois?.casaId).toBe(casaId);
  });

  it('passo 2: confirmarConsentimento torna casa pública como não-verificada', async () => {
    const indId = await indicar('Casa Pra Confirmar');
    const { casaId } = await svcAdmin.aprovarIndicacao(indId, { userId: adminId });

    await svcAdmin.confirmarConsentimento(casaId, { userId: adminId });

    // Anon agora enxerga
    const casas = await repoAnon.listAprovadas(FiltrosBusca.vazio());
    const minha = casas.find((c) => c.id === casaId);
    expect(minha).toBeDefined();
    expect(minha?.estaAprovada()).toBe(true);
    // Mas continua não-verificada (fonte=indicacao)
    expect(minha?.estaVerificada()).toBe(false);
  });

  it('aprovar indicação não-pendente é rejeitado', async () => {
    const indId = await indicar('Já Moderada');
    await svcAdmin.aprovarIndicacao(indId, { userId: adminId });
    await expect(svcAdmin.aprovarIndicacao(indId, { userId: adminId })).rejects.toThrow(/já foi moderada/i);
  });

  it('recusarIndicacao grava motivo e bloqueia aprovar depois', async () => {
    const indId = await indicar('Pra Recusar');
    await svcAdmin.recusarIndicacao(indId, 'Não respondeu', { userId: adminId });

    const depois = await indicacoesAdmin.buscarPorId(indId);
    expect(depois?.status).toBe('recusada');
    expect(depois?.motivoRecusa).toBe('Não respondeu');

    await expect(svcAdmin.aprovarIndicacao(indId, { userId: adminId })).rejects.toThrow();
  });

  it('recusar exige motivo (mínimo 3 chars)', async () => {
    const indId = await indicar('Sem Motivo');
    await expect(svcAdmin.recusarIndicacao(indId, '  ', { userId: adminId })).rejects.toThrow(/motivo/i);
  });

  it('cascata de slug: duas indicações com mesmo nome geram slugs distintos', async () => {
    const ind1 = await indicar('Tenda Igual');
    const { casaId: casa1 } = await svcAdmin.aprovarIndicacao(ind1, { userId: adminId });

    const ind2 = await indicar('Tenda Igual');
    const { casaId: casa2 } = await svcAdmin.aprovarIndicacao(ind2, { userId: adminId });

    const { data: rows } = await harness.admin
      .from('casas')
      .select('id, slug')
      .in('id', [casa1, casa2]);
    const slugs = (rows ?? []).map((r) => r.slug);
    expect(new Set(slugs).size).toBe(2);
    // Cascata: primeira pega "tenda-igual-mod" (kebab do nome); segunda colide
    // e cai pra "tenda-igual-mod-cordeiros" (kebab + bairro).
    expect(slugs).toContain('tenda-igual-mod');
    expect(slugs).toContain('tenda-igual-mod-cordeiros');
  });
});
