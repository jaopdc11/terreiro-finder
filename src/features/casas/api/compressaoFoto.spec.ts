import { describe, expect, it, vi } from 'vitest';
import { ServiceError } from '@/shared/lib/errors';

// Mocka o módulo pesado — testar o algoritmo de compressão real exige canvas
// no jsdom, fora do escopo. Aqui validamos o wrapper: contrato, parâmetros
// passados, tratamento de erro.
vi.mock('browser-image-compression', () => ({
  default: vi.fn(async (file: File, opts: Record<string, unknown>) => {
    if ((opts as { __force_fail?: boolean }).__force_fail) {
      throw new Error('boom');
    }
    // Simula resultado menor que o original.
    return new File([new Uint8Array(file.size / 2)], file.name, { type: file.type });
  }),
}));

const { comprimirFoto } = await import('./compressaoFoto');
const imageCompression = (await import('browser-image-compression')).default;

function fakeImage(name = 'foto.jpg', sizeBytes = 5_000_000): File {
  return new File([new Uint8Array(sizeBytes)], name, { type: 'image/jpeg' });
}

describe('comprimirFoto', () => {
  it('retorna blob comprimido com metadata', async () => {
    const file = fakeImage();
    const r = await comprimirFoto(file);
    expect(r.tamanhoOriginalBytes).toBe(5_000_000);
    expect(r.tamanhoFinalBytes).toBeLessThan(r.tamanhoOriginalBytes);
    expect(r.nomeOriginal).toBe('foto.jpg');
    expect(r.blob).toBeInstanceOf(Blob);
  });

  it('passa configs corretas pro browser-image-compression', async () => {
    await comprimirFoto(fakeImage());
    expect(imageCompression).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        preserveExif: true,
      }),
    );
  });

  it('rejeita arquivo que não é imagem', async () => {
    const pdf = new File([new Uint8Array(100)], 'doc.pdf', { type: 'application/pdf' });
    await expect(comprimirFoto(pdf)).rejects.toThrow(ServiceError);
  });

  it('encapsula erro do compressor em ServiceError', async () => {
    const mock = vi.mocked(imageCompression);
    mock.mockImplementationOnce(async () => {
      throw new Error('boom');
    });
    await expect(comprimirFoto(fakeImage())).rejects.toThrow(ServiceError);
  });
});
