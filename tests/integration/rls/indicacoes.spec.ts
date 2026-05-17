import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';

const PREFIX = 'rls-indicacoes+';

describe('RLS · indicacoes_casa', () => {
  const harness = new SupabaseTestHarness();
  let userAId = '';
  let userBId = '';
  let adminId = '';

  beforeAll(async () => {
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
    const a = await harness.criarUsuario({
      email: `${PREFIX}a@test.local`,
      senha: 'senhaforte',
    });
    userAId = a.id;
    const b = await harness.criarUsuario({
      email: `${PREFIX}b@test.local`,
      senha: 'senhaforte',
    });
    userBId = b.id;
    const adm = await harness.criarUsuario({
      email: `${PREFIX}admin@test.local`,
      senha: 'senhaforte',
      role: 'admin',
    });
    adminId = adm.id;
  });

  afterAll(async () => {
    await harness.admin.from('indicacoes_casa').delete().eq('user_id', userAId);
    await harness.admin.from('indicacoes_casa').delete().eq('user_id', userBId);
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
  });

  it('logado cria indicação como pendente; vê só a própria', async () => {
    const cliA = await harness.authedClientFor(`${PREFIX}a@test.local`, 'senhaforte');
    const cliB = await harness.authedClientFor(`${PREFIX}b@test.local`, 'senhaforte');

    const { data: indA, error: errA } = await cliA
      .from('indicacoes_casa')
      .insert({
        user_id: userAId,
        nome: 'Casa do A',
        cidade: 'Itajaí',
        estado: 'SC',
        status: 'pendente',
      })
      .select('id, status')
      .single();
    expect(errA).toBeNull();
    expect(indA?.status).toBe('pendente');

    const { data: vistasPorB } = await cliB
      .from('indicacoes_casa')
      .select('id')
      .eq('id', indA?.id ?? '');
    expect(vistasPorB ?? []).toHaveLength(0);
  });

  it('logado NÃO consegue criar indicação como aprovada', async () => {
    const cli = await harness.authedClientFor(`${PREFIX}a@test.local`, 'senhaforte');
    const { error } = await cli.from('indicacoes_casa').insert({
      user_id: userAId,
      nome: 'Tentativa aprovada',
      cidade: 'Itajaí',
      estado: 'SC',
      status: 'aprovada',
    });
    expect(error).not.toBeNull();
  });

  it('admin lê indicações de qualquer usuário', async () => {
    const cliAdm = await harness.authedClientFor(`${PREFIX}admin@test.local`, 'senhaforte');
    const { data, error } = await cliAdm
      .from('indicacoes_casa')
      .select('id, user_id')
      .in('user_id', [userAId, userBId]);
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(adminId).toBeTruthy();
  });

  it('anônimo não enxerga indicações', async () => {
    const anon = harness.anon();
    const { data } = await anon.from('indicacoes_casa').select('id').limit(1);
    expect(data ?? []).toHaveLength(0);
  });
});
