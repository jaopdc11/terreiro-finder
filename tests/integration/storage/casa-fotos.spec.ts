import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SupabaseTestHarness } from '../../setup/SupabaseTestHarness';
import {
  CasaFotosRepository,
  MAX_FOTOS_POR_CASA,
} from '@/features/casas/api/CasaFotosRepository';

const PREFIX = 'storage-fotos+';
const BUCKET = 'casa-fotos';

// 1x1 PNG transparente (mínimo válido)
function pngTransparente(): Uint8Array {
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
}

describe('Storage · casa-fotos (integração)', () => {
  const harness = new SupabaseTestHarness();
  let dirigenteId = '';
  let casaId = '';

  beforeAll(async () => {
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
    const d = await harness.criarUsuario({
      email: `${PREFIX}dirigente@test.local`,
      senha: 'senhaforte',
      role: 'dirigente',
    });
    dirigenteId = d.id;
    await harness.criarUsuario({
      email: `${PREFIX}outro@test.local`,
      senha: 'senhaforte',
    });

    const { data, error } = await harness.admin
      .from('casas')
      .insert({
        slug: `storage-fotos-${Date.now()}`,
        nome: 'Casa Fotos [STORAGE-TEST]',
        tradicao_principal: 'umbanda',
        status: 'aprovada',
        fonte: 'proprio',
        cidade: 'Itajaí',
        estado: 'SC',
      })
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error('criar casa');
    casaId = data.id;

    await harness.admin.from('casa_dirigentes').insert({
      casa_id: casaId,
      user_id: dirigenteId,
      papel: 'principal',
    });
  });

  afterAll(async () => {
    // Limpa rows + objetos do storage com path da casa
    await harness.admin.from('casa_fotos').delete().eq('casa_id', casaId);
    const { data: itens } = await harness.admin.storage.from(BUCKET).list(casaId);
    if (itens && itens.length > 0) {
      await harness.admin.storage
        .from(BUCKET)
        .remove(itens.map((i) => `${casaId}/${i.name}`));
    }
    await harness.admin.from('casa_dirigentes').delete().eq('casa_id', casaId);
    await harness.admin.from('casas').delete().eq('id', casaId);
    await harness.removerUsuariosPorEmailPrefix(PREFIX);
  });

  beforeEach(async () => {
    await harness.admin.from('casa_fotos').delete().eq('casa_id', casaId);
    const { data: itens } = await harness.admin.storage.from(BUCKET).list(casaId);
    if (itens && itens.length > 0) {
      await harness.admin.storage
        .from(BUCKET)
        .remove(itens.map((i) => `${casaId}/${i.name}`));
    }
  });

  function blobPng(): Blob {
    // Cast pra ArrayBuffer porque o TS strict no Node 22 distingue
    // SharedArrayBuffer de ArrayBuffer no Uint8Array genérico.
    return new Blob([pngTransparente().buffer as ArrayBuffer], { type: 'image/png' });
  }

  it('dirigente da casa adiciona foto e ela vira pública', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    const repo = new CasaFotosRepository(cli);

    const foto = await repo.adicionar({
      casaId,
      blob: blobPng(),
      contentType: 'image/png',
      nomeOriginal: 'capa.png',
    });
    expect(foto.url).toContain('/storage/v1/object/public/casa-fotos/');
    expect(foto.path.startsWith(`${casaId}/`)).toBe(true);

    const lista = await repo.listarDaCasa(casaId);
    expect(lista).toHaveLength(1);
    expect(lista[0]?.url).toBe(foto.url);
  });

  it('outro usuário não consegue fazer upload na casa alheia', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}outro@test.local`,
      'senhaforte',
    );
    const repo = new CasaFotosRepository(cli);

    await expect(
      repo.adicionar({
        casaId,
        blob: blobPng(),
        contentType: 'image/png',
        nomeOriginal: 'invasor.png',
      }),
    ).rejects.toThrow();
  });

  it('anônimo lê fotos (leitura pública)', async () => {
    // Admin cria 1 foto pra existir conteúdo
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    const repo = new CasaFotosRepository(cli);
    await repo.adicionar({
      casaId,
      blob: blobPng(),
      contentType: 'image/png',
      nomeOriginal: 'a.png',
    });

    const anonRepo = new CasaFotosRepository(harness.anon());
    const lista = await anonRepo.listarDaCasa(casaId);
    expect(lista).toHaveLength(1);
  });

  it('limite de MAX_FOTOS_POR_CASA é respeitado', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    const repo = new CasaFotosRepository(cli);

    for (let i = 0; i < MAX_FOTOS_POR_CASA; i++) {
      await repo.adicionar({
        casaId,
        blob: blobPng(),
        contentType: 'image/png',
        nomeOriginal: `foto-${i}.png`,
      });
    }

    await expect(
      repo.adicionar({
        casaId,
        blob: blobPng(),
        contentType: 'image/png',
        nomeOriginal: 'excedente.png',
      }),
    ).rejects.toThrow(/Limite/i);
  });

  it('dirigente remove a própria foto', async () => {
    const cli = await harness.authedClientFor(
      `${PREFIX}dirigente@test.local`,
      'senhaforte',
    );
    const repo = new CasaFotosRepository(cli);

    const f = await repo.adicionar({
      casaId,
      blob: blobPng(),
      contentType: 'image/png',
      nomeOriginal: 'temp.png',
    });
    await repo.remover(f);

    const lista = await repo.listarDaCasa(casaId);
    expect(lista).toHaveLength(0);
  });
});
