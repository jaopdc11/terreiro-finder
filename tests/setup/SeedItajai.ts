import type { SupabaseClient } from '@supabase/supabase-js';

export interface CasaSeedInput {
  slug: string;
  nome: string;
  tradicao: 'umbanda' | 'candomble' | 'quimbanda' | 'tambor_de_mina' | 'omoloco' | 'xamba' | 'outra';
  status?: 'pendente' | 'aprovada' | 'recusada' | 'arquivada';
  fonte?: 'indicacao' | 'proprio' | 'reivindicada';
  cidade?: string;
  estado?: string;
  bairro?: string;
  enderecoVisibilidade?: 'publico' | 'sob_contato' | 'oculto';
  aceitaVisitantes?: 'aberto' | 'jogo_previo' | 'so_indicacao';
  coordLat?: number;
  coordLng?: number;
  /** Tags pra bloco umbanda quando tradicao=umbanda. */
  linhasTrabalhadas?: string[];
  linhagem?: string[];
  sacerdoteNome?: string;
  descricao?: string;
}

/**
 * Fixture de seed pra testes. Não roda em produção. Cria casas via service-role
 * (bypassa RLS), permitindo qualquer status/fonte. Marca casas com sufixo no
 * nome pra cleanup determinístico.
 */
export class SeedItajai {
  static readonly MARKER = '[SEED]';

  constructor(private readonly admin: SupabaseClient) {}

  async limpar(): Promise<void> {
    await this.admin.from('casas').delete().like('nome', `%${SeedItajai.MARKER}%`);
  }

  async popularCasas(): Promise<{
    aprovadaUmbanda: string;
    aprovadaCandomble: string;
    naoVerificada: string;
    pendente: string;
  }> {
    await this.limpar();

    const aprovadaUmbanda = await this.criarCasa({
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

    const aprovadaCandomble = await this.criarCasa({
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

    const naoVerificada = await this.criarCasa({
      slug: 'seed-casa-indicada',
      nome: `Casa Indicada ${SeedItajai.MARKER}`,
      tradicao: 'umbanda',
      fonte: 'indicacao',
      status: 'aprovada',
      bairro: 'Fazenda',
      coordLat: -26.92,
      coordLng: -48.67,
      linhasTrabalhadas: ['marinheiro'],
    });

    const pendente = await this.criarCasa({
      slug: 'seed-casa-pendente',
      nome: `Casa Pendente ${SeedItajai.MARKER}`,
      tradicao: 'quimbanda',
      status: 'pendente',
      fonte: 'indicacao',
    });

    return { aprovadaUmbanda, aprovadaCandomble, naoVerificada, pendente };
  }

  private async criarCasa(input: CasaSeedInput): Promise<string> {
    const { data, error } = await this.admin
      .from('casas')
      .insert({
        slug: input.slug,
        nome: input.nome,
        tradicao_principal: input.tradicao,
        status: input.status ?? 'aprovada',
        fonte: input.fonte ?? 'proprio',
        cidade: input.cidade ?? 'Itajaí',
        estado: input.estado ?? 'SC',
        bairro: input.bairro ?? null,
        endereco_visibilidade: input.enderecoVisibilidade ?? 'sob_contato',
        aceita_visitantes: input.aceitaVisitantes ?? 'jogo_previo',
        coord_lat: input.coordLat ?? null,
        coord_lng: input.coordLng ?? null,
        sacerdote_nome: input.sacerdoteNome ?? null,
        descricao: input.descricao ?? null,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`SeedItajai.criarCasa: ${error?.message ?? 'sem id'}`);

    if (input.tradicao === 'umbanda' && (input.linhasTrabalhadas || input.linhagem)) {
      await this.admin.from('casa_umbanda').insert({
        casa_id: data.id,
        linhas_trabalhadas: input.linhasTrabalhadas ?? [],
        linhagem: input.linhagem ?? [],
      });
    }

    return data.id as string;
  }
}
