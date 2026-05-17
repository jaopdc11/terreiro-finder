import { describe, expect, it } from 'vitest';
import { cadastroSchema, emailSchema, senhaSchema } from './schemas';

describe('schemas auth', () => {
  it('email aceita formato válido', () => {
    expect(emailSchema.safeParse('a@b.org').success).toBe(true);
  });

  it('email rejeita sem arroba', () => {
    expect(emailSchema.safeParse('sem-arroba').success).toBe(false);
  });

  it('senha exige ao menos 8 caracteres', () => {
    expect(senhaSchema.safeParse('curta').success).toBe(false);
    expect(senhaSchema.safeParse('senhaforte').success).toBe(true);
  });

  describe('cadastro', () => {
    it('valida quando senhas batem', () => {
      const r = cadastroSchema.safeParse({
        nomeCompleto: 'Maria de Aruanda',
        email: 'maria@terreiro.org',
        senha: 'senhaforte',
        confirmacao: 'senhaforte',
      });
      expect(r.success).toBe(true);
    });

    it('falha quando confirmação diverge', () => {
      const r = cadastroSchema.safeParse({
        nomeCompleto: 'Maria',
        email: 'maria@terreiro.org',
        senha: 'senhaforte',
        confirmacao: 'outraSenha',
      });
      expect(r.success).toBe(false);
    });
  });
});
