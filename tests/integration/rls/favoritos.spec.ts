import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';

const PREFIX = 'rls-favoritos+';

describe('RLS · favoritos', () => {
  const harness = new SupabaseTestHarness();
  let userAId = '';
  let userBId = '';
  let casaId = '';

  beforeAll(async () => {
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
    const a = await harness.criarUsuario({ email: `${PREFIX}a@test.local`, senha: 'senhaforte' });
    userAId = a.id;
    const b = await harness.criarUsuario({ email: `${PREFIX}b@test.local`, senha: 'senhaforte' });
    userBId = b.id;

    await harness.admin.from('casas').delete().like('nome', '%[FAV]%');
    const { data, error } = await harness.admin
      .from('casas')
      .insert({
        slug: `rls-fav-${Date.now()}`,
        nome: 'Casa Favoritável [FAV]',
        tradicao_principal: 'umbanda',
        status: 'aprovada',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    if (error) throw error;
    casaId = data.id;
  });

  afterAll(async () => {
    await harness.admin.from('favoritos').delete().in('user_id', [userAId, userBId]);
    await harness.admin.from('casas').delete().eq('id', casaId);
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
  });

  it('usuário cria seu próprio favorito', async () => {
    const cliA = await harness.authedClientFor(`${PREFIX}a@test.local`, 'senhaforte');
    const { error } = await cliA
      .from('favoritos')
      .insert({ user_id: userAId, casa_id: casaId });
    expect(error).toBeNull();
  });

  it('usuário NÃO cria favorito em nome de outro', async () => {
    const cliA = await harness.authedClientFor(`${PREFIX}a@test.local`, 'senhaforte');
    const { error } = await cliA
      .from('favoritos')
      .insert({ user_id: userBId, casa_id: casaId });
    expect(error).not.toBeNull();
  });

  it('usuário só lê seus próprios favoritos', async () => {
    const cliA = await harness.authedClientFor(`${PREFIX}a@test.local`, 'senhaforte');
    const cliB = await harness.authedClientFor(`${PREFIX}b@test.local`, 'senhaforte');

    const { data: dosA } = await cliA.from('favoritos').select('user_id').eq('casa_id', casaId);
    expect(dosA?.every((f) => f.user_id === userAId)).toBe(true);

    const { data: dosB } = await cliB.from('favoritos').select('user_id').eq('casa_id', casaId);
    expect(dosB ?? []).toHaveLength(0);
  });

  it('anônimo não enxerga favoritos', async () => {
    const anon = harness.anon();
    const { data } = await anon.from('favoritos').select('user_id').limit(1);
    expect(data ?? []).toHaveLength(0);
  });
});
