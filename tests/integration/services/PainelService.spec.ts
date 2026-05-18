import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';
import { CasasPainelRepository } from '@/features/casas/api/CasasPainelRepository';
import { CasaUmbandaRepository } from '@/features/casas/api/CasaUmbandaRepository';
import { CasaCandombleRepository } from '@/features/casas/api/CasaCandombleRepository';
import { CasaQuimbandaRepository } from '@/features/casas/api/CasaQuimbandaRepository';
import { PainelService } from '@/features/painel/api/PainelService';
import { PerfilAbertura } from '@/features/casas/domain/PerfilAbertura';

const PREFIX = 'painel-svc+';

describe('PainelService (integração)', () => {
  const harness = new SupabaseTestHarness();
  let dirigenteId = '';
  let outroId = '';
  let casaUmbandaId = '';
  let casaCandombleId = '';
  let svcDirigente: PainelService;

  beforeAll(async () => {
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
    const d = await harness.criarUsuario({
      email: `${PREFIX}dirigente@test.local`,
      senha: 'senhaforte',
      role: 'dirigente',
    });
    dirigenteId = d.id;
    const o = await harness.criarUsuario({
      email: `${PREFIX}outro@test.local`,
      senha: 'senhaforte',
    });
    outroId = o.id;

    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    svcDirigente = new PainelService(
      new CasasPainelRepository(cli),
      new CasaUmbandaRepository(cli),
      new CasaCandombleRepository(cli),
      new CasaQuimbandaRepository(cli),
    );
  });

  afterAll(async () => {
    await harness.admin
      .from('casa_dirigentes')
      .delete()
      .in('user_id', [dirigenteId, outroId]);
    await harness.admin.from('casas').delete().like('nome', '%[PAINEL]%');
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
  });

  beforeEach(async () => {
    await harness.admin
      .from('casa_dirigentes')
      .delete()
      .in('user_id', [dirigenteId, outroId]);
    await harness.admin.from('casas').delete().like('nome', '%[PAINEL]%');

    const { data: ucasa, error: e1 } = await harness.admin
      .from('casas')
      .insert({
        slug: `painel-umb-${Date.now()}`,
        nome: 'Tenda Umbanda [PAINEL]',
        tradicao_principal: 'umbanda',
        status: 'aprovada',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    if (e1) throw e1;
    casaUmbandaId = ucasa.id;

    const { data: ccasa, error: e2 } = await harness.admin
      .from('casas')
      .insert({
        slug: `painel-can-${Date.now()}-2`,
        nome: 'Ilê Candomblé [PAINEL]',
        tradicao_principal: 'candomble',
        status: 'aprovada',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    if (e2) throw e2;
    casaCandombleId = ccasa.id;

    // Vincula dirigente nas duas casas.
    await harness.admin.from('casa_dirigentes').insert([
      { casa_id: casaUmbandaId, user_id: dirigenteId, papel: 'principal' },
      { casa_id: casaCandombleId, user_id: dirigenteId, papel: 'principal' },
    ]);
  });

  it('minhasCasas retorna apenas casas onde sou dirigente', async () => {
    const casas = await new CasasPainelRepository(
      await harness.authedClientFor(`${PREFIX}dirigente@test.local`, 'senhaforte'),
    ).minhasCasas(dirigenteId);
    expect(casas.map((c) => c.id)).toEqual(
      expect.arrayContaining([casaUmbandaId, casaCandombleId]),
    );

    const semCasas = await new CasasPainelRepository(
      await harness.authedClientFor(`${PREFIX}outro@test.local`, 'senhaforte'),
    ).minhasCasas(outroId);
    expect(semCasas).toEqual([]);
  });

  it('salvarPerfil atualiza campos básicos da casa', async () => {
    await svcDirigente.salvarPerfil(casaUmbandaId, {
      descricao: 'Casa fundada em 1980 pelo Pai Joaquim.',
      sacerdoteNome: 'Pai Joaquim',
      textoAntesVisita: 'Chegue de roupa branca, sem álcool no dia.',
      whatsapp: '47999990001',
      telefone: null,
      emailContato: null,
      site: null,
    });
    const { data } = await harness.admin
      .from('casas')
      .select('descricao, sacerdote_nome, whatsapp')
      .eq('id', casaUmbandaId)
      .single();
    expect(data?.descricao).toContain('1980');
    expect(data?.sacerdote_nome).toBe('Pai Joaquim');
    expect(data?.whatsapp).toBe('47999990001');
  });

  it('salvarAbertura atualiza os 3 toggles', async () => {
    await svcDirigente.salvarAbertura(
      casaUmbandaId,
      PerfilAbertura.padrao()
        .comEnderecoVisibilidade('publico')
        .comAceitaVisitantes('aberto')
        .comFotoRegistro('permitido'),
    );
    const { data } = await harness.admin
      .from('casas')
      .select('endereco_visibilidade, aceita_visitantes, foto_registro')
      .eq('id', casaUmbandaId)
      .single();
    expect(data?.endereco_visibilidade).toBe('publico');
    expect(data?.aceita_visitantes).toBe('aberto');
    expect(data?.foto_registro).toBe('permitido');
  });

  it('salvarEndereco atualiza endereço + coordenadas', async () => {
    await svcDirigente.salvarEndereco(casaUmbandaId, {
      logradouro: 'Rua das Cabaças',
      numero: '42',
      complemento: 'fundos',
      bairro: 'Praia Brava',
      cidade: 'Itajaí',
      estado: 'SC',
      cep: '88306-000',
      coordLat: -26.9078,
      coordLng: -48.6614,
    });
    const { data } = await harness.admin
      .from('casas')
      .select('logradouro, numero, bairro, coord_lat, coord_lng')
      .eq('id', casaUmbandaId)
      .single();
    expect(data?.logradouro).toBe('Rua das Cabaças');
    expect(data?.numero).toBe('42');
    expect(data?.bairro).toBe('Praia Brava');
    expect(data?.coord_lat).toBe(-26.9078);
    expect(data?.coord_lng).toBe(-48.6614);
  });

  it('salvarEndereco rejeita coords parciais', async () => {
    await expect(
      svcDirigente.salvarEndereco(casaUmbandaId, {
        logradouro: null,
        numero: null,
        complemento: null,
        bairro: null,
        cidade: 'Itajaí',
        estado: 'SC',
        cep: null,
        coordLat: -26.9,
        coordLng: null,
      }),
    ).rejects.toThrow(/latitude E longitude/i);
  });

  it('salvarEndereco rejeita cidade vazia', async () => {
    await expect(
      svcDirigente.salvarEndereco(casaUmbandaId, {
        logradouro: null,
        numero: null,
        complemento: null,
        bairro: null,
        cidade: '   ',
        estado: 'SC',
        cep: null,
        coordLat: null,
        coordLng: null,
      }),
    ).rejects.toThrow(/cidade e estado/i);
  });

  it('salvarBlocoUmbanda upserta bloco', async () => {
    await svcDirigente.salvarBlocoUmbanda(casaUmbandaId, {
      sincretismo: 'parcial',
      influenciaKardecista: 'acentuada',
      sacralizacao: 'sim',
      linhagem: ['branca'],
      linhasTrabalhadas: ['caboclo', 'pretovelho'],
    });
    const { data } = await harness.admin
      .from('casa_umbanda')
      .select('sincretismo, linhas_trabalhadas')
      .eq('casa_id', casaUmbandaId)
      .single();
    expect(data?.sincretismo).toBe('parcial');
    expect(data?.linhas_trabalhadas).toEqual(['caboclo', 'pretovelho']);

    // upsert é idempotente — segunda chamada atualiza.
    await svcDirigente.salvarBlocoUmbanda(casaUmbandaId, {
      sincretismo: 'forte',
      influenciaKardecista: 'nenhuma',
      sacralizacao: 'nao',
      linhagem: ['tracada'],
      linhasTrabalhadas: ['exu', 'pombagira'],
    });
    const { data: depois } = await harness.admin
      .from('casa_umbanda')
      .select('sincretismo, linhas_trabalhadas, linhagem')
      .eq('casa_id', casaUmbandaId)
      .single();
    expect(depois?.sincretismo).toBe('forte');
    expect(depois?.linhagem).toEqual(['tracada']);
  });

  it('salvarBlocoUmbanda falha pra casa de tradição diferente', async () => {
    await expect(
      svcDirigente.salvarBlocoUmbanda(casaCandombleId, {
        sincretismo: 'parcial',
        influenciaKardecista: null,
        sacralizacao: null,
        linhagem: [],
        linhasTrabalhadas: [],
      }),
    ).rejects.toThrow(/tradição/i);
  });

  it('salvarBlocoCandomble upserta e idempotente', async () => {
    await svcDirigente.salvarBlocoCandomble(casaCandombleId, {
      nacao: 'ketu',
      raizLinhagem: 'Casa Branca do Engenho Velho',
      orixaDaCasa: 'Oxóssi',
      linguaRitual: 'yorubá',
    });
    const { data } = await harness.admin
      .from('casa_candomble')
      .select('nacao, orixa_da_casa, lingua_ritual')
      .eq('casa_id', casaCandombleId)
      .single();
    expect(data?.nacao).toBe('ketu');
    expect(data?.orixa_da_casa).toBe('Oxóssi');
    expect(data?.lingua_ritual).toBe('yorubá');

    // upsert atualiza
    await svcDirigente.salvarBlocoCandomble(casaCandombleId, {
      nacao: 'jeje',
      raizLinhagem: null,
      orixaDaCasa: null,
      linguaRitual: 'ewe-fon',
    });
    const { data: depois } = await harness.admin
      .from('casa_candomble')
      .select('nacao, lingua_ritual')
      .eq('casa_id', casaCandombleId)
      .single();
    expect(depois?.nacao).toBe('jeje');
    expect(depois?.lingua_ritual).toBe('ewe-fon');
  });

  it('salvarBlocoCandomble falha pra casa de tradição diferente', async () => {
    await expect(
      svcDirigente.salvarBlocoCandomble(casaUmbandaId, {
        nacao: 'ketu',
        raizLinhagem: null,
        orixaDaCasa: null,
        linguaRitual: null,
      }),
    ).rejects.toThrow(/tradição/i);
  });

  it('salvarBlocoQuimbanda upserta com casa de tradição quimbanda', async () => {
    // Cria casa quimbanda específica pra esse teste (beforeEach só cria umbanda + candomble).
    const { data: q } = await harness.admin
      .from('casas')
      .insert({
        slug: `painel-quim-${Date.now()}`,
        nome: 'Templo de Exu Tranca-Ruas [PAINEL]',
        tradicao_principal: 'quimbanda',
        status: 'aprovada',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    const qid = q!.id;
    await harness.admin.from('casa_dirigentes').insert({
      casa_id: qid,
      user_id: dirigenteId,
      papel: 'principal',
    });

    await svcDirigente.salvarBlocoQuimbanda(qid, {
      corrente: 'Quimbanda tradicional',
      raizLinhagem: 'Tata João do Bará',
      abertaANaoIniciados: true,
    });
    const { data } = await harness.admin
      .from('casa_quimbanda')
      .select('corrente, raiz_linhagem, aberta_a_nao_iniciados')
      .eq('casa_id', qid)
      .single();
    expect(data?.corrente).toBe('Quimbanda tradicional');
    expect(data?.raiz_linhagem).toBe('Tata João do Bará');
    expect(data?.aberta_a_nao_iniciados).toBe(true);
  });

  it('dirigente NÃO consegue mudar status/fonte via update direto', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    const { data } = await cli
      .from('casas')
      .update({ status: 'arquivada' })
      .eq('id', casaUmbandaId)
      .select();
    expect(data ?? []).toHaveLength(0);
  });
});
