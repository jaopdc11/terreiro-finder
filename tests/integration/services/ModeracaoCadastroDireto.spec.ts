import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';
import {
  CasasRepository,
  type NovaCasaDeDirigencia,
} from '@/features/casas/api/CasasRepository';
import { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';
import { ReivindicacoesRepository } from '@/features/painel/api/ReivindicacoesRepository';
import { ModeracaoService } from '@/features/moderacao/api/ModeracaoService';
import { FiltrosBusca } from '@/features/busca/domain/FiltrosBusca';

const PREFIX = 'mod-cad+';

function payloadBase(nome: string): NovaCasaDeDirigencia {
  return {
    nome,
    sacerdote_nome: 'Mãe Tester',
    tradicao_principal: 'umbanda',
    descricao: 'Casa criada pelo spec de cadastro direto.',
    texto_antes_visita: null,
    logradouro: 'Rua Teste',
    numero: '100',
    complemento: null,
    bairro: 'Centro',
    cidade: 'Itajaí',
    estado: 'SC',
    cep: null,
    coord_lat: -26.9078,
    coord_lng: -48.6614,
    status: 'pendente',
    fonte: 'proprio',
    endereco_visibilidade: 'publico',
    aceita_visitantes: 'jogo_previo',
    foto_registro: 'parcial',
    whatsapp: '47999000000',
    telefone: null,
    email_contato: null,
  };
}

describe('ModeracaoService · cadastro direto (integração)', () => {
  const harness = new SupabaseTestHarness();
  let adminId = '';
  let dirigenteId = '';
  let outroId = '';
  let svcAdmin: ModeracaoService;

  beforeAll(async () => {
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
    const adm = await harness.criarUsuario({
      email: `${PREFIX}admin@test.local`,
      senha: 'senhaforte',
      role: 'admin',
    });
    adminId = adm.id;
    const dir = await harness.criarUsuario({
      email: `${PREFIX}dirigente@test.local`,
      senha: 'senhaforte',
    });
    dirigenteId = dir.id;
    const out = await harness.criarUsuario({
      email: `${PREFIX}outro@test.local`,
      senha: 'senhaforte',
    });
    outroId = out.id;

    const adminCli = await harness.authedClientFor(
      `${PREFIX}admin@test.local`,
      'senhaforte',
    );
    svcAdmin = new ModeracaoService(
      new IndicacoesRepository(adminCli),
      new CasasRepository(adminCli),
      new ReivindicacoesRepository(adminCli),
    );
  });

  afterAll(async () => {
    await harness.admin.from('casas').delete().like('nome', '%[CAD]%');
    await harness.admin
      .from('casa_dirigentes')
      .delete()
      .in('user_id', [dirigenteId, outroId]);
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
  });

  beforeEach(async () => {
    await harness.admin.from('casas').delete().like('nome', '%[CAD]%');
    await harness.admin
      .from('casa_dirigentes')
      .delete()
      .in('user_id', [dirigenteId, outroId]);
  });

  async function criarComoDirigente(nome: string): Promise<string> {
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    return new CasasRepository(cli).criarComoDirigencia(
      payloadBase(`${nome} [CAD]`),
      dirigenteId,
    );
  }

  it('dirigente cria casa via repository: status=pendente, fonte=proprio, criada_por=user', async () => {
    const casaId = await criarComoDirigente('Casa Direta');
    const { data } = await harness.admin
      .from('casas')
      .select('status, fonte, criada_por, slug')
      .eq('id', casaId)
      .single();
    expect(data?.status).toBe('pendente');
    expect(data?.fonte).toBe('proprio');
    expect(data?.criada_por).toBe(dirigenteId);
    expect(data?.slug).toBe('casa-direta-cad');
  });

  it('anon não vê casa em status pendente', async () => {
    const casaId = await criarComoDirigente('Anon Não Vê');
    const repoAnon = new CasasRepository(harness.anon());
    const lista = await repoAnon.listAprovadas(FiltrosBusca.vazio());
    expect(lista.find((c) => c.id === casaId)).toBeUndefined();
  });

  it('aprovação: vincula criador em casa_dirigentes + casa vira aprovada + estaVerificada=true', async () => {
    const casaId = await criarComoDirigente('Pra Aprovar');
    await svcAdmin.aprovarCadastroDireto(casaId, { userId: adminId });

    const { data: dirigentes } = await harness.admin
      .from('casa_dirigentes')
      .select('user_id, papel')
      .eq('casa_id', casaId);
    expect(dirigentes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ user_id: dirigenteId, papel: 'principal' }),
      ]),
    );

    const { data: casa } = await harness.admin
      .from('casas')
      .select('status, fonte')
      .eq('id', casaId)
      .single();
    expect(casa?.status).toBe('aprovada');
    expect(casa?.fonte).toBe('proprio');

    // estaVerificada via Casa.fromRow
    const adminCli = await harness.authedClientFor(
      `${PREFIX}admin@test.local`,
      'senhaforte',
    );
    const casaDom = await new CasasRepository(adminCli).findById(casaId);
    expect(casaDom?.estaVerificada()).toBe(true);
  });

  it('re-aprovar é rejeitado (não está mais pendente)', async () => {
    const casaId = await criarComoDirigente('Já Aprovada');
    await svcAdmin.aprovarCadastroDireto(casaId, { userId: adminId });
    await expect(
      svcAdmin.aprovarCadastroDireto(casaId, { userId: adminId }),
    ).rejects.toThrow(/não está em cadastro direto pendente/i);
  });

  it('recusar muda status pra recusada sem criar vínculo', async () => {
    const casaId = await criarComoDirigente('Pra Recusar');
    await svcAdmin.recusarCadastroDireto(casaId, { userId: adminId });

    const { data: casa } = await harness.admin
      .from('casas')
      .select('status')
      .eq('id', casaId)
      .single();
    expect(casa?.status).toBe('recusada');

    const { data: dirigentes } = await harness.admin
      .from('casa_dirigentes')
      .select('user_id')
      .eq('casa_id', casaId);
    expect(dirigentes ?? []).toHaveLength(0);
  });

  it('outro usuário (não admin) tenta aprovar → bloqueado pela RLS', async () => {
    const casaId = await criarComoDirigente('Tentativa Não-admin');
    const cliOutro = await harness.authedClientFor(
      `${PREFIX}outro@test.local`,
      'senhaforte',
    );
    const svcOutro = new ModeracaoService(
      new IndicacoesRepository(cliOutro),
      new CasasRepository(cliOutro),
      new ReivindicacoesRepository(cliOutro),
    );
    await expect(
      svcOutro.aprovarCadastroDireto(casaId, { userId: outroId }),
    ).rejects.toThrow();
  });

  it('casa sem criada_por falha com erro de domínio', async () => {
    const { data, error } = await harness.admin
      .from('casas')
      .insert({
        slug: `cad-sem-criador-${Date.now()}`,
        nome: 'Sem Criador [CAD]',
        tradicao_principal: 'umbanda',
        status: 'pendente',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
        criada_por: null,
      })
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error('insert');

    await expect(
      svcAdmin.aprovarCadastroDireto(data.id, { userId: adminId }),
    ).rejects.toThrow(/sem criador/i);
  });
});
