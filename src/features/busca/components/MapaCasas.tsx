import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import type { Casa } from '@/features/casas/domain/Casa';
import { BadgesAbertura } from '@/features/casas/components/BadgesAbertura';
import { pinNaoVerificada, pinVerificada } from './PinIcons';

const CENTRO_ITAJAI: [number, number] = [-26.9078, -48.6614];

interface Props {
  casas: ReadonlyArray<Casa>;
}

export function MapaCasas({ casas }: Props) {
  const comCoord = useMemo(() => casas.filter((c) => c.coordenadas !== null), [casas]);

  return (
    <MapContainer
      center={CENTRO_ITAJAI}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
      // Necessário pra leitor de tela e teste a11y; Leaflet não expõe role nativo.
      aria-label="Mapa com casas"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {comCoord.map((casa) => {
        const c = casa.coordenadas!;
        return (
          <Marker
            key={casa.id}
            position={[c.lat, c.lng]}
            icon={casa.estaVerificada() ? pinVerificada : pinNaoVerificada}
          >
            <Popup>
              <article className="min-w-[220px] space-y-2">
                <header>
                  <h3 className="font-display text-lg leading-tight">{casa.nome}</h3>
                  <p className="text-xs text-muted-foreground">
                    {casa.tradicaoPrincipal}
                    {casa.bairro ? ` · ${casa.bairro}` : ''}
                  </p>
                </header>
                {casa.sacerdoteNome ? (
                  <p className="text-sm">com {casa.sacerdoteNome}</p>
                ) : null}
                <BadgesAbertura casa={casa} />
                <Link
                  to={`/casa/${casa.slug.toString()}`}
                  className="inline-block rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:opacity-90"
                >
                  Ver detalhes
                </Link>
              </article>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
