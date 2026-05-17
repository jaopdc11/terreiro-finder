import { z } from 'zod';
import { DomainError } from '@/shared/lib/errors';
import { candombleNacao, type CandombleNacao } from './blocoCandombleEnums';

export const blocoCandombleRowSchema = z.object({
  casa_id: z.string().uuid(),
  nacao: candombleNacao.nullable(),
  raiz_linhagem: z.string().nullable(),
  orixa_da_casa: z.string().nullable(),
  lingua_ritual: z.string().nullable(),
});

export type BlocoCandombleRow = z.infer<typeof blocoCandombleRowSchema>;

export interface BlocoCandombleInput {
  nacao: CandombleNacao | null;
  raizLinhagem: string | null;
  orixaDaCasa: string | null;
  linguaRitual: string | null;
}

/**
 * Bloco específico de Candomblé. 4 campos do DDL: 1 enum (nação) + 3 textos
 * livres. Imutável; mutações retornam nova instância (padrão BlocoUmbanda).
 */
export class BlocoCandomble {
  private constructor(
    readonly casaId: string,
    readonly nacao: CandombleNacao | null,
    readonly raizLinhagem: string | null,
    readonly orixaDaCasa: string | null,
    readonly linguaRitual: string | null,
  ) {}

  static fromRow(raw: unknown): BlocoCandomble {
    const r = blocoCandombleRowSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'BLOCO_CANDOMBLE_ROW_INVALIDA',
        `Row de bloco Candomblé inválida: ${r.error.issues[0]?.message ?? 'erro'}`,
        { cause: r.error },
      );
    }
    const row = r.data;
    return new BlocoCandomble(
      row.casa_id,
      row.nacao,
      row.raiz_linhagem,
      row.orixa_da_casa,
      row.lingua_ritual,
    );
  }

  static vazio(casaId: string): BlocoCandomble {
    return new BlocoCandomble(casaId, null, null, null, null);
  }

  toInput(): BlocoCandombleInput {
    return {
      nacao: this.nacao,
      raizLinhagem: this.raizLinhagem,
      orixaDaCasa: this.orixaDaCasa,
      linguaRitual: this.linguaRitual,
    };
  }

  com(input: Partial<BlocoCandombleInput>): BlocoCandomble {
    const merged = { ...this.toInput(), ...input };
    return new BlocoCandomble(
      this.casaId,
      merged.nacao,
      merged.raizLinhagem,
      merged.orixaDaCasa,
      merged.linguaRitual,
    );
  }

  /** Indica se o bloco tem ao menos 1 campo preenchido (pra a ficha pública). */
  temConteudo(): boolean {
    return (
      this.nacao !== null ||
      (this.raizLinhagem?.trim().length ?? 0) > 0 ||
      (this.orixaDaCasa?.trim().length ?? 0) > 0 ||
      (this.linguaRitual?.trim().length ?? 0) > 0
    );
  }
}
