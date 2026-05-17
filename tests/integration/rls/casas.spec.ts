import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';
import type { SupabaseClient } from '@supabase/supabase-js';

const PREFIX = 'rls-casas+';

describe('RLS · casas', () => {
  const harness = new SupabaseTestHarness();
  let dirigenteId = '';
  let outroId = '';
  let adminId = '';
  let casaAprovadaId = '';
  let casaPendenteId = '';

  beforeAll(async () => {
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
    // Limpa casas de testes anteriores (sem prefixo distinto — usa marker em nome).
    await harness.admin.from('casas').delete().like('nome', '%[RLS]%');

    const dirigente = await harness.criarUsuario({
      email: `${PREFIX}dirigente@test.local`,
      senha: 'senhaforte',
      role: 'dirigente',
      nome_completo: 'Mãe Dirigente',
    });
    dirigenteId = dirigente.id;

    const outro = await harness.criarUsuario({
      email: `${PREFIX}outro@test.local`,
      senha: 'senhaforte',
      role: 'visitante',
    });
    outroId = outro.id;

    const admin = await harness.criarUsuario({
      email: `${PREFIX}admin@test.local`,
      senha: 'senhaforte',
      role: 'admin',
    });
    adminId = admin.id;
  });

  afterAll(async () => {
    await harness.admin.from('casas').delete().like('nome', '%[RLS]%');
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
  });

  beforeEach(async () => {
    await harness.admin.from('casas').delete().like('nome', '%[RLS]%');

    const { data: aprov, error: e1 } = await harness.admin
      .from('casas')
      .insert({
        slug: 'rls-casa-aprovada',
        nome: 'Casa Aprovada [RLS]',
        tradicao_principal: 'umbanda',
        status: 'aprovada',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    if (e1) throw e1;
    casaAprovadaId = aprov.id;

    const { data: pend, error: e2 } = await harness.admin
      .from('casas')
      .insert({
        slug: 'rls-casa-pendente',
        nome: 'Casa Pendente [RLS]',
        tradicao_principal: 'umbanda',
        status: 'pendente',
        fonte: 'indicacao',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    if (e2) throw e2;
    casaPendenteId = pend.id;

    // Vincula dirigente à casa aprovada.
    await harness.admin
      .from('casa_dirigentes')
      .delete()
      .eq('casa_id', casaAprovadaId);
    const { error: e3 } = await harness.admin.from('casa_dirigentes').insert({
      casa_id: casaAprovadaId,
      user_id: dirigenteId,
      papel: 'principal',
    });
    if (e3) throw e3;
  });

  describe('SELECT anônimo', () => {
    it('enxerga só casas aprovadas', async () => {
      const anon = harness.anon();
      const { data, error } = await anon.from('casas').select('id, status').like('nome', '%[RLS]%');
      expect(error).toBeNull();
      expect(data?.map((c) => c.id)).toContain(casaAprovadaId);
      expect(data?.map((c) => c.id)).not.toContain(casaPendenteId);
    });
  });

  describe('SELECT como dirigente', () => {
    let cli: SupabaseClient;
    beforeAll(async () => {
      cli = await harness.authedClientFor(`${PREFIX}dirigente@test.local`, 'senhaforte');
    });

    it('enxerga sua própria casa em qualquer status', async () => {
      const { data, error } = await cli
        .from('casas')
        .select('id, status')
        .like('nome', '%[RLS]%');
      expect(error).toBeNull();
      // Dirigente vê pelo menos a aprovada (também enxergaria pendente se fosse dele).
      expect(data?.map((c) => c.id)).toContain(casaAprovadaId);
      expect(dirigenteId).toBeTruthy();
    });
  });

  describe('SELECT como admin', () => {
    it('enxerga aprovada + pendente', async () => {
      const cli = await harness.authedClientFor(`${PREFIX}admin@test.local`, 'senhaforte');
      const { data, error } = await cli.from('casas').select('id').like('nome', '%[RLS]%');
      expect(error).toBeNull();
      expect(data?.map((c) => c.id)).toEqual(
        expect.arrayContaining([casaAprovadaId, casaPendenteId]),
      );
      expect(adminId).toBeTruthy();
    });
  });

  describe('INSERT', () => {
    it('logado cria casa como pendente (sem ler de volta — SELECT policy não cobre pendente)', async () => {
      const cli = await harness.authedClientFor(`${PREFIX}outro@test.local`, 'senhaforte');
      const slug = `rls-nova-${Date.now()}`;
      const { error } = await cli.from('casas').insert({
        slug,
        nome: 'Casa Nova [RLS]',
        tradicao_principal: 'umbanda',
        status: 'pendente',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      });
      expect(error).toBeNull();

      // Admin confirma que a row foi mesmo criada.
      const { data } = await harness.admin
        .from('casas')
        .select('id, status, fonte')
        .eq('slug', slug)
        .single();
      expect(data?.status).toBe('pendente');
      expect(data?.fonte).toBe('proprio');
      expect(outroId).toBeTruthy();
    });

    it('logado NÃO consegue criar casa já aprovada', async () => {
      const cli = await harness.authedClientFor(`${PREFIX}outro@test.local`, 'senhaforte');
      const { error } = await cli.from('casas').insert({
        slug: `rls-direta-${Date.now()}`,
        nome: 'Casa Direta [RLS]',
        tradicao_principal: 'umbanda',
        status: 'aprovada',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      });
      expect(error).not.toBeNull();
    });

    it('anônimo não consegue criar casa', async () => {
      const anon = harness.anon();
      const { error } = await anon.from('casas').insert({
        slug: 'anon-fail',
        nome: 'Casa Anônima [RLS]',
        tradicao_principal: 'umbanda',
        status: 'pendente',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      });
      expect(error).not.toBeNull();
    });
  });

  describe('UPDATE', () => {
    it('dirigente atualiza descrição da própria casa', async () => {
      const cli = await harness.authedClientFor(`${PREFIX}dirigente@test.local`, 'senhaforte');
      const { error } = await cli
        .from('casas')
        .update({ descricao: 'editado pela dirigência' })
        .eq('id', casaAprovadaId);
      expect(error).toBeNull();
    });

    it('dirigente NÃO consegue mudar status da casa', async () => {
      const cli = await harness.authedClientFor(`${PREFIX}dirigente@test.local`, 'senhaforte');
      const { error, data } = await cli
        .from('casas')
        .update({ status: 'arquivada' })
        .eq('id', casaAprovadaId)
        .select();
      // Pode retornar erro OU retornar 0 linhas (RLS).
      if (!error) {
        expect(data ?? []).toHaveLength(0);
      } else {
        expect(error).not.toBeNull();
      }
    });

    it('outro usuário não atualiza casa alheia', async () => {
      const cli = await harness.authedClientFor(`${PREFIX}outro@test.local`, 'senhaforte');
      const { data } = await cli
        .from('casas')
        .update({ descricao: 'hack' })
        .eq('id', casaAprovadaId)
        .select();
      expect(data ?? []).toHaveLength(0);
    });
  });
});
