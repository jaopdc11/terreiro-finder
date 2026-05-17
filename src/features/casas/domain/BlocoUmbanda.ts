import { z } from 'zod';
import { DomainError } from '@/shared/lib/errors';
import {
  umbandaKardecismo,
  umbandaSacralizacao,
  umbandaSincretismo,
  type UmbandaKardecismo,
  type UmbandaSacralizacao,
  type UmbandaSincretismo,
} from './blocoUmbandaEnums';

export const blocoUmbandaRowSchema = z.object({
  casa_id: z.string().uuid(),
  sincretismo: umbandaSincretismo.nullable(),
  influencia_kardecista: umbandaKardecismo.nullable(),
  linhagem: z.array(z.string()).default([]),
  sacralizacao: umbandaSacralizacao.nullable(),
  linhas_trabalhadas: z.array(z.string()).default([]),
});

export type BlocoUmbandaRow = z.infer<typeof blocoUmbandaRowSchema>;

export interface BlocoUmbandaInput {
  sincretismo: UmbandaSincretismo | null;
  influenciaKardecista: UmbandaKardecismo | null;
  sacralizacao: UmbandaSacralizacao | null;
  linhagem: ReadonlyArray<string>;
  linhasTrabalhadas: ReadonlyArray<string>;
}

/**
 * Bloco específico de Umbanda — preenchido junto com a casa. Imutável;
 * mutações retornam nova instância.
 */
export class BlocoUmbanda {
  private constructor(
    readonly casaId: string,
    readonly sincretismo: UmbandaSincretismo | null,
    readonly influenciaKardecista: UmbandaKardecismo | null,
    readonly sacralizacao: UmbandaSacralizacao | null,
    readonly linhagem: ReadonlyArray<string>,
    readonly linhasTrabalhadas: ReadonlyArray<string>,
  ) {}

  static fromRow(raw: unknown): BlocoUmbanda {
    const r = blocoUmbandaRowSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'BLOCO_UMBANDA_ROW_INVALIDA',
        `Row de bloco Umbanda inválida: ${r.error.issues[0]?.message ?? 'erro'}`,
        { cause: r.error },
      );
    }
    const row = r.data;
    return new BlocoUmbanda(
      row.casa_id,
      row.sincretismo,
      row.influencia_kardecista,
      row.sacralizacao,
      Object.freeze([...row.linhagem]),
      Object.freeze([...row.linhas_trabalhadas]),
    );
  }

  static vazio(casaId: string): BlocoUmbanda {
    return new BlocoUmbanda(casaId, null, null, null, [], []);
  }

  toInput(): BlocoUmbandaInput {
    return {
      sincretismo: this.sincretismo,
      influenciaKardecista: this.influenciaKardecista,
      sacralizacao: this.sacralizacao,
      linhagem: this.linhagem,
      linhasTrabalhadas: this.linhasTrabalhadas,
    };
  }

  com(input: Partial<BlocoUmbandaInput>): BlocoUmbanda {
    const merged = { ...this.toInput(), ...input };
    return new BlocoUmbanda(
      this.casaId,
      merged.sincretismo,
      merged.influenciaKardecista,
      merged.sacralizacao,
      Object.freeze([...merged.linhagem]),
      Object.freeze([...merged.linhasTrabalhadas]),
    );
  }
}
