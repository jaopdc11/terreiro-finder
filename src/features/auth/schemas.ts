import { z } from 'zod';

export const userRoleSchema = z.enum(['visitante', 'dirigente', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu email')
  .email('Email inválido');

export const senhaSchema = z
  .string()
  .min(8, 'Senha precisa de pelo menos 8 caracteres')
  .max(72, 'Senha muito longa');

export const loginSchema = z.object({
  email: emailSchema,
  senha: senhaSchema,
});
export type LoginInput = z.infer<typeof loginSchema>;

export const cadastroSchema = z
  .object({
    nomeCompleto: z.string().trim().min(2, 'Diz teu nome completo'),
    nomeExibicao: z.preprocess(
      (v) => (typeof v === 'string' && v.trim().length === 0 ? undefined : v),
      z
        .string()
        .trim()
        .min(2, 'Diz como prefere ser chamada(o)')
        .optional(),
    ),
    email: emailSchema,
    senha: senhaSchema,
    confirmacao: senhaSchema,
  })
  .refine((v) => v.senha === v.confirmacao, {
    message: 'As senhas não batem',
    path: ['confirmacao'],
  });
export type CadastroInput = z.infer<typeof cadastroSchema>;

export const recuperarSenhaSchema = z.object({
  email: emailSchema,
});
export type RecuperarSenhaInput = z.infer<typeof recuperarSenhaSchema>;

/**
 * Profile na shape do banco — fonte da verdade pra role do usuário.
 */
export const profileRowSchema = z.object({
  id: z.string().uuid(),
  nome_completo: z.string().nullable(),
  nome_exibicao: z.string().nullable(),
  role: userRoleSchema,
});
export type ProfileRow = z.infer<typeof profileRowSchema>;
