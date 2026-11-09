import { z } from 'zod';
import { moderacaoStatusSchema } from '@/features/indicacao/schemas';

export const reivindicacaoRowSchema = z.object({
  id: z.string().uuid(),
  // a API não devolve o autor pra ele mesmo; só a fila do admin traz
  user_id: z.string().uuid().nullable(),
  casa_id: z.string().uuid(),
  observacoes: z.string().nullable(),
  status: moderacaoStatusSchema,
  moderado_por: z.string().uuid().nullable(),
  moderado_em: z.string().nullable(),
  motivo_recusa: z.string().nullable(),
  created_at: z.string(),
});

export type ReivindicacaoRow = z.infer<typeof reivindicacaoRowSchema>;

/** Form de criar reivindicação (visitante logado na ficha de uma casa não-verificada). */
export const novaReivindicacaoSchema = z.object({
  casa_id: z.string().uuid('Casa inválida'),
  observacoes: z
    .string()
    .trim()
    .min(20, 'Conta um pouco mais — pelo menos 20 caracteres (quem é da casa, há quanto tempo, etc.)')
    .max(2000, 'Texto muito longo'),
});

export type NovaReivindicacaoInput = z.infer<typeof novaReivindicacaoSchema>;
