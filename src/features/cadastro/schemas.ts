import { z } from 'zod';
import { tradicaoPrincipalSchema } from '@/features/casas/schemas';
import {
  aceitaVisitantesSchema,
  enderecoVisibilidadeSchema,
  fotoRegistroSchema,
} from '@/features/casas/domain/PerfilAbertura';

const opcional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim().length === 0 ? undefined : v), schema.optional());

/** Passo 1 — quem é a casa + como validar a dirigência + papel da pessoa. */
export const passoIdentidadeSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome da casa'),
  sacerdote_nome: opcional(z.string().trim().min(2, 'Nome muito curto')),
  tradicao_principal: tradicaoPrincipalSchema,
  descricao: opcional(
    z.string().trim().min(10, 'Descreva com pelo menos 10 caracteres'),
  ),
  papel_dirigencia: z
    .string()
    .trim()
    .min(3, 'Informe como é chamado(a) na casa (mínimo de 3 caracteres)')
    .max(60, 'Texto muito longo'),
  canal_validacao: z
    .string()
    .trim()
    .min(
      5,
      'Forneça pelo menos 5 caracteres. Ex.: "Instagram da casa @meucasa", "telefone fixo (47) 3344-0000", "WhatsApp para comprovante".',
    ),
});

/** Passo 2 — endereço. Bairro/cidade/estado obrigatórios pro mapa. */
export const passoEnderecoSchema = z.object({
  logradouro: opcional(z.string().trim().min(3)),
  numero: opcional(z.string().trim().min(1)),
  complemento: opcional(z.string().trim().min(1)),
  bairro: z.string().trim().min(2, 'Bairro obrigatório'),
  cidade: z.string().trim().min(2, 'Cidade obrigatória'),
  estado: z
    .string()
    .trim()
    .length(2, 'Estado em sigla (ex.: SC)')
    .transform((v) => v.toUpperCase()),
  cep: opcional(z.string().trim().min(8)),
  coord_lat: z.number().nullable().optional(),
  coord_lng: z.number().nullable().optional(),
});

/** Passo 3 — abertura + contato + texto. Pelo menos 1 canal de contato. */
export const passoAberturaContatoSchema = z
  .object({
    endereco_visibilidade: enderecoVisibilidadeSchema,
    aceita_visitantes: aceitaVisitantesSchema,
    foto_registro: fotoRegistroSchema,
    whatsapp: opcional(z.string().trim().min(8)),
    telefone: opcional(z.string().trim().min(8)),
    email_contato: opcional(z.string().trim().email('Email inválido')),
    texto_antes_visita: opcional(
      z
        .string()
        .trim()
        .min(10, 'Descreva o que o visitante precisa saber (mínimo de 10 caracteres)'),
    ),
    consentimento: z.literal(true, {
      errorMap: () => ({
        message:
          'É necessário marcar o consentimento antes de enviar. A casa decide o que aparece no site.',
      }),
    }),
  })
  .refine(
    (v) => Boolean(v.whatsapp ?? v.telefone ?? v.email_contato),
    'Pelo menos um canal de contato é necessário (WhatsApp, telefone ou email).',
  );

/** Schema completo (depois do wizard). É o que vai pro repository. */
export const novaCasaDeProprioSchema = passoIdentidadeSchema
  .merge(passoEnderecoSchema)
  .merge(
    z.object({
      endereco_visibilidade: enderecoVisibilidadeSchema,
      aceita_visitantes: aceitaVisitantesSchema,
      foto_registro: fotoRegistroSchema,
      whatsapp: opcional(z.string().trim().min(8)),
      telefone: opcional(z.string().trim().min(8)),
      email_contato: opcional(z.string().trim().email('Email inválido')),
      texto_antes_visita: opcional(z.string().trim().min(10)),
    }),
  );

export type PassoIdentidadeInput = z.infer<typeof passoIdentidadeSchema>;
export type PassoEnderecoInput = z.infer<typeof passoEnderecoSchema>;
export type PassoAberturaContatoInput = z.infer<typeof passoAberturaContatoSchema>;
export type NovaCasaDeProprioInput = z.infer<typeof novaCasaDeProprioSchema>;
