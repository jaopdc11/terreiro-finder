import type { BancoTeste } from './BancoTeste';

/**
 * Seed fixo dos e2e (casas de Itajaí). Marcado com [SEED] no nome pra
 * limpeza determinística.
 */
export class SeedItajai {
  static readonly MARKER = '[SEED]';

  constructor(private readonly banco: BancoTeste) {}

  async limpar(): Promise<void> {
    await this.banco.pool.query('delete from casas where nome like $1', [`%${SeedItajai.MARKER}%`]);
  }

  async popularCasas() {
    await this.limpar();
    const base = { logradouro: null, whatsapp: null, sacerdoteNome: null } as const;
    const aprovadaUmbanda = await this.banco.criarCasa({
      ...base,
      slug: 'seed-tenda-pai-joao',
      nome: `Tenda Pai João ${SeedItajai.MARKER}`,
      tradicao: 'umbanda',
      bairro: 'Cordeiros',
      enderecoVisibilidade: 'publico',
      aceitaVisitantes: 'aberto',
      coordLat: -26.91,
      coordLng: -48.66,
      linhasTrabalhadas: ['caboclo', 'pretovelho'],
      sacerdoteNome: 'Pai João',
    });
    const aprovadaCandomble = await this.banco.criarCasa({
      ...base,
      slug: 'seed-ile-asa-de-oxossi',
      nome: `Ilê Asé de Oxóssi ${SeedItajai.MARKER}`,
      tradicao: 'candomble',
      bairro: 'Centro',
      enderecoVisibilidade: 'sob_contato',
      aceitaVisitantes: 'jogo_previo',
      coordLat: -26.905,
      coordLng: -48.658,
      sacerdoteNome: 'Pai Oxossi',
    });
    const naoVerificada = await this.banco.criarCasa({
      ...base,
      slug: 'seed-casa-indicada',
      nome: `Casa Indicada ${SeedItajai.MARKER}`,
      tradicao: 'umbanda',
      fonte: 'indicacao',
      status: 'aprovada',
      bairro: 'Fazenda',
      enderecoVisibilidade: 'sob_contato',
      aceitaVisitantes: 'jogo_previo',
      coordLat: -26.92,
      coordLng: -48.67,
      linhasTrabalhadas: ['marinheiro'],
    });
    const pendente = await this.banco.criarCasa({
      ...base,
      slug: 'seed-casa-pendente',
      nome: `Casa Pendente ${SeedItajai.MARKER}`,
      tradicao: 'quimbanda',
      status: 'pendente',
      fonte: 'indicacao',
      bairro: null,
      coordLat: null,
      coordLng: null,
    });
    return { aprovadaUmbanda, aprovadaCandomble, naoVerificada, pendente };
  }
}
