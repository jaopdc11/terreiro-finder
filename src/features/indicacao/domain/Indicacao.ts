import { DomainError } from '@/shared/lib/errors';
import { Slug } from '@/features/casas/domain/Slug';
import type { TradicaoPrincipal } from '@/features/casas/schemas';
import { indicacaoRowSchema, type IndicacaoRow, type ModeracaoStatus } from '../schemas';

/**
 * Payload pra criar uma `Casa` a partir de uma indicação aprovada.
 * Status nasce como `pendente` (mesmo após aprovação da indicação, a casa só
 * vira pública após confirmação do consentimento — 06-modelo-dados.md §7.3).
 */
export interface NovaCasaDeIndicacao {
  slug: string;
  nome: string;
  tradicao_principal: TradicaoPrincipal;
  cidade: string;
  estado: string;
  bairro: string | null;
  status: 'pendente';
  fonte: 'indicacao';
  endereco_visibilidade: 'sob_contato';
  aceita_visitantes: 'jogo_previo';
}

export class Indicacao {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly nome: string,
    readonly cidade: string,
    readonly estado: string,
    readonly bairro: string | null,
    readonly tradicaoPrincipal: TradicaoPrincipal | null,
    readonly observacoes: string | null,
    readonly canalContato: string | null,
    readonly status: ModeracaoStatus,
    readonly casaId: string | null,
    readonly moderadoPor: string | null,
    readonly moderadoEm: Date | null,
    readonly motivoRecusa: string | null,
    readonly createdAt: Date,
  ) {}

  static fromRow(raw: unknown): Indicacao {
    const r = indicacaoRowSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'INDICACAO_ROW_INVALIDA',
        `Row de indicação inválida: ${r.error.issues[0]?.message ?? 'erro'}`,
        { cause: r.error },
      );
    }
    const row: IndicacaoRow = r.data;
    return new Indicacao(
      row.id,
      row.user_id,
      row.nome,
      row.cidade,
      row.estado,
      row.bairro,
      row.tradicao_principal,
      row.observacoes,
      row.canal_contato,
      row.status,
      row.casa_id,
      row.moderado_por,
      row.moderado_em ? new Date(row.moderado_em) : null,
      row.motivo_recusa,
      new Date(row.created_at),
    );
  }

  estaPendente(): boolean {
    return this.status === 'pendente';
  }

  /**
   * Constrói payload pra criação da casa quando o admin aprova a indicação
   * (passo 1 da moderação). Slug é gerado por cascata fora daqui — o
   * Repository tentará `kebab(nome)`, depois `kebab(nome)-kebab(bairro)`.
   */
  paraNovaCasa(slugFinal: string): NovaCasaDeIndicacao {
    if (!this.tradicaoPrincipal) {
      throw new DomainError(
        'INDICACAO_SEM_TRADICAO',
        'Indicação precisa de tradição_principal pra virar casa. Edite a indicação antes de aprovar.',
      );
    }
    Slug.parse(slugFinal);
    return {
      slug: slugFinal,
      nome: this.nome,
      tradicao_principal: this.tradicaoPrincipal,
      cidade: this.cidade,
      estado: this.estado,
      bairro: this.bairro,
      status: 'pendente',
      fonte: 'indicacao',
      endereco_visibilidade: 'sob_contato',
      aceita_visitantes: 'jogo_previo',
    };
  }
}
