import { ServiceError } from '@/shared/lib/errors';
import type {
  CasasPainelRepository,
  EnderecoCasaInput,
  PerfilCasaInput,
} from '@/features/casas/api/CasasPainelRepository';
import type { CasaUmbandaRepository } from '@/features/casas/api/CasaUmbandaRepository';
import type { CasaCandombleRepository } from '@/features/casas/api/CasaCandombleRepository';
import type { CasaQuimbandaRepository } from '@/features/casas/api/CasaQuimbandaRepository';
import type { BlocoUmbandaInput } from '@/features/casas/domain/BlocoUmbanda';
import type { BlocoCandombleInput } from '@/features/casas/domain/BlocoCandomble';
import type { BlocoQuimbandaInput } from '@/features/casas/domain/BlocoQuimbanda';
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
    private readonly candomble: CasaCandombleRepository,
    private readonly quimbanda: CasaQuimbandaRepository,
  ) {}

  async salvarPerfil(casaId: string, input: PerfilCasaInput): Promise<void> {
    await this.casas.atualizarPerfil(casaId, input);
  }

  async salvarAbertura(casaId: string, perfil: PerfilAbertura): Promise<void> {
    await this.casas.atualizarAbertura(casaId, perfil);
  }

  async salvarEndereco(casaId: string, input: EnderecoCasaInput): Promise<void> {
    if (!input.cidade.trim() || !input.estado.trim()) {
      throw new ServiceError(
        'PAINEL_ENDERECO_OBRIGATORIO',
        'Cidade e estado são obrigatórios.',
      );
    }
    if ((input.coordLat == null) !== (input.coordLng == null)) {
      throw new ServiceError(
        'PAINEL_COORDS_PARCIAIS',
        'Informe latitude E longitude — ou deixe ambas em branco.',
      );
    }
    await this.casas.atualizarEndereco(casaId, input);
  }

  /** Salva o bloco específico da tradição Umbanda. */
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

  async salvarBlocoCandomble(
    casaId: string,
    input: BlocoCandombleInput,
  ): Promise<void> {
    const casa = await this.casas.buscarPorId(casaId);
    if (!casa) {
      throw new ServiceError('PAINEL_CASA_NAO_ENCONTRADA', `Casa ${casaId} não existe`);
    }
    if (casa.tradicaoPrincipal !== 'candomble') {
      throw new ServiceError(
        'PAINEL_TRADICAO_INCOMPATIVEL',
        'Bloco Candomblé só vale pra casas com tradição Candomblé.',
      );
    }
    await this.candomble.upsert(casaId, input);
  }

  async salvarBlocoQuimbanda(
    casaId: string,
    input: BlocoQuimbandaInput,
  ): Promise<void> {
    const casa = await this.casas.buscarPorId(casaId);
    if (!casa) {
      throw new ServiceError('PAINEL_CASA_NAO_ENCONTRADA', `Casa ${casaId} não existe`);
    }
    if (casa.tradicaoPrincipal !== 'quimbanda') {
      throw new ServiceError(
        'PAINEL_TRADICAO_INCOMPATIVEL',
        'Bloco Quimbanda só vale pra casas com tradição Quimbanda.',
      );
    }
    await this.quimbanda.upsert(casaId, input);
  }
}
