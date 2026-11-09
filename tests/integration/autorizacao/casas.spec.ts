import { beforeAll, describe, expect, it } from 'vitest';
import { CasasRepository, type NovaCasaDeDirigencia } from '@/features/casas/api/CasasRepository';
import { CasasPainelRepository } from '@/features/casas/api/CasasPainelRepository';
import { PerfilAbertura } from '@/features/casas/domain/PerfilAbertura';
import { contextoIntegracao } from '../../setup/contexto';

// Antes eram as policies de RLS (tests/integration/rls). Agora quem decide é
// a API; aqui provamos pelo HTTP, com os 3 tipos de cliente.

const nova = (nome: string): NovaCasaDeDirigencia => ({
  nome,
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
  coord_lat: null,
  coord_lng: null,
  status: 'pendente',
  fonte: 'proprio',
  endereco_visibilidade: 'sob_contato',
  aceita_visitantes: 'aberto',
  foto_registro: 'parcial',
  whatsapp: '47999999999',
  telefone: null,
  email_contato: null,
  site: null,
  canal_validacao: '@casa no instagram',
  papel_dirigencia_proposto: 'Mãe de Santo',
});

describe('autorização · casas', () => {
  const ctx = contextoIntegracao();
  let aprovada: string;
  let pendenteDoDirigente: string;
  let dirigente: Awaited<ReturnType<typeof ctx.logado>>;

  beforeAll(async () => {
    aprovada = await ctx.banco.criarCasa({ slug: 'aprovada', nome: 'Aprovada' });
    dirigente = await ctx.logado('dirigente');
    pendenteDoDirigente = await ctx.banco.criarCasa({ slug: 'pendente-dirigida', nome: 'Pendente Dirigida', status: 'pendente' });
    await ctx.banco.vincularDirigente(pendenteDoDirigente, dirigente.usuario.id);
    await ctx.banco.vincularDirigente(aprovada, dirigente.usuario.id);
  });

  it('anônimo só enxerga aprovadas (pendente é 404 até pelo id)', async () => {
    const repo = new CasasRepository(ctx.anonimo().api);
    expect(await repo.findById(aprovada)).not.toBeNull();
    expect(await repo.findById(pendenteDoDirigente)).toBeNull();
  });

  it('dirigente vê a própria casa em qualquer status', async () => {
    const minhas = await new CasasPainelRepository(dirigente.cliente.api).minhasCasas();
    expect(minhas.map((c) => c.status).sort()).toEqual(['aprovada', 'pendente']);
  });

  it('admin vê pendente', async () => {
    const { cliente } = await ctx.logado('admin');
    expect((await new CasasRepository(cliente.api).findById(pendenteDoDirigente))?.status).toBe('pendente');
  });

  it('logado cria casa sempre como pendente, e o criador consegue ler', async () => {
    const { cliente } = await ctx.logado();
    const repo = new CasasRepository(cliente.api);
    const id = await repo.criarComoDirigencia(nova('Casa Nova Teste'));
    const lida = await repo.findById(id);
    expect(lida?.status).toBe('pendente');
    expect(lida?.fonte).toBe('proprio');
    expect(await new CasasRepository(ctx.anonimo().api).findById(id)).toBeNull();
  });

  it('anônimo não cria casa', async () => {
    await expect(new CasasRepository(ctx.anonimo().api).criarComoDirigencia(nova('Anônima'))).rejects.toMatchObject({
      status: 401,
    });
  });

  it('dirigente edita a própria casa; outro usuário não', async () => {
    const meu = new CasasPainelRepository(dirigente.cliente.api);
    await meu.atualizarPerfil(aprovada, {
      descricao: 'Casa de caridade',
      sacerdoteNome: null,
      textoAntesVisita: null,
      whatsapp: '47999999999',
      telefone: null,
      emailContato: null,
      site: null,
    });
    expect((await meu.buscarPorId(aprovada))?.descricao).toBe('Casa de caridade');

    const { cliente } = await ctx.logado();
    await expect(
      new CasasPainelRepository(cliente.api).atualizarAbertura(
        aprovada,
        PerfilAbertura.parse({ enderecoVisibilidade: 'publico', aceitaVisitantes: 'aberto', fotoRegistro: 'permitido' }),
      ),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('edição do painel não mexe em status nem fonte', async () => {
    const repo = new CasasPainelRepository(dirigente.cliente.api);
    await repo.atualizarAbertura(
      pendenteDoDirigente,
      PerfilAbertura.parse({ enderecoVisibilidade: 'publico', aceitaVisitantes: 'aberto', fotoRegistro: 'permitido' }),
    );
    const linha = await ctx.banco.um<{ status: string; fonte: string }>('select status, fonte from casas where id = $1', [
      pendenteDoDirigente,
    ]);
    expect(linha).toEqual({ status: 'pendente', fonte: 'proprio' });
  });

  it('endereço exato só pro gestor', async () => {
    await ctx.banco.pool.query("update casas set endereco_visibilidade = 'sob_contato' where id = $1", [aprovada]);
    const gestor = await new CasasPainelRepository(dirigente.cliente.api).buscarPorId(aprovada);
    expect(gestor?.logradouro).toBe('Rua das Flores, 10');
    expect(gestor?.localizacaoAproximada).toBe(false);
    const publico = await new CasasRepository(ctx.anonimo().api).findById(aprovada);
    expect(publico?.logradouro).toBeNull();
    expect(publico?.localizacaoAproximada).toBe(true);
  });
});
