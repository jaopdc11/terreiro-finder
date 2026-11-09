import { beforeAll, describe, expect, it } from 'vitest';
import { AgendaRepository } from '@/features/agenda/api/AgendaRepository';
import { CasaFotosRepository, MAX_FOTOS_POR_CASA } from '@/features/casas/api/CasaFotosRepository';
import type { EventoAgendaInput } from '@/features/agenda/domain/EventoAgenda';
import { contextoIntegracao } from '../../setup/contexto';

const gira = (m: Partial<EventoAgendaInput> = {}): EventoAgendaInput => ({
  tipo: 'gira',
  titulo: 'Gira de caboclo',
  diaSemana: 1,
  semanasDoMes: null,
  data: null,
  dataTexto: null,
  horarioInicio: '20:00',
  horarioFim: '23:00',
  descricao: null,
  ...m,
});

// 1x1 PNG válido
const PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01,
  0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);
const foto = (casaId: string) => ({ casaId, blob: new Blob([PNG], { type: 'image/png' }), contentType: 'image/png', nomeOriginal: 'f.png' });

describe('agenda e fotos (integração)', () => {
  const ctx = contextoIntegracao();
  let casa: string;
  let pendente: string;
  let dono: Awaited<ReturnType<typeof ctx.logado>>;

  beforeAll(async () => {
    dono = await ctx.logado('dirigente');
    casa = await ctx.banco.criarCasa({ slug: 'af-casa', nome: 'AF Casa' });
    pendente = await ctx.banco.criarCasa({ slug: 'af-pendente', nome: 'AF Pendente', status: 'pendente' });
    await ctx.banco.vincularDirigente(casa, dono.usuario.id);
    await ctx.banco.vincularDirigente(pendente, dono.usuario.id);
  });

  it('dirigente cria, lista, atualiza e exclui evento', async () => {
    const repo = new AgendaRepository(dono.cliente.api);
    const criado = await repo.criar(casa, gira({ semanasDoMes: [1, 3] }));
    expect(criado.semanasDoMes).toEqual([1, 3]);
    const atualizado = await repo.atualizar(criado.id, gira({ titulo: 'Gira de preto-velho' }));
    expect(atualizado.titulo).toBe('Gira de preto-velho');
    await repo.criar(casa, gira({ tipo: 'evento', diaSemana: null, data: '2027-06-13', titulo: 'Festa de Ogum' }));
    await repo.criar(casa, gira({ tipo: 'evento', diaSemana: null, dataTexto: 'Fevereiro/2027', titulo: 'Festa de Iemanjá' }));
    expect((await repo.listarDaCasa(casa)).map((e) => e.tipo)).toEqual(['gira', 'evento', 'evento']);
    await repo.excluir(criado.id);
    expect(await repo.listarDaCasa(casa)).toHaveLength(2);
  });

  it('anônimo lê agenda de casa aprovada, não de pendente', async () => {
    await new AgendaRepository(dono.cliente.api).criar(pendente, gira());
    const anon = new AgendaRepository(ctx.anonimo().api);
    expect((await anon.listarDaCasa(casa)).length).toBeGreaterThan(0);
    await expect(anon.listarDaCasa(pendente)).rejects.toMatchObject({ status: 404 });
  });

  it('outro usuário não cria evento em casa alheia', async () => {
    const { cliente } = await ctx.logado('dirigente');
    await expect(new AgendaRepository(cliente.api).criar(casa, gira())).rejects.toMatchObject({ status: 403 });
  });

  it('regras de gira/evento chegam como 422 com detalhe do campo', async () => {
    const repo = new AgendaRepository(dono.cliente.api);
    await expect(repo.criar(casa, gira({ diaSemana: null }))).rejects.toMatchObject({ status: 422, detalhes: { diaSemana: expect.any(String) } });
    await expect(repo.criar(casa, gira({ tipo: 'evento', diaSemana: null }))).rejects.toMatchObject({ status: 422 });
  });

  it('fotos: dirigente envia (vira WebP público), anônimo lê, limite e remoção', async () => {
    const repo = new CasaFotosRepository(dono.cliente.api);
    const f = await repo.adicionar(foto(casa));
    expect(f.url).toMatch(/\.webp$/);
    expect((await new CasaFotosRepository(ctx.anonimo().api).listarDaCasa(casa)).map((x) => x.id)).toEqual([f.id]);

    for (let i = 1; i < MAX_FOTOS_POR_CASA; i++) await repo.adicionar(foto(casa));
    await expect(repo.adicionar(foto(casa))).rejects.toMatchObject({ codigo: 'LIMITE_DE_FOTOS' });

    await repo.remover(f);
    expect(await repo.contar(casa)).toBe(MAX_FOTOS_POR_CASA - 1);
  });

  it('outro usuário não envia nem remove foto da casa alheia', async () => {
    const { cliente } = await ctx.logado();
    const alheio = new CasaFotosRepository(cliente.api);
    await expect(alheio.adicionar(foto(casa))).rejects.toMatchObject({ status: 403 });
    const [qualquer] = await alheio.listarDaCasa(casa);
    if (!qualquer) throw new Error('esperava foto');
    await expect(alheio.remover(qualquer)).rejects.toMatchObject({ status: 403 });
  });
});
