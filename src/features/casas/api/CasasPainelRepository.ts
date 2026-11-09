import { z } from 'zod';
import type { ApiClient } from '@/shared/lib/ApiClient';
import type { Casa } from '../domain/Casa';
import type { PerfilAbertura } from '../domain/PerfilAbertura';
import { casaDaApi, nuloSe404 } from './CasasRepository';

export interface PerfilCasaInput {
  descricao: string | null;
  sacerdoteNome: string | null;
  textoAntesVisita: string | null;
  whatsapp: string | null;
  telefone: string | null;
  emailContato: string | null;
  site: string | null;
}

export interface EnderecoCasaInput {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string;
  estado: string;
  cep: string | null;
  coordLat: number | null;
  coordLng: number | null;
}

/** Casas do painel do dirigente. A API exige que o usuário gere a casa. */
export class CasasPainelRepository {
  constructor(private readonly api: ApiClient) {}

  /** Casas em que o usuário logado é dirigente (a API sabe quem é pelo cookie). */
  async minhasCasas(): Promise<Casa[]> {
    const data = await this.api.get('/minhas-casas');
    return z.array(z.unknown()).parse(data).map(casaDaApi);
  }

  async buscarPorId(casaId: string): Promise<Casa | null> {
    return nuloSe404(async () => casaDaApi(await this.api.get(`/casas/${casaId}`)));
  }

  async atualizarPerfil(casaId: string, input: PerfilCasaInput): Promise<void> {
    await this.api.put(`/casas/${casaId}/perfil`, input);
  }

  async atualizarEndereco(casaId: string, input: EnderecoCasaInput): Promise<void> {
    await this.api.put(`/casas/${casaId}/endereco`, input);
  }

  async atualizarAbertura(casaId: string, perfil: PerfilAbertura): Promise<void> {
    await this.api.put(`/casas/${casaId}/abertura`, {
      enderecoVisibilidade: perfil.enderecoVisibilidade,
      aceitaVisitantes: perfil.aceitaVisitantes,
      fotoRegistro: perfil.fotoRegistro,
    });
  }
}
