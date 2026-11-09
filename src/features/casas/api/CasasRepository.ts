import { z } from 'zod';
import { ApiError, type ApiClient } from '@/shared/lib/ApiClient';
import { Casa } from '../domain/Casa';
import type { FiltrosBusca } from '@/features/busca/domain/FiltrosBusca';
import type {
  AceitaVisitantes,
  EnderecoVisibilidade,
  FotoRegistro,
} from '../domain/PerfilAbertura';
import type { TradicaoPrincipal } from '../schemas';
import { casaRowDaApi } from './casaDaApi';

/**
 * Payload pra criar uma casa cadastrada diretamente pela dirigência.
 * A API gera o slug (cascata) e cuida da moderação.
 */
export interface NovaCasaDeDirigencia {
  nome: string;
  sacerdote_nome: string | null;
  tradicao_principal: TradicaoPrincipal;
  descricao: string | null;
  texto_antes_visita: string | null;

  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string;
  estado: string;
  cep: string | null;
  coord_lat: number | null;
  coord_lng: number | null;

  status: 'pendente';
  fonte: 'proprio';
  endereco_visibilidade: EnderecoVisibilidade;
  aceita_visitantes: AceitaVisitantes;
  foto_registro: FotoRegistro;

  whatsapp: string | null;
  telefone: string | null;
  email_contato: string | null;
  site: string | null;

  /** Canal pelo qual o admin valida a dirigência antes de aprovar. */
  canal_validacao: string;

  /** Como a dirigência se apresenta (Pai/Mãe de Santo, Babalorixá, Tata, ...). */
  papel_dirigencia_proposto: string;
}

const listaSchema = z.array(z.unknown());
const idSchema = z.object({ id: z.string().uuid() });

export function casaDaApi(raw: unknown): Casa {
  return Casa.fromRow(casaRowDaApi(raw));
}

export class CasasRepository {
  constructor(private readonly api: ApiClient) {}

  /** Casas aprovadas com os filtros do VO (a API aplica cada um). */
  async listAprovadas(filtros: FiltrosBusca): Promise<Casa[]> {
    const data = await this.api.get('/casas', {
      tradicao: filtros.tradicao ?? undefined,
      cidade: filtros.cidade ?? undefined,
      bairro: filtros.bairro ?? undefined,
      aceitaVisitantes: filtros.aceitaVisitantes ?? undefined,
      enderecoVisibilidade: filtros.enderecoVisibilidade ?? undefined,
      tags: filtros.tags.length > 0 ? filtros.tags.join(',') : undefined,
      nacao: filtros.nacaoCandomble ?? undefined,
      soAbertas: filtros.soAbertasQuimbanda ? 'true' : undefined,
    });
    return listaSchema.parse(data).map(casaDaApi);
  }

  /** Ficha pública (ou do gestor). 404 vira null. */
  async findBySlug(slug: string): Promise<Casa | null> {
    return nuloSe404(async () => casaDaApi(await this.api.get(`/casas/slug/${encodeURIComponent(slug)}`)));
  }

  async findById(casaId: string): Promise<Casa | null> {
    return nuloSe404(async () => casaDaApi(await this.api.get(`/casas/${casaId}`)));
  }

  /** Cadastro direto pela dirigência. Nasce pendente; devolve o id. */
  async criarComoDirigencia(payload: NovaCasaDeDirigencia): Promise<string> {
    const data = await this.api.post('/casas', {
      nome: payload.nome,
      tradicaoPrincipal: payload.tradicao_principal,
      endereco: {
        logradouro: payload.logradouro,
        numero: payload.numero,
        complemento: payload.complemento,
        bairro: payload.bairro,
        cidade: payload.cidade,
        estado: payload.estado,
        cep: payload.cep,
        coordLat: payload.coord_lat,
        coordLng: payload.coord_lng,
      },
      perfil: {
        descricao: payload.descricao,
        sacerdoteNome: payload.sacerdote_nome,
        textoAntesVisita: payload.texto_antes_visita,
        whatsapp: payload.whatsapp,
        telefone: payload.telefone,
        emailContato: payload.email_contato,
        site: payload.site,
      },
      abertura: {
        enderecoVisibilidade: payload.endereco_visibilidade,
        aceitaVisitantes: payload.aceita_visitantes,
        fotoRegistro: payload.foto_registro,
      },
      canalValidacao: payload.canal_validacao,
      papelDirigenciaProposto: payload.papel_dirigencia_proposto,
    });
    return idSchema.parse(data).id;
  }
}

/** Executa e devolve null se a API disser 404 (não existe ou não pode ver). */
export async function nuloSe404<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
