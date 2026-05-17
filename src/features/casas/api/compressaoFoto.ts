import imageCompression from 'browser-image-compression';
import { ServiceError } from '@/shared/lib/errors';

const MAX_MB = 1;
const MAX_DIMENSAO = 1600;

export interface FotoComprimida {
  blob: Blob;
  nomeOriginal: string;
  tamanhoOriginalBytes: number;
  tamanhoFinalBytes: number;
}

/**
 * Comprime imagem client-side antes de mandar pro Storage.
 *   - Alvo: <= 1 MB pós-compressão
 *   - Lado maior: <= 1600 px
 *   - Preserva orientação EXIF (browser-image-compression cuida disso)
 *
 * Lança ServiceError em formato não suportado ou falha de compressão.
 */
export async function comprimirFoto(file: File): Promise<FotoComprimida> {
  if (!file.type.startsWith('image/')) {
    throw new ServiceError(
      'FOTO_FORMATO_INVALIDO',
      `Formato não suportado: ${file.type || 'desconhecido'}`,
    );
  }

  let comprimido: File;
  try {
    comprimido = await imageCompression(file, {
      maxSizeMB: MAX_MB,
      maxWidthOrHeight: MAX_DIMENSAO,
      useWebWorker: true,
      preserveExif: true,
    });
  } catch (e) {
    throw new ServiceError('FOTO_COMPRESSAO_FALHOU', 'Falhou ao comprimir a imagem', {
      cause: e,
    });
  }

  return {
    blob: comprimido,
    nomeOriginal: file.name,
    tamanhoOriginalBytes: file.size,
    tamanhoFinalBytes: comprimido.size,
  };
}
