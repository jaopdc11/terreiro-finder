import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';

const BUCKET = 'casa-fotos';
export const MAX_FOTOS_POR_CASA = 5;

export interface CasaFotoView {
  id: string;
  casaId: string;
  url: string;
  ordem: number;
  path: string;
}

interface FotoRow {
  id: string;
  casa_id: string;
  url: string;
  ordem: number;
}

/**
 * Storage + tabela casa_fotos. O bucket é público pra leitura; INSERT/DELETE
 * exigem dirigente da casa (RLS no storage usa o primeiro segmento do path
 * como casa_id — convenção `<casa_id>/<arquivo>`).
 */
export class CasaFotosRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listarDaCasa(casaId: string): Promise<CasaFotoView[]> {
    const { data, error } = await this.client
      .from('casa_fotos')
      .select('id, casa_id, url, ordem')
      .eq('casa_id', casaId)
      .order('ordem', { ascending: true });
    if (error) {
      throw new RepositoryError('CASA_FOTOS_LIST_FALHOU', error.message, { cause: error });
    }
    return (data ?? []).map((r: FotoRow) => ({
      id: r.id,
      casaId: r.casa_id,
      url: r.url,
      ordem: r.ordem,
      path: pathDaUrl(r.url),
    }));
  }

  async contar(casaId: string): Promise<number> {
    const { count, error } = await this.client
      .from('casa_fotos')
      .select('id', { count: 'exact', head: true })
      .eq('casa_id', casaId);
    if (error) {
      throw new RepositoryError('CASA_FOTOS_COUNT_FALHOU', error.message, { cause: error });
    }
    return count ?? 0;
  }

  /**
   * Faz upload do blob pro Storage + grava row em casa_fotos. Lança se já
   * houver MAX_FOTOS_POR_CASA na casa.
   */
  async adicionar(input: {
    casaId: string;
    blob: Blob;
    contentType: string;
    nomeOriginal: string;
  }): Promise<CasaFotoView> {
    const total = await this.contar(input.casaId);
    if (total >= MAX_FOTOS_POR_CASA) {
      throw new RepositoryError(
        'CASA_FOTOS_LIMITE',
        `Limite de ${MAX_FOTOS_POR_CASA} fotos por casa atingido. Remova alguma antes.`,
      );
    }

    const ext = extensaoDe(input.nomeOriginal) ?? extensaoDeMime(input.contentType) ?? 'jpg';
    const path = `${input.casaId}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;

    const { error: upErr } = await this.client.storage
      .from(BUCKET)
      .upload(path, input.blob, { contentType: input.contentType, upsert: false });
    if (upErr) {
      throw new RepositoryError('CASA_FOTOS_UPLOAD_FALHOU', upErr.message, { cause: upErr });
    }

    const { data: pub } = this.client.storage.from(BUCKET).getPublicUrl(path);
    const proximaOrdem = total;

    const { data: row, error: insErr } = await this.client
      .from('casa_fotos')
      .insert({
        casa_id: input.casaId,
        url: pub.publicUrl,
        ordem: proximaOrdem,
      })
      .select('id, casa_id, url, ordem')
      .single();
    if (insErr || !row) {
      // Rollback do upload pra não ficar foto órfã.
      await this.client.storage.from(BUCKET).remove([path]).catch(() => {});
      throw new RepositoryError('CASA_FOTOS_DB_INSERT_FALHOU', insErr?.message ?? 'sem retorno', {
        cause: insErr,
      });
    }

    return {
      id: row.id,
      casaId: row.casa_id,
      url: row.url,
      ordem: row.ordem,
      path,
    };
  }

  async remover(foto: CasaFotoView): Promise<void> {
    const { error: storageErr } = await this.client.storage
      .from(BUCKET)
      .remove([foto.path]);
    if (storageErr) {
      throw new RepositoryError('CASA_FOTOS_STORAGE_REMOVE_FALHOU', storageErr.message, {
        cause: storageErr,
      });
    }
    const { error: dbErr } = await this.client.from('casa_fotos').delete().eq('id', foto.id);
    if (dbErr) {
      throw new RepositoryError('CASA_FOTOS_DB_DELETE_FALHOU', dbErr.message, {
        cause: dbErr,
      });
    }
  }
}

function pathDaUrl(url: string): string {
  // Extrai a parte depois do bucket name no URL público do Supabase Storage.
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return url;
  return url.slice(i + marker.length);
}

function extensaoDe(nome: string): string | null {
  const m = /\.([a-z0-9]+)$/i.exec(nome);
  return m ? m[1]!.toLowerCase() : null;
}

function extensaoDeMime(mime: string): string | null {
  const m = /^image\/([a-z0-9]+)$/i.exec(mime);
  if (!m) return null;
  const v = m[1]!.toLowerCase();
  return v === 'jpeg' ? 'jpg' : v;
}
