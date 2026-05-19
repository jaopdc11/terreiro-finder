import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';
import { AgendaRepository } from '@/features/agenda/api/AgendaRepository';
import type { EventoAgendaInput } from '@/features/agenda/domain/EventoAgenda';
import { RepositoryError } from '@/shared/lib/errors';

const PREFIX = 'agenda-repo+';
const TAG = '[AGENDA-REPO]';

const giraInput: EventoAgendaInput = {
  tipo: 'gira',
  titulo: 'Pretos-Velhos',
  diaSemana: 1,
  semanasDoMes: null,
  data: null,
  dataTexto: null,
  horarioInicio: '19:00',
  horarioFim: '22:00',
  descricao: null,
};

const eventoInput: EventoAgendaInput = {
  tipo: 'evento',
  titulo: 'Festa de Iemanjá',
  diaSemana: null,
  semanasDoMes: null,
  data: '2027-02-02',
  dataTexto: null,
  horarioInicio: '08:00',
  horarioFim: null,
  descricao: 'Vir de branco. Levar uma vela.',
};

describe('AgendaRepository (integração)', () => {
  const harness = new SupabaseTestHarness();
  let dirigenteId = '';
  let casaAprovadaId = '';
  let casaPendenteId = '';

  beforeAll(async () => {
    await harness.removerUsuariosPorEmailPrefix(PREFIX);

    const dirigente = await harness.criarUsuario({
      email: `${PREFIX}dirigente@test.local`,
      senha: 'senhaforte',
      role: 'dirigente',
    });
    dirigenteId = dirigente.id;

    await harness.criarUsuario({
      email: `${PREFIX}outro@test.local`,
      senha: 'senhaforte',
      role: 'dirigente',
    });

    await harness.admin.from('casas').delete().like('nome', `%${TAG}%`);

    const { data: a } = await harness.admin
      .from('casas')
      .insert({
        slug: `agenda-aprovada-${Date.now()}`,
        nome: `Casa Aprovada ${TAG}`,
        tradicao_principal: 'umbanda',
        status: 'aprovada',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    casaAprovadaId = a!.id;

    const { data: p } = await harness.admin
      .from('casas')
      .insert({
        slug: `agenda-pendente-${Date.now()}`,
        nome: `Casa Pendente ${TAG}`,
        tradicao_principal: 'umbanda',
        status: 'pendente',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    casaPendenteId = p!.id;

    await harness.admin
      .from('casa_dirigentes')
      .insert({ casa_id: casaAprovadaId, user_id: dirigenteId, papel: 'principal' });
    await harness.admin
      .from('casa_dirigentes')
      .insert({ casa_id: casaPendenteId, user_id: dirigenteId, papel: 'principal' });
  });

  afterAll(async () => {
    await harness.admin
      .from('casa_agenda')
      .delete()
      .in('casa_id', [casaAprovadaId, casaPendenteId]);
    await harness.admin
      .from('casas')
      .delete()
      .in('id', [casaAprovadaId, casaPendenteId]);
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
  });

  beforeEach(async () => {
    await harness.admin
      .from('casa_agenda')
      .delete()
      .in('casa_id', [casaAprovadaId, casaPendenteId]);
  });

  it('dirigente cria, lista, atualiza e exclui evento da própria casa', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    const repo = new AgendaRepository(cli);

    const criado = await repo.criar(casaAprovadaId, giraInput);
    expect(criado.titulo).toBe('Pretos-Velhos');
    expect(criado.ehGira()).toBe(true);

    const lista = await repo.listarDaCasa(casaAprovadaId);
    expect(lista).toHaveLength(1);

    const editado = await repo.atualizar(criado.id, {
      ...giraInput,
      titulo: 'Caboclos',
      diaSemana: 3,
    });
    expect(editado.titulo).toBe('Caboclos');
    expect(editado.diaSemana).toBe(3);

    await repo.excluir(criado.id);
    const vazio = await repo.listarDaCasa(casaAprovadaId);
    expect(vazio).toEqual([]);
  });

  it('aceita gira com semanas_do_mes específicas', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    const repo = new AgendaRepository(cli);

    const caboclo = await repo.criar(casaAprovadaId, {
      ...giraInput,
      titulo: 'Caboclo',
      semanasDoMes: [1],
    });
    expect(caboclo.semanasDoMes).toEqual([1]);
    expect(caboclo.descricaoQuando()).toBe('1ª segunda às 19h');

    const pretoVelho = await repo.criar(casaAprovadaId, {
      ...giraInput,
      titulo: 'Preto Velho',
      semanasDoMes: [3],
    });
    expect(pretoVelho.descricaoQuando()).toBe('3ª segunda às 19h');
  });

  it('aceita evento pontual com data e com data_texto', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    const repo = new AgendaRepository(cli);

    const comData = await repo.criar(casaAprovadaId, eventoInput);
    expect(comData.data).toBe('2027-02-02');
    expect(comData.ehEvento()).toBe(true);

    const semData = await repo.criar(casaAprovadaId, {
      ...eventoInput,
      titulo: 'Saída de iaô',
      data: null,
      dataTexto: 'Fevereiro/2026',
    });
    expect(semData.data).toBeNull();
    expect(semData.dataTexto).toBe('Fevereiro/2026');
  });

  it('anon NÃO lê agenda de casa pendente; lê de casa aprovada', async () => {
    await harness.admin.from('casa_agenda').insert({
      casa_id: casaPendenteId,
      tipo: 'gira',
      titulo: 'Não deve aparecer',
      dia_semana: 1,
    });
    await harness.admin.from('casa_agenda').insert({
      casa_id: casaAprovadaId,
      tipo: 'gira',
      titulo: 'Deve aparecer',
      dia_semana: 1,
    });

    const anon = harness.anon();
    const repoAnon = new AgendaRepository(anon);

    expect(await repoAnon.listarDaCasa(casaPendenteId)).toEqual([]);
    const aprovada = await repoAnon.listarDaCasa(casaAprovadaId);
    expect(aprovada).toHaveLength(1);
    expect(aprovada[0]!.titulo).toBe('Deve aparecer');
  });

  it('outro dirigente NÃO pode criar evento numa casa que não é dele', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}outro@test.local`,
      'senhaforte',
    );
    const repo = new AgendaRepository(cli);

    await expect(repo.criar(casaAprovadaId, giraInput)).rejects.toThrow(RepositoryError);
  });

  it('CHECK do banco rejeita gira sem dia_semana', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    const repo = new AgendaRepository(cli);

    await expect(
      repo.criar(casaAprovadaId, {
        ...giraInput,
        diaSemana: null,
      }),
    ).rejects.toThrow(RepositoryError);
  });

  it('CHECK do banco rejeita evento sem data e sem data_texto', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    const repo = new AgendaRepository(cli);

    await expect(
      repo.criar(casaAprovadaId, {
        ...eventoInput,
        data: null,
        dataTexto: null,
      }),
    ).rejects.toThrow(RepositoryError);
  });
});
