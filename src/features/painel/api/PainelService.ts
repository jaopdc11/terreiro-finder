import { ServiceError } from '@/shared/lib/errors';
import type {
  CasasPainelRepository,
  PerfilCasaInput,
} from '@/features/casas/api/CasasPainelRepository';
import type { CasaUmbandaRepository } from '@/features/casas/api/CasaUmbandaRepository';
import type { BlocoUmbandaInput } from '@/features/casas/domain/BlocoUmbanda';
import type { PerfilAbertura } from '@/features/casas/domain/PerfilAbertura';

/**
 * Orquestra escritas do painel do dirigente. Cada método é uma "intenção"
 * com nome de domínio.
 *
 * Atomicidade: não temos transação SQL através do PostgREST. Em caso de
 * falha entre passos, o admin (ou o próprio dirigente) re-salva. O risco é
 * pequeno porque os passos são UPDATEs idempotentes em tabelas distintas.
 */
export class PainelService {
  constructor(
    private readonly casas: CasasPainelRepository,
    private readonly umbanda: CasaUmbandaRepository,
  ) {}

  async salvarPerfil(casaId: string, input: PerfilCasaInput): Promise<void> {
    await this.casas.atualizarPerfil(casaId, input);
  }

  async salvarAbertura(casaId: string, perfil: PerfilAbertura): Promise<void> {
    await this.casas.atualizarAbertura(casaId, perfil);
  }

  /** Salva o bloco específico da tradição. Por ora só Umbanda no MVP. */
  async salvarBlocoUmbanda(casaId: string, input: BlocoUmbandaInput): Promise<void> {
    const casa = await this.casas.buscarPorId(casaId);
    if (!casa) {
      throw new ServiceError('PAINEL_CASA_NAO_ENCONTRADA', `Casa ${casaId} não existe`);
    }
    if (casa.tradicaoPrincipal !== 'umbanda') {
      throw new ServiceError(
        'PAINEL_TRADICAO_INCOMPATIVEL',
        'Bloco Umbanda só vale pra casas com tradição Umbanda.',
      );
    }
    await this.umbanda.upsert(casaId, input);
  }
}
