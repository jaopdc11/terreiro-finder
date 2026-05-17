import { z } from 'zod';
import { DomainError } from '@/shared/lib/errors';

export const blocoQuimbandaRowSchema = z.object({
  casa_id: z.string().uuid(),
  corrente: z.string().nullable(),
  raiz_linhagem: z.string().nullable(),
  aberta_a_nao_iniciados: z.boolean().nullable(),
});

export type BlocoQuimbandaRow = z.infer<typeof blocoQuimbandaRowSchema>;

export interface BlocoQuimbandaInput {
  corrente: string | null;
  raizLinhagem: string | null;
  abertaANaoIniciados: boolean | null;
}

/**
 * Bloco específico de Quimbanda. 3 campos: corrente da casa, raiz/linhagem
 * (terreiro-mãe), e flag de abertura a não-iniciados. Imutável.
 */
export class BlocoQuimbanda {
  private constructor(
    readonly casaId: string,
    readonly corrente: string | null,
    readonly raizLinhagem: string | null,
    readonly abertaANaoIniciados: boolean | null,
  ) {}

  static fromRow(raw: unknown): BlocoQuimbanda {
    const r = blocoQuimbandaRowSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'BLOCO_QUIMBANDA_ROW_INVALIDA',
        `Row de bloco Quimbanda inválida: ${r.error.issues[0]?.message ?? 'erro'}`,
        { cause: r.error },
      );
    }
    const row = r.data;
    return new BlocoQuimbanda(
      row.casa_id,
      row.corrente,
      row.raiz_linhagem,
      row.aberta_a_nao_iniciados,
    );
  }

  static vazio(casaId: string): BlocoQuimbanda {
    return new BlocoQuimbanda(casaId, null, null, null);
  }

  toInput(): BlocoQuimbandaInput {
    return {
      corrente: this.corrente,
      raizLinhagem: this.raizLinhagem,
      abertaANaoIniciados: this.abertaANaoIniciados,
    };
  }

  com(input: Partial<BlocoQuimbandaInput>): BlocoQuimbanda {
    const merged = { ...this.toInput(), ...input };
    return new BlocoQuimbanda(
      this.casaId,
      merged.corrente,
      merged.raizLinhagem,
      merged.abertaANaoIniciados,
    );
  }

  temConteudo(): boolean {
    return (
      (this.corrente?.trim().length ?? 0) > 0 ||
      (this.raizLinhagem?.trim().length ?? 0) > 0 ||
      this.abertaANaoIniciados !== null
    );
  }
}
