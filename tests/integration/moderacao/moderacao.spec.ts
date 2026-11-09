import { beforeAll, describe, expect, it } from 'vitest';
import { CasasRepository } from '@/features/casas/api/CasasRepository';
import { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';
import { ReivindicacoesRepository } from '@/features/painel/api/ReivindicacoesRepository';
import { ModeracaoRepository } from '@/features/moderacao/api/ModeracaoRepository';
import { CasasPainelRepository } from '@/features/casas/api/CasasPainelRepository';
import { contextoIntegracao } from '../../setup/contexto';

describe('moderação (integração)', () => {
  const ctx = contextoIntegracao();
  let admin: ModeracaoRepository;

  beforeAll(async () => {
    admin = new ModeracaoRepository((await ctx.logado('admin')).cliente.api);
  });

  async function indicar(nome: string) {
    const { cliente, usuario } = await ctx.logado();
    return new IndicacoesRepository(cliente.api).criarComoVisitante(usuario.id, {
      nome,
      bairro: 'Cordeiros',
      cidade: 'Itajaí',
      estado: 'SC',
      tradicao_principal: 'candomble',
      canal_contato: '@casa',
    });
  }

  describe('indicação em 2 passos', () => {
    it('passo 1 cria casa pendente (invisível); passo 2 publica sem selo', async () => {
      const ind = await indicar('Ilê Axé Dois Passos');
      const { casaId } = await admin.aprovarIndicacao(ind.id);
      const anon = new CasasRepository(ctx.anonimo().api);
      expect(await anon.findById(casaId)).toBeNull();
      expect((await admin.fila()).aguardandoConsentimento.map((c) => c.id)).toContain(casaId);

      await admin.confirmarConsentimento(casaId);
      const publica = await anon.findById(casaId);
      expect(publica?.estaAprovada()).toBe(true);
      expect(publica?.estaVerificada()).toBe(false);
    });

    it('aprovar de novo é recusado (409)', async () => {
      const ind = await indicar('Ilê Repetido');
      await admin.aprovarIndicacao(ind.id);
      await expect(admin.aprovarIndicacao(ind.id)).rejects.toMatchObject({ status: 409 });
    });

    it('recusar exige motivo e depois bloqueia aprovar', async () => {
      const ind = await indicar('Ilê Recusado');
      await expect(admin.recusarIndicacao(ind.id, 'x')).rejects.toMatchObject({ status: 422 });
      await admin.recusarIndicacao(ind.id, 'casa não existe mais');
      await expect(admin.aprovarIndicacao(ind.id)).rejects.toMatchObject({ status: 409 });
      const linha = await ctx.banco.um<{ motivo_recusa: string }>('select motivo_recusa from indicacoes_casa where id = $1', [ind.id]);
      expect(linha?.motivo_recusa).toBe('casa não existe mais');
    });

    it('cascata de slug: mesmo nome gera slugs diferentes', async () => {
      const a = await admin.aprovarIndicacao((await indicar('Casa Homônima')).id);
      const b = await admin.aprovarIndicacao((await indicar('Casa Homônima')).id);
      const slugs = await ctx.banco.pool.query<{ slug: string }>('select slug from casas where id = any($1)', [[a.casaId, b.casaId]]);
      expect(new Set(slugs.rows.map((r) => r.slug)).size).toBe(2);
    });
  });

  describe('cadastro direto', () => {
    async function cadastrar() {
      const dono = await ctx.logado('dirigente');
      const id = await ctx.banco.criarCasa({
        slug: `direto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        nome: 'Cadastro Direto',
        status: 'pendente',
        fonte: 'proprio',
        criadaPor: dono.usuario.id,
        canalValidacao: '@direto',
      });
      return { id, dono };
    }

    it('aprovar vincula o criador e a casa fica verificada', async () => {
      const { id, dono } = await cadastrar();
      const fila = await admin.fila();
      expect(fila.cadastrosDiretos.find((c) => c.id === id)).toMatchObject({ canal_validacao: '@direto' });
      await admin.aprovarCadastroDireto(id);
      const casa = await new CasasRepository(ctx.anonimo().api).findById(id);
      expect(casa?.estaVerificada()).toBe(true);
      expect((await new CasasPainelRepository(dono.cliente.api).minhasCasas()).map((c) => c.id)).toContain(id);
      await expect(admin.aprovarCadastroDireto(id)).rejects.toMatchObject({ status: 409 });
    });

    it('recusar grava motivo e não vincula', async () => {
      const { id, dono } = await cadastrar();
      await admin.recusarCadastroDireto(id, 'não confirmou pelo canal');
      const linha = await ctx.banco.um<{ status: string; motivo_recusa: string }>(
        'select status, motivo_recusa from casas where id = $1',
        [id],
      );
      expect(linha).toEqual({ status: 'recusada', motivo_recusa: 'não confirmou pelo canal' });
      expect(await new CasasPainelRepository(dono.cliente.api).minhasCasas()).toEqual([]);
    });

    it('não-admin não aprova', async () => {
      const { id, dono } = await cadastrar();
      await expect(new ModeracaoRepository(dono.cliente.api).aprovarCadastroDireto(id)).rejects.toMatchObject({ status: 403 });
    });

    it('casa sem criador não pode ser aprovada', async () => {
      const id = await ctx.banco.criarCasa({ slug: 'sem-criador', nome: 'Sem Criador', status: 'pendente', fonte: 'proprio' });
      await expect(admin.aprovarCadastroDireto(id)).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('reivindicação', () => {
    it('aprovar vincula e muda a fonte pra reivindicada', async () => {
      const casa = await ctx.banco.criarCasa({ slug: 'reivindicavel', nome: 'Reivindicável', fonte: 'indicacao' });
      const pessoa = await ctx.logado();
      const r = await new ReivindicacoesRepository(pessoa.cliente.api).criarComoVisitante(pessoa.usuario.id, {
        casa_id: casa,
        observacoes: 'sou dirigente da casa há 12 anos',
      });
      expect((await admin.fila()).reivindicacoes.find((x) => x.id === r.id)?.casa?.nome).toBe('Reivindicável');
      await admin.aprovarReivindicacao(r.id);
      const lida = await new CasasRepository(ctx.anonimo().api).findById(casa);
      expect(lida?.fonte).toBe('reivindicada');
      expect(lida?.estaVerificada()).toBe(true);
      expect((await new CasasPainelRepository(pessoa.cliente.api).minhasCasas()).map((c) => c.id)).toEqual([casa]);
      await expect(admin.aprovarReivindicacao(r.id)).rejects.toMatchObject({ status: 409 });
    });

    it('recusar grava motivo e não vincula; pedido duplicado é recusado', async () => {
      const casa = await ctx.banco.criarCasa({ slug: 'reivindicavel-2', nome: 'Outra', fonte: 'indicacao' });
      const pessoa = await ctx.logado();
      const repo = new ReivindicacoesRepository(pessoa.cliente.api);
      const r = await repo.criarComoVisitante(pessoa.usuario.id, { casa_id: casa, observacoes: 'texto de pelo menos vinte chars' });
      await expect(repo.criarComoVisitante(pessoa.usuario.id, { casa_id: casa, observacoes: 'de novo, mais vinte chars' })).rejects.toMatchObject({
        status: 409,
      });
      await admin.recusarReivindicacao(r.id, 'sem contato com a casa');
      expect((await repo.listMinhas())[0]?.status).toBe('recusada');
      expect(await new CasasPainelRepository(pessoa.cliente.api).minhasCasas()).toEqual([]);
    });

    it('não-admin não aprova reivindicação', async () => {
      const casa = await ctx.banco.criarCasa({ slug: 'reivindicavel-3', nome: 'Terceira', fonte: 'indicacao' });
      const pessoa = await ctx.logado();
      const r = await new ReivindicacoesRepository(pessoa.cliente.api).criarComoVisitante(pessoa.usuario.id, {
        casa_id: casa,
        observacoes: 'texto de pelo menos vinte chars',
      });
      await expect(new ModeracaoRepository(pessoa.cliente.api).aprovarReivindicacao(r.id)).rejects.toMatchObject({ status: 403 });
    });
  });
});
