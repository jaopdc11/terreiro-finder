import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';
import { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';
import { CasasRepository } from '@/features/casas/api/CasasRepository';
import { ReivindicacoesRepository } from '@/features/painel/api/ReivindicacoesRepository';
import { ModeracaoService } from '@/features/moderacao/api/ModeracaoService';

const PREFIX = 'mod-rei+';

describe('ModeracaoService · reivindicação (integração)', () => {
  const harness = new SupabaseTestHarness();
  let adminId = '';
  let solicitanteId = '';
  let outroId = '';
  let svcAdmin: ModeracaoService;
  let casasAdmin: CasasRepository;

  beforeAll(async () => {
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
    const admin = await harness.criarUsuario({
      email: `${PREFIX}admin@test.local`,
      senha: 'senhaforte',
      role: 'admin',
    });
    adminId = admin.id;
    const sol = await harness.criarUsuario({
      email: `${PREFIX}solicitante@test.local`,
      senha: 'senhaforte',
    });
    solicitanteId = sol.id;
    const outro = await harness.criarUsuario({
      email: `${PREFIX}outro@test.local`,
      senha: 'senhaforte',
    });
    outroId = outro.id;

    const adminCli = await harness.authedClientFor(
      `${PREFIX}admin@test.local`,
      'senhaforte',
    );
    casasAdmin = new CasasRepository(adminCli);
    svcAdmin = new ModeracaoService(
      new IndicacoesRepository(adminCli),
      casasAdmin,
      new ReivindicacoesRepository(adminCli),
    );
  });

  afterAll(async () => {
    await harness.admin.from('reivindicacoes').delete().in('user_id', [solicitanteId, outroId]);
    await harness.admin.from('casa_dirigentes').delete().in('user_id', [solicitanteId, outroId]);
    await harness.admin.from('casas').delete().like('nome', '%[REI]%');
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
  });

  async function criarCasaNaoVerificada(): Promise<string> {
    const { data, error } = await harness.admin
      .from('casas')
      .insert({
        slug: `rei-casa-${Date.now()}`,
        nome: `Casa Pra Reivindicar [REI]`,
        tradicao_principal: 'umbanda',
        status: 'aprovada',
        fonte: 'indicacao',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    if (error) throw error;
    return data.id as string;
  }

  async function criarReivindicacao(userId: string, casaId: string): Promise<string> {
    const cli = await harness.authedClientFor(
      userId === solicitanteId
        ? `${PREFIX}solicitante@test.local`
        : `${PREFIX}outro@test.local`,
      'senhaforte',
    );
    const r = await new ReivindicacoesRepository(cli).criarComoVisitante(userId, {
      casa_id: casaId,
      observacoes: 'Sou dirigente principal há mais de 5 anos.',
    });
    return r.id;
  }

  beforeEach(async () => {
    await harness.admin.from('reivindicacoes').delete().in('user_id', [solicitanteId, outroId]);
    await harness.admin.from('casa_dirigentes').delete().in('user_id', [solicitanteId, outroId]);
    await harness.admin.from('casas').delete().like('nome', '%[REI]%');
  });

  it('aprovarReivindicacao vincula user em casa_dirigentes + muda fonte pra reivindicada', async () => {
    const casaId = await criarCasaNaoVerificada();
    const reiId = await criarReivindicacao(solicitanteId, casaId);

    await svcAdmin.aprovarReivindicacao(reiId, { userId: adminId });

    // 1) vínculo criado
    const { data: dirigentes } = await harness.admin
      .from('casa_dirigentes')
      .select('user_id, papel')
      .eq('casa_id', casaId);
    expect(dirigentes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ user_id: solicitanteId, papel: 'principal' }),
      ]),
    );

    // 2) fonte mudou; casa agora estaVerificada
    const c = await casasAdmin.findBySlug(
      ((await harness.admin.from('casas').select('slug').eq('id', casaId).single()).data?.slug) ?? '',
    );
    expect(c?.fonte).toBe('reivindicada');
    expect(c?.estaVerificada()).toBe(true);

    // 3) reivindicação aprovada
    const { data: rei } = await harness.admin
      .from('reivindicacoes')
      .select('status, moderado_por')
      .eq('id', reiId)
      .single();
    expect(rei?.status).toBe('aprovada');
    expect(rei?.moderado_por).toBe(adminId);
  });

  it('aprovar reivindicação já moderada falha', async () => {
    const casaId = await criarCasaNaoVerificada();
    const reiId = await criarReivindicacao(solicitanteId, casaId);
    await svcAdmin.aprovarReivindicacao(reiId, { userId: adminId });

    await expect(svcAdmin.aprovarReivindicacao(reiId, { userId: adminId })).rejects.toThrow(
      /já foi moderada/i,
    );
  });

  it('recusarReivindicacao grava motivo e não cria vínculo', async () => {
    const casaId = await criarCasaNaoVerificada();
    const reiId = await criarReivindicacao(solicitanteId, casaId);

    await svcAdmin.recusarReivindicacao(reiId, 'Sinal cruzado contradiz a reivindicação', {
      userId: adminId,
    });

    const { data: rei } = await harness.admin
      .from('reivindicacoes')
      .select('status, motivo_recusa')
      .eq('id', reiId)
      .single();
    expect(rei?.status).toBe('recusada');
    expect(rei?.motivo_recusa).toContain('Sinal cruzado');

    const { data: dirigentes } = await harness.admin
      .from('casa_dirigentes')
      .select('user_id')
      .eq('casa_id', casaId);
    expect(dirigentes ?? []).toHaveLength(0);
  });

  it('outro usuário (não admin) não consegue aprovar', async () => {
    const casaId = await criarCasaNaoVerificada();
    const reiId = await criarReivindicacao(solicitanteId, casaId);

    const cliOutro = await harness.authedClientFor(
      `${PREFIX}outro@test.local`,
      'senhaforte',
    );
    const svcOutro = new ModeracaoService(
      new IndicacoesRepository(cliOutro),
      new CasasRepository(cliOutro),
      new ReivindicacoesRepository(cliOutro),
    );

    await expect(svcOutro.aprovarReivindicacao(reiId, { userId: outroId })).rejects.toThrow();
  });

  it('vincularDirigente é idempotente (re-tentar não duplica)', async () => {
    const casaId = await criarCasaNaoVerificada();
    await casasAdmin.vincularDirigente(casaId, solicitanteId, 'principal');
    await casasAdmin.vincularDirigente(casaId, solicitanteId, 'principal');

    const { data } = await harness.admin
      .from('casa_dirigentes')
      .select('user_id')
      .eq('casa_id', casaId);
    expect(data ?? []).toHaveLength(1);
  });
});
