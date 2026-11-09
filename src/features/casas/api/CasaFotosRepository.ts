import { z } from 'zod';
import type { ApiClient } from '@/shared/lib/ApiClient';

/** Espelha o limite da API (que é quem garante); aqui só pra UI avisar antes. */
export const MAX_FOTOS_POR_CASA = 5;

export interface CasaFotoView {
  id: string;
  casaId: string;
  url: string;
  ordem: number;
}

const fotoSchema = z.object({
  id: z.string().uuid(),
  casaId: z.string().uuid(),
  url: z.string().url(),
  ordem: z.number().int(),
});

/**
 * Fotos da casa. O browser comprime antes (compressaoFoto); a API recomprime
 * em WebP, tira EXIF/GPS e guarda no disco.
 */
export class CasaFotosRepository {
  constructor(private readonly api: ApiClient) {}

  async listarDaCasa(casaId: string): Promise<CasaFotoView[]> {
    return z.array(fotoSchema).parse(await this.api.get(`/casas/${casaId}/fotos`));
  }

  async contar(casaId: string): Promise<number> {
    return (await this.listarDaCasa(casaId)).length;
  }

  async adicionar(input: {
    casaId: string;
    blob: Blob;
    contentType: string;
    nomeOriginal: string;
  }): Promise<CasaFotoView> {
    const data = await this.api.enviarArquivo(`/casas/${input.casaId}/fotos`, input.blob, input.nomeOriginal);
    return fotoSchema.parse(data);
  }

  async remover(foto: Pick<CasaFotoView, 'id'>): Promise<void> {
    await this.api.delete(`/fotos/${foto.id}`);
  }
}
