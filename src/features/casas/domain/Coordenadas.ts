import { z } from 'zod';
import { DomainError } from '@/shared/lib/errors';

export const coordenadasSchema = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
});

export type CoordenadasInput = z.infer<typeof coordenadasSchema>;

export class Coordenadas {
  private constructor(
    readonly lat: number,
    readonly lng: number,
  ) {}

  static parse(raw: unknown): Coordenadas {
    const r = coordenadasSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'COORD_INVALIDA',
        r.error.issues[0]?.message ?? 'Coordenadas inválidas',
      );
    }
    return new Coordenadas(r.data.lat, r.data.lng);
  }

  /** Aceita pares vindos do banco (null/null ou number/number). */
  static deRow(lat: unknown, lng: unknown): Coordenadas | null {
    if (lat == null && lng == null) return null;
    return Coordenadas.parse({ lat, lng });
  }

  toString(): string {
    return `${this.lat.toFixed(6)},${this.lng.toFixed(6)}`;
  }

  equals(outra: Coordenadas): boolean {
    return this.lat === outra.lat && this.lng === outra.lng;
  }
}
