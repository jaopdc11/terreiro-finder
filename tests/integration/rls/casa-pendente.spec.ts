import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';
import { CasasRepository } from '@/features/casas/api/CasasRepository';
import { FiltrosBusca } from '@/features/busca/domain/FiltrosBusca';

const SLUG = 'rls-pendente-secreta';
const NOME = 'Casa Pendente Secreta [RLS-PEND]';

describe('RLS · casa pendente nunca vaza pro anon', () => {
  const harness = new SupabaseTestHarness();
  let casaId = '';

  beforeAll(async () => {
    await harness.admin.from('casas').delete().like('nome', '%[RLS-PEND]%');
    const { data, error } = await harness.admin
      .from('casas')
      .insert({
        slug: SLUG,
        nome: NOME,
        tradicao_principal: 'umbanda',
        status: 'pendente',
        fonte: 'indicacao',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    if (error) throw error;
    casaId = data.id;
  });

  afterAll(async () => {
    await harness.admin.from('casas').delete().like('nome', '%[RLS-PEND]%');
  });

  it('listAprovadas (anon) não inclui casa pendente', async () => {
    const repo = new CasasRepository(harness.anon());
    const casas = await repo.listAprovadas(FiltrosBusca.vazio());
    expect(casas.find((c) => c.id === casaId)).toBeUndefined();
  });

  it('findBySlug (anon) retorna null mesmo conhecendo o slug', async () => {
    const repo = new CasasRepository(harness.anon());
    expect(await repo.findBySlug(SLUG)).toBeNull();
  });

  it('anon que tenta SELECT direto pelo id também não vê', async () => {
    const anon = harness.anon();
    const { data } = await anon.from('casas').select('id, status').eq('id', casaId);
    expect(data ?? []).toHaveLength(0);
  });
});
