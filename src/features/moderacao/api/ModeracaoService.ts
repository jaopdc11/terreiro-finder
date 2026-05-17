import { ServiceError } from '@/shared/lib/errors';
import type { CasasRepository } from '@/features/casas/api/CasasRepository';
import type { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';

/**
 * Orquestra o fluxo de moderação em 2 passos (escopo MVP §3.4).
 *
 *   Passo 1 — aprovarIndicacao(): cria casa com status=pendente e fonte=indicacao.
 *             A casa ainda NÃO é pública (RLS bloqueia anon).
 *   Passo 2 — confirmarConsentimento(): admin contatou a casa via canalContato,
 *             registrou o canal usado e a casa autorizou. A casa vira aprovada
 *             — agora visível no mapa como "indicada, não verificada".
 *
 * Recusar marca a indicação como recusada com motivo. Adiar é no-op.
 */
export class ModeracaoService {
  constructor(
    private readonly indicacoes: IndicacoesRepository,
    private readonly casas: CasasRepository,
  ) {}

  async aprovarIndicacao(indicacaoId: string, admin: { userId: string }): Promise<{ casaId: string }> {
    const indicacao = await this.indicacoes.buscarPorId(indicacaoId);
    if (!indicacao) {
      throw new ServiceError('MOD_INDICACAO_NAO_ENCONTRADA', `Indicação ${indicacaoId} não existe`);
    }
    if (!indicacao.estaPendente()) {
      throw new ServiceError('MOD_INDICACAO_NAO_PENDENTE', 'Indicação já foi moderada');
    }

    // 1) Cria casa (pendente, indicacao) — repository resolve slug em cascata.
    const payload = indicacao.paraNovaCasa(slugInicial(indicacao));
    const casaId = await this.casas.criarDeIndicacao(payload);

    // 2) Marca indicação como aprovada vinculada à casa.
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
      throw new ServiceError('MOD_MOTIVO_OBRIGATORIO', 'Diz o motivo da recusa (pelo menos 3 caracteres)');
    }
    const i = await this.indicacoes.buscarPorId(indicacaoId);
    if (!i) {
      throw new ServiceError('MOD_INDICACAO_NAO_ENCONTRADA', `Indicação ${indicacaoId} não existe`);
    }
    if (!i.estaPendente()) {
      throw new ServiceError('MOD_INDICACAO_NAO_PENDENTE', 'Indicação já foi moderada');
    }
    await this.indicacoes.marcarRecusada(indicacaoId, motivo.trim(), admin.userId);
  }
}

function slugInicial(indicacao: { nome: string }): string {
  // Slug bruto que o repository usará como ponto de partida pra cascata.
  // O Indicacao.paraNovaCasa exige um slug válido; o repo descobre se já existe
  // e itera (kebab(nome) → kebab(nome)-kebab(bairro) → -2, -3, ...).
  // Aqui usamos kebab(nome). O Slug VO valida.
  return indicacao.nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
