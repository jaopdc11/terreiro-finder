import { describe, expect, it } from 'vitest';
import { CasasRepository } from '@/features/casas/api/CasasRepository';
import { CasasPainelRepository } from '@/features/casas/api/CasasPainelRepository';
import { CasaUmbandaRepository } from '@/features/casas/api/CasaUmbandaRepository';
import { CasaCandombleRepository } from '@/features/casas/api/CasaCandombleRepository';
import { CasaFotosRepository } from '@/features/casas/api/CasaFotosRepository';
import { AgendaRepository } from '@/features/agenda/api/AgendaRepository';
import { FavoritosRepository } from '@/features/favoritos/api/FavoritosRepository';
import { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';
import { ReivindicacoesRepository } from '@/features/painel/api/ReivindicacoesRepository';
import { ModeracaoRepository } from '@/features/moderacao/api/ModeracaoRepository';
import { FiltrosBusca } from '@/features/busca/domain/FiltrosBusca';
import { PerfilAbertura } from '@/features/casas/domain/PerfilAbertura';
import { CASA_ID, apiFalsa, casaApi, erro, ok } from './fetchFalso';

const UID = '277e18be-6598-4249-946a-fcf23f6a400f';

describe('CasasRepository', () => {
  it('lista aprovadas mandando os filtros como query', async () => {
    const { api, chamadas } = apiFalsa({ 'GET /casas': ok([casaApi()]) });
    const casas = await new CasasRepository(api).listAprovadas(
      FiltrosBusca.parse({ tradicao: 'umbanda', tags: ['Caboclos', 'Exu'] }),
    );
    expect(chamadas[0]?.url).toBe('/casas?tradicao=umbanda&tags=Caboclos%2CExu');
    expect(casas[0]?.nome).toBe('Tenda Pai Joaquim');
    expect(casas[0]?.estaVerificada()).toBe(true);
  });

  it('casa pública sem status vira aprovada; localização aproximada chega na entidade', async () => {
    const { api } = apiFalsa({ 'GET /casas/slug/tenda-pai-joaquim': ok(casaApi()) });
    const c = await new CasasRepository(api).findBySlug('tenda-pai-joaquim');
    expect(c?.status).toBe('aprovada');
    expect(c?.localizacaoAproximada).toBe(true);
    expect(c?.coordenadas?.lat).toBe(-26.91);
    expect(c?.enderecoPublico()).toBeNull();
  });

  it('404 vira null', async () => {
    const { api } = apiFalsa({ 'GET /casas/slug/nao-existe': erro(404, 'CASA_NAO_ENCONTRADA') });
    await expect(new CasasRepository(api).findBySlug('nao-existe')).resolves.toBeNull();
  });

  it('outros erros propagam', async () => {
    const { api } = apiFalsa({ 'GET /casas/slug/x': erro(500, 'ERRO_INTERNO') });
    await expect(new CasasRepository(api).findBySlug('x')).rejects.toMatchObject({ codigo: 'ERRO_INTERNO' });
  });

  it('cadastro direto manda o shape aninhado da API e devolve o id', async () => {
    const { api, chamadas } = apiFalsa({ 'POST /casas': ok(casaApi({ status: 'pendente' })) });
    const id = await new CasasRepository(api).criarComoDirigencia({
      nome: 'Tenda',
      sacerdote_nome: null,
      tradicao_principal: 'umbanda',
      descricao: null,
      texto_antes_visita: null,
      logradouro: 'Rua A',
      numero: '1',
      complemento: null,
      bairro: 'Centro',
      cidade: 'Itajaí',
      estado: 'SC',
      cep: null,
      coord_lat: -26.9,
      coord_lng: -48.6,
      status: 'pendente',
      fonte: 'proprio',
      endereco_visibilidade: 'publico',
      aceita_visitantes: 'aberto',
      foto_registro: 'parcial',
      whatsapp: '47999999999',
      telefone: null,
      email_contato: null,
      site: null,
      canal_validacao: '@tenda',
      papel_dirigencia_proposto: 'Mãe de Santo',
    });
    expect(id).toBe(CASA_ID);
    expect(chamadas[0]?.corpo).toMatchObject({
      nome: 'Tenda',
      tradicaoPrincipal: 'umbanda',
      endereco: { cidade: 'Itajaí', coordLat: -26.9 },
      perfil: { whatsapp: '47999999999' },
      abertura: { enderecoVisibilidade: 'publico' },
      canalValidacao: '@tenda',
      papelDirigenciaProposto: 'Mãe de Santo',
    });
  });

  it('resposta fora do contrato é recusada no boundary', async () => {
    const { api } = apiFalsa({ 'GET /casas': ok([{ id: 'x' }]) });
    await expect(new CasasRepository(api).listAprovadas(FiltrosBusca.parse({}))).rejects.toThrow();
  });
});

describe('CasasPainelRepository', () => {
  it('minhas casas usa o cookie (sem userId na URL) e gestor recebe status', async () => {
    const { api, chamadas } = apiFalsa({ 'GET /minhas-casas': ok([casaApi({ status: 'pendente' })]) });
    const casas = await new CasasPainelRepository(api).minhasCasas();
    expect(chamadas[0]?.url).toBe('/minhas-casas');
    expect(casas[0]?.status).toBe('pendente');
  });

  it('edita perfil, endereço e abertura com PUT', async () => {
    const { api, chamadas } = apiFalsa({
      [`PUT /casas/${CASA_ID}/perfil`]: ok(casaApi()),
      [`PUT /casas/${CASA_ID}/endereco`]: ok(casaApi()),
      [`PUT /casas/${CASA_ID}/abertura`]: ok(casaApi()),
    });
    const repo = new CasasPainelRepository(api);
    await repo.atualizarAbertura(
      CASA_ID,
      PerfilAbertura.parse({ enderecoVisibilidade: 'oculto', aceitaVisitantes: 'aberto', fotoRegistro: 'proibido' }),
    );
    expect(chamadas[0]).toMatchObject({
      metodo: 'PUT',
      corpo: { enderecoVisibilidade: 'oculto', aceitaVisitantes: 'aberto', fotoRegistro: 'proibido' },
    });
  });
});

describe('blocos', () => {
  it('umbanda: lê o bloco da tradição e converte nomes', async () => {
    const { api } = apiFalsa({
      [`GET /casas/${CASA_ID}/bloco`]: ok({
        tradicao: 'umbanda',
        dados: { sincretismo: 'parcial', influenciaKardecista: null, sacralizacao: null, linhagem: ['Zélio'], linhasTrabalhadas: ['Caboclos'] },
      }),
    });
    const b = await new CasaUmbandaRepository(api).buscar(CASA_ID);
    expect(b?.sincretismo).toBe('parcial');
    expect(b?.linhasTrabalhadas).toEqual(['Caboclos']);
  });

  it('bloco de outra tradição (ou ausente) vira null', async () => {
    const { api } = apiFalsa({ [`GET /casas/${CASA_ID}/bloco`]: ok(null) });
    await expect(new CasaCandombleRepository(api).buscar(CASA_ID)).resolves.toBeNull();
  });

  it('salvar manda tradição + dados', async () => {
    const { api, chamadas } = apiFalsa({ [`PUT /casas/${CASA_ID}/bloco`]: ok(null) });
    await new CasaCandombleRepository(api).upsert(CASA_ID, {
      nacao: 'ketu',
      raizLinhagem: null,
      orixaDaCasa: 'Oxóssi',
      linguaRitual: null,
    });
    expect(chamadas[0]?.corpo).toEqual({
      tradicao: 'candomble',
      dados: { nacao: 'ketu', raizLinhagem: null, orixaDaCasa: 'Oxóssi', linguaRitual: null },
    });
  });
});

describe('CasaFotosRepository', () => {
  const foto = { id: '5fe12614-7818-4d05-bf74-cd9eefd7e6b1', casaId: CASA_ID, url: 'https://api.teste/fotos/a.webp', ordem: 0 };

  it('lista, envia em multipart e remove por id', async () => {
    const { api, chamadas } = apiFalsa({
      [`GET /casas/${CASA_ID}/fotos`]: ok([foto]),
      [`POST /casas/${CASA_ID}/fotos`]: ok(foto),
      [`DELETE /fotos/${foto.id}`]: ok(null),
    });
    const repo = new CasaFotosRepository(api);
    expect(await repo.contar(CASA_ID)).toBe(1);
    await repo.adicionar({ casaId: CASA_ID, blob: new Blob(['x']), contentType: 'image/jpeg', nomeOriginal: 'a.jpg' });
    await repo.remover(foto);
    expect(chamadas.map((c) => c.metodo)).toEqual(['GET', 'POST', 'DELETE']);
  });

  it('limite da API chega como erro com código', async () => {
    const { api } = apiFalsa({ [`POST /casas/${CASA_ID}/fotos`]: erro(409, 'LIMITE_DE_FOTOS') });
    await expect(
      new CasaFotosRepository(api).adicionar({ casaId: CASA_ID, blob: new Blob(['x']), contentType: 'image/jpeg', nomeOriginal: 'a.jpg' }),
    ).rejects.toMatchObject({ codigo: 'LIMITE_DE_FOTOS' });
  });
});

describe('AgendaRepository', () => {
  const ev = (m: Record<string, unknown>) => ({
    id: crypto.randomUUID(),
    casaId: CASA_ID,
    tipo: 'gira',
    titulo: 'Gira',
    diaSemana: 1,
    semanasDoMes: null,
    data: null,
    dataTexto: null,
    horarioInicio: '20:00',
    horarioFim: null,
    descricao: null,
    ...m,
  });

  it('ordena giras antes de eventos', async () => {
    const { api } = apiFalsa({
      [`GET /casas/${CASA_ID}/agenda`]: ok([
        ev({ tipo: 'evento', diaSemana: null, data: '2027-01-01', titulo: 'Festa' }),
        ev({ diaSemana: 3, titulo: 'Quarta' }),
        ev({ diaSemana: 1, titulo: 'Segunda' }),
      ]),
    });
    const lista = await new AgendaRepository(api).listarDaCasa(CASA_ID);
    expect(lista.map((e) => e.titulo)).toEqual(['Segunda', 'Quarta', 'Festa']);
  });

  it('cria com camelCase e semanas vazias viram null', async () => {
    const { api, chamadas } = apiFalsa({ [`POST /casas/${CASA_ID}/agenda`]: ok(ev({})) });
    await new AgendaRepository(api).criar(CASA_ID, {
      tipo: 'gira',
      titulo: 'Gira',
      diaSemana: 1,
      semanasDoMes: [],
      data: null,
      dataTexto: null,
      horarioInicio: '20:00',
      horarioFim: null,
      descricao: null,
    });
    expect(chamadas[0]?.corpo).toMatchObject({ diaSemana: 1, semanasDoMes: null, horarioInicio: '20:00' });
  });
});

describe('FavoritosRepository', () => {
  it('ids vêm da lista de casas; adicionar é PUT, remover é DELETE', async () => {
    const { api, chamadas } = apiFalsa({
      'GET /favoritos': ok([casaApi()]),
      [`PUT /favoritos/${CASA_ID}`]: ok(null),
      [`DELETE /favoritos/${CASA_ID}`]: ok(null),
    });
    const repo = new FavoritosRepository(api);
    expect(await repo.idsDe(UID)).toEqual([CASA_ID]);
    await repo.adicionar(UID, CASA_ID);
    await repo.remover(UID, CASA_ID);
    expect(chamadas.map((c) => `${c.metodo} ${c.url}`)).toEqual([
      'GET /favoritos',
      `PUT /favoritos/${CASA_ID}`,
      `DELETE /favoritos/${CASA_ID}`,
    ]);
  });
});

describe('indicações e reivindicações', () => {
  const indicacao = {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    nome: 'Ilê',
    bairro: null,
    cidade: 'Itajaí',
    estado: 'SC',
    tradicaoPrincipal: 'candomble',
    observacoes: null,
    canalContato: '@ile',
    status: 'pendente',
    casaId: null,
    moderadoEm: null,
    motivoRecusa: null,
    criadaEm: '2026-11-09T12:00:00.000Z',
  };

  it('indicação sem autor no payload (visão do próprio autor) é aceita', async () => {
    const { api, chamadas } = apiFalsa({ 'POST /indicacoes': ok(indicacao), 'GET /indicacoes/minhas': ok([indicacao]) });
    const repo = new IndicacoesRepository(api);
    const i = await repo.criarComoVisitante(UID, {
      nome: 'Ilê',
      cidade: 'Itajaí',
      estado: 'SC',
      canal_contato: '@ile',
      tradicao_principal: 'candomble',
    });
    expect(i.userId).toBeNull();
    expect(chamadas[0]?.corpo).toMatchObject({ canalContato: '@ile', tradicaoPrincipal: 'candomble', bairro: null });
    expect((await repo.listMinhas())[0]?.estaPendente()).toBe(true);
  });

  it('reivindicação vai pra rota da casa', async () => {
    const r = {
      id: 'da0fe1fe-0e0f-4834-aeeb-8299fee044d2',
      casaId: CASA_ID,
      observacoes: 'sou filho da casa há 10 anos',
      status: 'pendente',
      moderadoEm: null,
      motivoRecusa: null,
      criadaEm: '2026-11-09T12:00:00.000Z',
    };
    const { api, chamadas } = apiFalsa({ [`POST /casas/${CASA_ID}/reivindicacoes`]: ok(r) });
    const criada = await new ReivindicacoesRepository(api).criarComoVisitante(UID, {
      casa_id: CASA_ID,
      observacoes: r.observacoes,
    });
    expect(criada.casaId).toBe(CASA_ID);
    expect(chamadas[0]?.corpo).toEqual({ observacoes: r.observacoes });
  });
});

describe('ModeracaoRepository', () => {
  it('converte a fila pro formato da tela de admin', async () => {
    const { api } = apiFalsa({
      'GET /moderacao/': ok({
        indicacoes: [],
        aguardandoConsentimento: [casaApi({ status: 'pendente', fonte: 'indicacao' })],
        cadastrosDiretos: [
          {
            ...casaApi({ status: 'pendente', canalValidacao: '@tenda', criadaPor: UID, criadaEm: '2026-11-09T00:00:00Z' }),
            criador: { id: UID, nomeExibicao: 'Mãe Teste', nomeCompleto: null, email: 'm@t.dev' },
          },
        ],
        reivindicacoes: [
          {
            id: 'da0fe1fe-0e0f-4834-aeeb-8299fee044d2',
            userId: UID,
            casaId: CASA_ID,
            observacoes: null,
            status: 'pendente',
            moderadoPor: null,
            moderadoEm: null,
            motivoRecusa: null,
            criadaEm: '2026-11-09T00:00:00Z',
            casa: casaApi(),
            autor: null,
          },
        ],
      }),
    });
    const f = await new ModeracaoRepository(api).fila();
    expect(f.aguardandoConsentimento[0]).toMatchObject({ tradicao_principal: 'umbanda', cidade: 'Itajaí' });
    expect(f.cadastrosDiretos[0]).toMatchObject({ canal_validacao: '@tenda', criador: { nome_exibicao: 'Mãe Teste' } });
    expect(f.reivindicacoes[0]?.casa).toMatchObject({ whatsapp: '47999999999', email_contato: null });
  });

  it('ações chamam os endpoints certos', async () => {
    const id = 'da0fe1fe-0e0f-4834-aeeb-8299fee044d2';
    const { api, chamadas } = apiFalsa({
      [`POST /moderacao/indicacoes/${id}/aprovar`]: ok({ casaId: CASA_ID }),
      [`POST /moderacao/indicacoes/${id}/recusar`]: ok(null),
      [`POST /moderacao/casas/${CASA_ID}/consentimento`]: ok(null),
      [`POST /moderacao/casas/${CASA_ID}/aprovar`]: ok(null),
      [`POST /moderacao/casas/${CASA_ID}/recusar`]: ok(null),
      [`POST /moderacao/reivindicacoes/${id}/aprovar`]: ok(null),
      [`POST /moderacao/reivindicacoes/${id}/recusar`]: ok(null),
    });
    const m = new ModeracaoRepository(api);
    await expect(m.aprovarIndicacao(id)).resolves.toEqual({ casaId: CASA_ID });
    await m.recusarIndicacao(id, 'duplicada');
    await m.confirmarConsentimento(CASA_ID);
    await m.aprovarCadastroDireto(CASA_ID);
    await m.recusarCadastroDireto(CASA_ID, null);
    await m.aprovarReivindicacao(id);
    await m.recusarReivindicacao(id, 'sem contato');
    expect(chamadas).toHaveLength(7);
    expect(chamadas[1]?.corpo).toEqual({ motivo: 'duplicada' });
    expect(chamadas[4]?.corpo).toEqual({ motivo: null });
  });
});
