import { z } from 'zod';
import { DomainError } from '@/shared/lib/errors';

const slugFormat = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const slugSchema = z
  .string()
  .min(1, 'Slug não pode ser vazio')
  .max(120, 'Slug muito longo')
  .regex(slugFormat, 'Slug fora do formato kebab-case');

export class Slug {
  private constructor(private readonly value: string) {}

  static parse(raw: unknown): Slug {
    const r = slugSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError('SLUG_INVALIDO', r.error.issues[0]?.message ?? 'Slug inválido');
    }
    return new Slug(r.data);
  }

  /** Versão "leniente": gera um slug a partir de qualquer texto, removendo acentos e símbolos. */
  static kebab(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /** Convenience: cria Slug a partir de um texto livre. */
  static deTexto(texto: string): Slug {
    const k = Slug.kebab(texto);
    return Slug.parse(k);
  }

  /** Compõe um slug com bairro como qualificador. */
  static deNomeEBairro(nome: string, bairro: string): Slug {
    const base = Slug.kebab(nome);
    const qual = Slug.kebab(bairro);
    if (!base || !qual) {
      throw new DomainError('SLUG_VAZIO', 'Nome e bairro precisam gerar texto não-vazio');
    }
    return Slug.parse(`${base}-${qual}`);
  }

  /** Aplica sufixo numérico (-2, -3, ...) ao slug, mantendo imutabilidade. */
  comSufixoNumerico(n: number): Slug {
    if (!Number.isInteger(n) || n < 2) {
      throw new DomainError('SLUG_SUFIXO_INVALIDO', 'Sufixo numérico tem que ser inteiro >= 2');
    }
    return Slug.parse(`${this.value}-${n}`);
  }

  toString(): string {
    return this.value;
  }

  equals(outro: Slug): boolean {
    return this.value === outro.value;
  }
}
