import { z } from 'zod';
import { ServiceError } from './errors';
import { Coordenadas } from '@/features/casas/domain/Coordenadas';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';

const respostaSchema = z.array(
  z.object({
    lat: z.string(),
    lon: z.string(),
    display_name: z.string(),
  }),
);

export interface ResultadoGeocoding {
  coordenadas: Coordenadas;
  rotulo: string;
}

/**
 * Wrapper de Nominatim (OSM). Respeita o Acceptable Use Policy:
 *   - User-Agent identificável
 *   - Máx ~1 req/s (caller orquestra; aqui só serializo via fila simples)
 *   - Sem retry agressivo: erro é erro.
 */
export class GeocodingService {
  private ultimoChamado = 0;
  private static readonly INTERVALO_MIN_MS = 1100;

  constructor(
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly userAgent: string = 'encruza/0.0 (contato@encruza.app)',
  ) {}

  async buscar(consulta: string): Promise<ResultadoGeocoding | null> {
    const c = consulta.trim();
    if (c.length < 3) return null;

    await this.respeitarRateLimit();

    const url = new URL(NOMINATIM_BASE);
    url.searchParams.set('q', c);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'br');

    let resp: Response;
    try {
      resp = await this.fetchImpl(url.toString(), {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
        },
      });
    } catch (e) {
      throw new ServiceError('GEOCODING_REDE', 'Falha de rede ao consultar Nominatim', {
        cause: e,
      });
    }

    if (resp.status === 429) {
      throw new ServiceError('GEOCODING_RATE_LIMITED', 'Rate limit do Nominatim atingido');
    }
    if (!resp.ok) {
      throw new ServiceError('GEOCODING_HTTP', `Nominatim respondeu ${resp.status}`);
    }

    const json = await resp.json();
    const parsed = respostaSchema.safeParse(json);
    if (!parsed.success || parsed.data.length === 0) return null;

    const primeiro = parsed.data[0]!;
    const lat = Number.parseFloat(primeiro.lat);
    const lng = Number.parseFloat(primeiro.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return {
      coordenadas: Coordenadas.parse({ lat, lng }),
      rotulo: primeiro.display_name,
    };
  }

  private async respeitarRateLimit(): Promise<void> {
    const agora = Date.now();
    const desde = agora - this.ultimoChamado;
    if (desde < GeocodingService.INTERVALO_MIN_MS) {
      await new Promise((r) => setTimeout(r, GeocodingService.INTERVALO_MIN_MS - desde));
    }
    this.ultimoChamado = Date.now();
  }
}
