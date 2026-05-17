import { ServiceError } from '@/shared/lib/errors';
import type { CasasRepository } from '@/features/casas/api/CasasRepository';
import type { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';
import type { ReivindicacoesRepository } from '@/features/painel/api/ReivindicacoesRepository';
import type { GeocodingService } from '@/shared/lib/GeocodingService';
import type { Indicacao } from '@/features/indicacao/domain/Indicacao';

/**
 * Orquestra fluxos de moderação (escopo MVP §3.4).
 *
 * Indicação — 2 passos:
 *   1. aprovarIndicacao() → cria casa (pendente, indicacao). Invisível ao anon.
 *      Best-effort: tenta geocodar bairro+cidade+estado pra dar uma posição
 *      inicial no mapa. Falha silenciosa — admin/dirigente arruma depois.
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
    private readonly geocoding?: GeocodingService,
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

    // Best-effort: tenta geocoding pelo bairro/cidade pra a casa nascer com
    // pin no mapa. Falha silenciosa — admin pode editar coords no painel
    // depois (Fase 5) ou via SQL.
    await this.tentarGeocodar(casaId, indicacao);

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
   * Aprova um cadastro direto: lê quem criou (casas.criada_por), vincula
   * essa pessoa em casa_dirigentes como principal, e torna a casa pública.
   * A partir daqui Casa.estaVerificada() = true (fonte='proprio' + aprovada).
   *
   * Sem transação SQL: se vincular sucesso e aprovar falha, casa fica
   * pendente com dirigente vinculado. Admin reaplica → idempotente.
   */
  async aprovarCadastroDireto(
    casaId: string,
    admin: { userId: string },
  ): Promise<void> {
    const casa = await this.casas.findById(casaId);
    if (!casa) {
      throw new ServiceError('MOD_CASA_NAO_ENCONTRADA', `Casa ${casaId} não existe`);
    }
    if (casa.status !== 'pendente' || casa.fonte !== 'proprio') {
      throw new ServiceError(
        'MOD_CASA_NAO_ELEGIVEL',
        'Casa não está em cadastro direto pendente',
      );
    }
    if (!casa.criadaPor) {
      throw new ServiceError(
        'MOD_CASA_SEM_CRIADOR',
        'Cadastro sem criador rastreado — não dá pra vincular dirigência',
      );
    }

    const papel = casa.papelDirigenciaProposto?.trim() || null;
    await this.casas.vincularDirigente(casa.id, casa.criadaPor, 'principal', papel);
    await this.casas.aprovarCasaPendente(casa.id, admin);
  }

  /**
   * Recusa um cadastro direto. Status vira 'recusada'; motivo persistido
   * em `casas.motivo_recusa` quando informado (migration 0009).
   */
  async recusarCadastroDireto(
    casaId: string,
    admin: { userId: string },
    motivo: string | null = null,
  ): Promise<void> {
    const casa = await this.casas.findById(casaId);
    if (!casa) {
      throw new ServiceError('MOD_CASA_NAO_ENCONTRADA', `Casa ${casaId} não existe`);
    }
    if (casa.status !== 'pendente' || casa.fonte !== 'proprio') {
      throw new ServiceError(
        'MOD_CASA_NAO_ELEGIVEL',
        'Casa não está em cadastro direto pendente',
      );
    }
    await this.casas.recusarCasaPendente(casaId, admin, motivo);
  }

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

  private async tentarGeocodar(casaId: string, indicacao: Indicacao): Promise<void> {
    if (!this.geocoding) return;
    const partes = [indicacao.bairro, indicacao.cidade, indicacao.estado, 'Brasil']
      .filter((p): p is string => !!p && p.trim().length > 0);
    const consulta = partes.join(', ');
    if (consulta.length < 6) return;

    try {
      const r = await this.geocoding.buscar(consulta);
      if (!r) return;
      await this.casas.atualizarCoordenadas(
        casaId,
        r.coordenadas.lat,
        r.coordenadas.lng,
      );
    } catch {
      // Best-effort: rate limit, sem internet, etc. — admin arruma depois.
    }
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
