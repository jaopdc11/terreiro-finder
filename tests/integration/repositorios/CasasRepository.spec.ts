import { beforeAll, describe, expect, it } from 'vitest';
import { CasasRepository } from '@/features/casas/api/CasasRepository';
import { FiltrosBusca } from '@/features/busca/domain/FiltrosBusca';
import { contextoIntegracao } from '../../setup/contexto';

describe('CasasRepository (integração contra a API)', () => {
  const ctx = contextoIntegracao();
  let repo: CasasRepository;

  beforeAll(async () => {
    const b = ctx.banco;
    await b.criarCasa({ slug: 'tenda-pai-joao', nome: 'Tenda Pai João', linhasTrabalhadas: ['caboclo', 'pretovelho'], bairro: 'Cordeiros' });
    await b.criarCasa({ slug: 'ile-oxossi', nome: 'Ilê de Oxóssi', tradicao: 'candomble', enderecoVisibilidade: 'sob_contato' });
    await b.criarCasa({ slug: 'casa-indicada', nome: 'Casa Indicada', fonte: 'indicacao', linhasTrabalhadas: ['marinheiro'] });
    await b.criarCasa({ slug: 'casa-oculta', nome: 'Casa Oculta', enderecoVisibilidade: 'oculto' });
    await b.criarCasa({ slug: 'casa-pendente', nome: 'Casa Pendente', status: 'pendente', fonte: 'indicacao' });
    repo = new CasasRepository(ctx.anonimo().api);
  });

  it('lista só aprovadas, como entidades Casa', async () => {
    const casas = await repo.listAprovadas(FiltrosBusca.parse({}));
    expect(casas.map((c) => c.slug.toString()).sort()).toEqual(['casa-indicada', 'casa-oculta', 'ile-oxossi', 'tenda-pai-joao']);
    expect(casas.every((c) => c.estaAprovada())).toBe(true);
  });

  it('indicada aprovada aparece, mas não verificada', async () => {
    const c = await repo.findBySlug('casa-indicada');
    expect(c?.estaVerificada()).toBe(false);
  });

  it('filtro por tradição e cidade', async () => {
    expect((await repo.listAprovadas(FiltrosBusca.parse({ tradicao: 'candomble' }))).map((c) => c.nome)).toEqual(['Ilê de Oxóssi']);
    expect(await repo.listAprovadas(FiltrosBusca.parse({ cidade: 'Blumenau' }))).toEqual([]);
  });

  it('tags de umbanda filtram por overlap; tag inexistente devolve vazio', async () => {
    const com = await repo.listAprovadas(FiltrosBusca.parse({ tradicao: 'umbanda', tags: ['caboclo'] }));
    expect(com.map((c) => c.nome)).toEqual(['Tenda Pai João']);
    expect(await repo.listAprovadas(FiltrosBusca.parse({ tradicao: 'umbanda', tags: ['nao-existe'] }))).toEqual([]);
  });

  it('findBySlug: aprovada sim, inexistente e pendente viram null', async () => {
    expect((await repo.findBySlug('tenda-pai-joao'))?.nome).toBe('Tenda Pai João');
    expect(await repo.findBySlug('nao-existe')).toBeNull();
    expect(await repo.findBySlug('casa-pendente')).toBeNull();
  });

  it('endereço por visibilidade: público completo, sob contato aproximado, oculto sem pin', async () => {
    const pub = await repo.findBySlug('tenda-pai-joao');
    expect(pub?.enderecoPublico()).toContain('Rua das Flores');
    expect(pub?.coordenadas?.lat).toBe(-26.9123456);
    expect(pub?.localizacaoAproximada).toBe(false);

    const sob = await repo.findBySlug('ile-oxossi');
    expect(sob?.enderecoPublico()).toBeNull();
    expect(sob?.logradouro).toBeNull();
    expect(sob?.coordenadas?.lat).toBe(-26.91);
    expect(sob?.localizacaoAproximada).toBe(true);

    const oculta = await repo.findBySlug('casa-oculta');
    expect(oculta?.coordenadas).toBeNull();
    expect(oculta?.bairro).toBeNull();
  });
});
