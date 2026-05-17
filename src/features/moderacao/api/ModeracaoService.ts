import { ServiceError } from '@/shared/lib/errors';
import type { CasasRepository } from '@/features/casas/api/CasasRepository';
import type { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';
import type { ReivindicacoesRepository } from '@/features/painel/api/ReivindicacoesRepository';

/**
 * Orquestra fluxos de moderação (escopo MVP §3.4).
 *
 * Indicação — 2 passos:
 *   1. aprovarIndicacao() → cria casa (pendente, indicacao). Invisível ao anon.
 *   2. confirmarConsentimento() → casa vira aprovada (visível como "indicada,
 *      não verificada").
 *
 * Reivindicação — contato cruzado:
 *   aprovarReivindicacao() → admin contatou a casa via canal registrado
 *   originalmente; com OK, vincula user em casa_dirigentes e muda
 *   casas.fonte pra 'reivindicada' (casa passa a estar verificada).
 */
export class ModeracaoService {
  constructor(
    private readonly indicacoes: IndicacoesRepository,
    private readonly casas: CasasRepository,
    private readonly reivindicacoes?: ReivindicacoesRepository,
  ) {}

  async aprovarIndicacao(
    indicacaoId: string,
    admin: { userId: string },
  ): Promise<{ casaId: string }> {
    const indicacao = await this.indicacoes.buscarPorId(indicacaoId);
    if (!indicacao) {
      throw new ServiceError(
        'MOD_INDICACAO_NAO_ENCONTRADA',
        `Indicação ${indicacaoId} não existe`,
      );
    }
    if (!indicacao.estaPendente()) {
      throw new ServiceError('MOD_INDICACAO_NAO_PENDENTE', 'Indicação já foi moderada');
    }

    const payload = indicacao.paraNovaCasa(slugInicial(indicacao));
    const casaId = await this.casas.criarDeIndicacao(payload);
    await this.indicacoes.marcarAprovada(indicacao.id, casaId, admin.userId);

    return { casaId };
  }

  async confirmarConsentimento(
    casaId: string,
    admin: { userId: string },
  ): Promise<void> {
    await this.casas.aprovarCasaPendente(casaId, admin);
  }

  async recusarIndicacao(
    indicacaoId: string,
    motivo: string,
    admin: { userId: string },
  ): Promise<void> {
    if (motivo.trim().length < 3) {
      throw new ServiceError(
        'MOD_MOTIVO_OBRIGATORIO',
        'Diz o motivo da recusa (pelo menos 3 caracteres)',
      );
    }
    const i = await this.indicacoes.buscarPorId(indicacaoId);
    if (!i) {
      throw new ServiceError(
        'MOD_INDICACAO_NAO_ENCONTRADA',
        `Indicação ${indicacaoId} não existe`,
      );
    }
    if (!i.estaPendente()) {
      throw new ServiceError('MOD_INDICACAO_NAO_PENDENTE', 'Indicação já foi moderada');
    }
    await this.indicacoes.marcarRecusada(indicacaoId, motivo.trim(), admin.userId);
  }

  /**
   * Reivindicação: aprovação após contato cruzado. Em sequência (sem
   * transação SQL — basta o admin re-executar se algum passo falhar):
   *   1. Vínculo user → casa em casa_dirigentes (papel principal).
   *   2. casas.fonte = 'reivindicada' (Casa.estaVerificada vira true).
   *   3. reivindicacao.status = 'aprovada' + moderado_por/em.
   */
  async aprovarReivindicacao(
    reivindicacaoId: string,
    admin: { userId: string },
  ): Promise<void> {
    if (!this.reivindicacoes) {
      throw new ServiceError(
        'MOD_REIVINDICACOES_INDISPONIVEIS',
        'ReivindicacoesRepository não injetado',
      );
    }
    const r = await this.reivindicacoes.buscarPorId(reivindicacaoId);
    if (!r) {
      throw new ServiceError(
        'MOD_REIVINDICACAO_NAO_ENCONTRADA',
        `Reivindicação ${reivindicacaoId} não existe`,
      );
    }
    if (!r.podeSerAprovada()) {
      throw new ServiceError(
        'MOD_REIVINDICACAO_NAO_PENDENTE',
        'Reivindicação já foi moderada',
      );
    }

    await this.casas.vincularDirigente(r.casaId, r.userId, 'principal');
    await this.casas.marcarComoReivindicada(r.casaId);
    await this.reivindicacoes.marcarAprovada(r.id, admin.userId);
  }

  async recusarReivindicacao(
    reivindicacaoId: string,
    motivo: string,
    admin: { userId: string },
  ): Promise<void> {
    if (!this.reivindicacoes) {
      throw new ServiceError(
        'MOD_REIVINDICACOES_INDISPONIVEIS',
        'ReivindicacoesRepository não injetado',
      );
    }
    if (motivo.trim().length < 3) {
      throw new ServiceError(
        'MOD_MOTIVO_OBRIGATORIO',
        'Diz o motivo da recusa (pelo menos 3 caracteres)',
      );
    }
    const r = await this.reivindicacoes.buscarPorId(reivindicacaoId);
    if (!r) {
      throw new ServiceError(
        'MOD_REIVINDICACAO_NAO_ENCONTRADA',
        `Reivindicação ${reivindicacaoId} não existe`,
      );
    }
    if (!r.podeSerAprovada()) {
      throw new ServiceError(
        'MOD_REIVINDICACAO_NAO_PENDENTE',
        'Reivindicação já foi moderada',
      );
    }
    await this.reivindicacoes.marcarRecusada(reivindicacaoId, motivo.trim(), admin.userId);
  }
}

function slugInicial(indicacao: { nome: string }): string {
  return indicacao.nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
