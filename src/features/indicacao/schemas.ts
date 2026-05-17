import { z } from 'zod';
import { tradicaoPrincipalSchema } from '@/features/casas/schemas';

export const moderacaoStatusSchema = z.enum(['pendente', 'aprovada', 'recusada']);
export type ModeracaoStatus = z.infer<typeof moderacaoStatusSchema>;

export const indicacaoRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  nome: z.string(),
  bairro: z.string().nullable(),
  cidade: z.string(),
  estado: z.string(),
  tradicao_principal: tradicaoPrincipalSchema.nullable(),
  observacoes: z.string().nullable(),
  canal_contato: z.string().nullable(),
  status: moderacaoStatusSchema,
  casa_id: z.string().uuid().nullable(),
  moderado_por: z.string().uuid().nullable(),
  moderado_em: z.string().nullable(),
  motivo_recusa: z.string().nullable(),
  created_at: z.string(),
});

export type IndicacaoRow = z.infer<typeof indicacaoRowSchema>;

/** Form de criar indicação (visitante logado). */
export const novaIndicacaoSchema = z.object({
  nome: z.string().trim().min(2, 'Diz o nome da casa'),
  cidade: z.string().trim().min(2, 'Cidade obrigatória'),
  estado: z
    .string()
    .trim()
    .length(2, 'Estado em sigla (ex: SC)')
    .transform((v) => v.toUpperCase()),
  bairro: z.preprocess(
    (v) => (typeof v === 'string' && v.trim().length === 0 ? undefined : v),
    z.string().trim().min(2).optional(),
  ),
  tradicao_principal: z.preprocess(
    (v) => (typeof v === 'string' && v.length === 0 ? undefined : v),
    tradicaoPrincipalSchema.optional(),
  ),
  canal_contato: z
    .string()
    .trim()
    .min(3, 'Diz como o admin pode contatar a casa pra confirmar (Instagram, WhatsApp da casa, etc.)'),
  observacoes: z.preprocess(
    (v) => (typeof v === 'string' && v.trim().length === 0 ? undefined : v),
    z.string().trim().min(3).optional(),
  ),
});

export type NovaIndicacaoInput = z.infer<typeof novaIndicacaoSchema>;
