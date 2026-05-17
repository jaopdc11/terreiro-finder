import { z } from 'zod';

export const casaStatusSchema = z.enum(['pendente', 'aprovada', 'recusada', 'arquivada']);
export type CasaStatus = z.infer<typeof casaStatusSchema>;

export const casaFonteSchema = z.enum(['indicacao', 'proprio', 'reivindicada']);
export type CasaFonte = z.infer<typeof casaFonteSchema>;

export const tradicaoPrincipalSchema = z.enum([
  'umbanda',
  'candomble',
  'quimbanda',
  'tambor_de_mina',
  'omoloco',
  'xamba',
  'outra',
]);
export type TradicaoPrincipal = z.infer<typeof tradicaoPrincipalSchema>;

/**
 * Schema da row de casas (formato banco — snake_case).
 * É o ponto de entrada de qualquer dado vindo do Supabase.
 */
export const casaRowSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  sacerdote_nome: z.string().nullable(),
  tradicao_principal: tradicaoPrincipalSchema,
  status: casaStatusSchema,
  fonte: casaFonteSchema,

  logradouro: z.string().nullable(),
  numero: z.string().nullable(),
  complemento: z.string().nullable(),
  bairro: z.string().nullable(),
  cidade: z.string(),
  estado: z.string(),
  cep: z.string().nullable(),
  endereco_visibilidade: z.enum(['publico', 'sob_contato', 'oculto']),

  coord_lat: z.number().nullable(),
  coord_lng: z.number().nullable(),

  aceita_visitantes: z.enum(['aberto', 'jogo_previo', 'so_indicacao']),
  foto_registro: z.enum(['permitido', 'proibido', 'parcial']),

  whatsapp: z.string().nullable(),
  telefone: z.string().nullable(),
  email_contato: z.string().nullable(),

  texto_antes_visita: z.string().nullable(),

  created_at: z.string(),
  updated_at: z.string(),
  aprovada_em: z.string().nullable(),
  aprovada_por: z.string().uuid().nullable(),
  criada_por: z.string().uuid().nullable().optional(),
  canal_validacao: z.string().nullable().optional(),
  papel_dirigencia_proposto: z.string().nullable().optional(),
  motivo_recusa: z.string().nullable().optional(),
});

export type CasaRow = z.infer<typeof casaRowSchema>;
