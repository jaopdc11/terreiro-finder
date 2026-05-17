import { DomainError } from '@/shared/lib/errors';
import type { ModeracaoStatus } from '@/features/indicacao/schemas';
import { reivindicacaoRowSchema, type ReivindicacaoRow } from '../schemas';

/**
 * Pedido de uma pessoa pra ser reconhecida como dirigente de uma casa que
 * ainda não foi verificada. Aprovar resulta em:
 *   1. Vínculo em casa_dirigentes (user → casa, papel principal)
 *   2. casas.fonte muda pra 'reivindicada' → casa passa a ser estaVerificada()
 *
 * Política do MVP (02-escopo-mvp.md §3.4): admin faz contato cruzado pelo
 * canal já registrado na casa antes de aprovar.
 */
export class Reivindicacao {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly casaId: string,
    readonly observacoes: string | null,
    readonly status: ModeracaoStatus,
    readonly moderadoPor: string | null,
    readonly moderadoEm: Date | null,
    readonly motivoRecusa: string | null,
    readonly createdAt: Date,
  ) {}

  static fromRow(raw: unknown): Reivindicacao {
    const r = reivindicacaoRowSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'REIVINDICACAO_ROW_INVALIDA',
        `Row de reivindicação inválida: ${r.error.issues[0]?.message ?? 'erro'}`,
        { cause: r.error },
      );
    }
    const row: ReivindicacaoRow = r.data;
    return new Reivindicacao(
      row.id,
      row.user_id,
      row.casa_id,
      row.observacoes,
      row.status,
      row.moderado_por,
      row.moderado_em ? new Date(row.moderado_em) : null,
      row.motivo_recusa,
      new Date(row.created_at),
    );
  }

  estaPendente(): boolean {
    return this.status === 'pendente';
  }

  podeSerAprovada(): boolean {
    return this.estaPendente();
  }
}
