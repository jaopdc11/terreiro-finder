import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';
import { FavoritosRepository } from '@/features/favoritos/api/FavoritosRepository';

const PREFIX = 'fav-repo+';

describe('FavoritosRepository (integração)', () => {
  const harness = new SupabaseTestHarness();
  let userId = '';
  let casaA = '';
  let casaB = '';

  beforeAll(async () => {
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
    const u = await harness.criarUsuario({
      email: `${PREFIX}user@test.local`,
      senha: 'senhaforte',
    });
    userId = u.id;

    await harness.admin.from('casas').delete().like('nome', '%[FAV-REPO]%');
    const { data: a } = await harness.admin
      .from('casas')
      .insert({
        slug: `fav-repo-a-${Date.now()}`,
        nome: 'Casa A [FAV-REPO]',
        tradicao_principal: 'umbanda',
        status: 'aprovada',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    casaA = a!.id;
    const { data: b } = await harness.admin
      .from('casas')
      .insert({
        slug: `fav-repo-b-${Date.now()}`,
        nome: 'Casa B [FAV-REPO]',
        tradicao_principal: 'candomble',
        status: 'aprovada',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    casaB = b!.id;
  });

  afterAll(async () => {
    await harness.admin.from('favoritos').delete().eq('user_id', userId);
    await harness.admin.from('casas').delete().in('id', [casaA, casaB]);
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
  });

  beforeEach(async () => {
    await harness.admin.from('favoritos').delete().eq('user_id', userId);
  });

  it('adicionar + idsDe + remover ciclo completo', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}user@test.local`,
      'senhaforte',
    );
    const repo = new FavoritosRepository(cli);

    expect(await repo.idsDe(userId)).toEqual([]);

    await repo.adicionar(userId, casaA);
    await repo.adicionar(userId, casaB);
    const ids = await repo.idsDe(userId);
    expect(ids).toEqual(expect.arrayContaining([casaA, casaB]));
    expect(ids).toHaveLength(2);

    // idempotente: adicionar duas vezes não duplica
    await repo.adicionar(userId, casaA);
    expect(await repo.idsDe(userId)).toHaveLength(2);

    await repo.remover(userId, casaA);
    expect(await repo.idsDe(userId)).toEqual([casaB]);
  });
});
