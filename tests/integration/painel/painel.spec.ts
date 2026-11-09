import { beforeAll, describe, expect, it } from 'vitest';
import { CasasPainelRepository } from '@/features/casas/api/CasasPainelRepository';
import { CasaUmbandaRepository } from '@/features/casas/api/CasaUmbandaRepository';
import { CasaCandombleRepository } from '@/features/casas/api/CasaCandombleRepository';
import { CasaQuimbandaRepository } from '@/features/casas/api/CasaQuimbandaRepository';
import { PainelService } from '@/features/painel/api/PainelService';
import { PerfilAbertura } from '@/features/casas/domain/PerfilAbertura';
import type { ApiClient } from '@/shared/lib/ApiClient';
import { contextoIntegracao } from '../../setup/contexto';

function painel(api: ApiClient) {
  const casas = new CasasPainelRepository(api);
  return {
    casas,
    svc: new PainelService(casas, new CasaUmbandaRepository(api), new CasaCandombleRepository(api), new CasaQuimbandaRepository(api)),
    umbanda: new CasaUmbandaRepository(api),
    candomble: new CasaCandombleRepository(api),
    quimbanda: new CasaQuimbandaRepository(api),
  };
}

describe('painel do dirigente (integração)', () => {
  const ctx = contextoIntegracao();
  let p: ReturnType<typeof painel>;
  let umbanda: string;
  let candomble: string;
  let quimbanda: string;

  beforeAll(async () => {
    const d = await ctx.logado('dirigente');
    p = painel(d.cliente.api);
    umbanda = await ctx.banco.criarCasa({ slug: 'p-umbanda', nome: 'P Umbanda' });
    candomble = await ctx.banco.criarCasa({ slug: 'p-candomble', nome: 'P Candomblé', tradicao: 'candomble' });
    quimbanda = await ctx.banco.criarCasa({ slug: 'p-quimbanda', nome: 'P Quimbanda', tradicao: 'quimbanda' });
    for (const id of [umbanda, candomble, quimbanda]) await ctx.banco.vincularDirigente(id, d.usuario.id);
    await ctx.banco.criarCasa({ slug: 'p-alheia', nome: 'Alheia' });
  });

  it('minhasCasas traz só as casas onde sou dirigente', async () => {
    expect((await p.casas.minhasCasas()).map((c) => c.nome).sort()).toEqual(['P Candomblé', 'P Quimbanda', 'P Umbanda']);
  });

  it('salvarPerfil e salvarAbertura', async () => {
    await p.svc.salvarPerfil(umbanda, {
      descricao: 'Gira toda segunda',
      sacerdoteNome: 'Mãe Maria',
      textoAntesVisita: null,
      whatsapp: '47988887777',
      telefone: null,
      emailContato: 'casa@teste.local',
      site: 'https://casa.teste.local',
    });
    await p.svc.salvarAbertura(
      umbanda,
      PerfilAbertura.parse({ enderecoVisibilidade: 'oculto', aceitaVisitantes: 'so_indicacao', fotoRegistro: 'proibido' }),
    );
    const c = await p.casas.buscarPorId(umbanda);
    expect(c?.sacerdoteNome).toBe('Mãe Maria');
    expect(c?.contato?.site).toBe('https://casa.teste.local');
    expect(c?.perfilAbertura.aceitaVisitantes).toBe('so_indicacao');
  });

  it('salvarEndereco grava coordenadas; rejeita coords parciais e cidade vazia', async () => {
    const base = {
      logradouro: 'Rua Nova',
      numero: '20',
      complemento: null,
      bairro: 'Fazenda',
      cidade: 'Itajaí',
      estado: 'SC',
      cep: '88302-000',
      coordLat: -26.93,
      coordLng: -48.67,
    };
    await p.svc.salvarEndereco(umbanda, base);
    expect((await p.casas.buscarPorId(umbanda))?.coordenadas?.lat).toBe(-26.93);
    await expect(p.svc.salvarEndereco(umbanda, { ...base, coordLng: null })).rejects.toThrow();
    await expect(p.svc.salvarEndereco(umbanda, { ...base, cidade: ' ' })).rejects.toThrow();
  });

  it('blocos por tradição: salva, relê e é idempotente', async () => {
    await p.svc.salvarBlocoUmbanda(umbanda, {
      sincretismo: 'parcial',
      influenciaKardecista: 'nenhuma',
      sacralizacao: 'nao',
      linhagem: ['Zélio de Moraes'],
      linhasTrabalhadas: ['caboclo', 'pretovelho'],
    });
    expect((await p.umbanda.buscar(umbanda))?.linhasTrabalhadas).toEqual(['caboclo', 'pretovelho']);

    const cand = { nacao: 'ketu' as const, raizLinhagem: 'Casa Branca', orixaDaCasa: 'Oxóssi', linguaRitual: 'iorubá' };
    await p.svc.salvarBlocoCandomble(candomble, cand);
    await p.svc.salvarBlocoCandomble(candomble, cand);
    expect((await p.candomble.buscar(candomble))?.orixaDaCasa).toBe('Oxóssi');

    await p.svc.salvarBlocoQuimbanda(quimbanda, { corrente: 'Quimbanda Nagô', raizLinhagem: null, abertaANaoIniciados: true });
    expect((await p.quimbanda.buscar(quimbanda))?.abertaANaoIniciados).toBe(true);
  });

  it('bloco de tradição diferente é recusado', async () => {
    await expect(
      p.svc.salvarBlocoCandomble(umbanda, { nacao: 'ketu', raizLinhagem: null, orixaDaCasa: null, linguaRitual: null }),
    ).rejects.toMatchObject({ code: 'PAINEL_TRADICAO_INCOMPATIVEL' });
    // e a API também barra, se alguém pular o service
    await expect(
      p.candomble.upsert(umbanda, { nacao: 'ketu', raizLinhagem: null, orixaDaCasa: null, linguaRitual: null }),
    ).rejects.toMatchObject({ codigo: 'BLOCO_DE_OUTRA_TRADICAO' });
  });
});
