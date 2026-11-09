import { z } from 'zod';
import {
  casaFonteSchema,
  casaStatusSchema,
  tradicaoPrincipalSchema,
  type CasaRow,
} from '../schemas';
import {
  aceitaVisitantesSchema,
  enderecoVisibilidadeSchema,
  fotoRegistroSchema,
} from '../domain/PerfilAbertura';

/**
 * Shape de casa que a encruza-api devolve (camelCase, aninhado). Campos
 * de gestor/admin vêm só pra quem pode ver; por isso opcionais.
 */
export const casaApiSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  nome: z.string(),
  tradicaoPrincipal: tradicaoPrincipalSchema,
  fonte: casaFonteSchema,
  endereco: z.object({
    logradouro: z.string().nullable(),
    numero: z.string().nullable(),
    complemento: z.string().nullable(),
    bairro: z.string().nullable(),
    cidade: z.string(),
    estado: z.string(),
    cep: z.string().nullable(),
    coordLat: z.number().nullable(),
    coordLng: z.number().nullable(),
    aproximado: z.boolean(),
  }),
  perfil: z.object({
    descricao: z.string().nullable(),
    sacerdoteNome: z.string().nullable(),
    textoAntesVisita: z.string().nullable(),
    whatsapp: z.string().nullable(),
    telefone: z.string().nullable(),
    emailContato: z.string().nullable(),
    site: z.string().nullable(),
  }),
  abertura: z.object({
    enderecoVisibilidade: enderecoVisibilidadeSchema,
    aceitaVisitantes: aceitaVisitantesSchema,
    fotoRegistro: fotoRegistroSchema,
  }),
  aprovadaEm: z.string().nullable(),
  // só gestor / criador / admin
  status: casaStatusSchema.optional(),
  motivoRecusa: z.string().nullable().optional(),
  papelDirigenciaProposto: z.string().nullable().optional(),
  criadaEm: z.string().optional(),
  atualizadaEm: z.string().optional(),
  // só admin
  canalValidacao: z.string().nullable().optional(),
  criadaPor: z.string().uuid().nullable().optional(),
  aprovadaPor: z.string().uuid().nullable().optional(),
});

export type CasaApi = z.infer<typeof casaApiSchema>;

/**
 * Converte a casa da API pra row que `Casa.fromRow` entende. A visão
 * pública não traz `status`: a API só mostra casa não-aprovada pra quem
 * tem acesso, e aí o status vem junto.
 */
export function casaRowDaApi(raw: unknown): CasaRow {
  const c = casaApiSchema.parse(raw);
  const data = c.criadaEm ?? c.aprovadaEm ?? new Date(0).toISOString();
  return {
    id: c.id,
    slug: c.slug,
    nome: c.nome,
    descricao: c.perfil.descricao,
    sacerdote_nome: c.perfil.sacerdoteNome,
    tradicao_principal: c.tradicaoPrincipal,
    status: c.status ?? 'aprovada',
    fonte: c.fonte,
    logradouro: c.endereco.logradouro,
    numero: c.endereco.numero,
    complemento: c.endereco.complemento,
    bairro: c.endereco.bairro,
    cidade: c.endereco.cidade,
    estado: c.endereco.estado,
    cep: c.endereco.cep,
    endereco_visibilidade: c.abertura.enderecoVisibilidade,
    coord_lat: c.endereco.coordLat,
    coord_lng: c.endereco.coordLng,
    aceita_visitantes: c.abertura.aceitaVisitantes,
    foto_registro: c.abertura.fotoRegistro,
    whatsapp: c.perfil.whatsapp,
    telefone: c.perfil.telefone,
    email_contato: c.perfil.emailContato,
    site: c.perfil.site,
    texto_antes_visita: c.perfil.textoAntesVisita,
    created_at: data,
    updated_at: c.atualizadaEm ?? data,
    aprovada_em: c.aprovadaEm,
    aprovada_por: c.aprovadaPor ?? null,
    criada_por: c.criadaPor ?? null,
    canal_validacao: c.canalValidacao ?? null,
    papel_dirigencia_proposto: c.papelDirigenciaProposto ?? null,
    motivo_recusa: c.motivoRecusa ?? null,
    localizacao_aproximada: c.endereco.aproximado,
  };
}
