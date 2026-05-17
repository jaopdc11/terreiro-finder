import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import type { Casa } from '@/features/casas/domain/Casa';
import { BadgesAbertura } from '@/features/casas/components/BadgesAbertura';
import { pinNaoVerificada, pinVerificada } from './PinIcons';

const CENTRO_ITAJAI: [number, number] = [-26.9078, -48.6614];

interface Props {
  casas: ReadonlyArray<Casa>;
}

/**
 * Força o Leaflet a recalcular o tamanho do canvas após o layout final.
 * Sintoma sem isso: mapa "travado" — drag sem efeito, tiles cortados —
 * porque o Leaflet mediu o canvas antes do flex/calc resolver.
 *
 * Disparos:
 *   - mount: rAF + retries em 100ms e 500ms (cobre layout async)
 *   - window resize / orientationchange (mobile + devtools)
 *
 * Não usamos ResizeObserver: ele entra em loop com invalidateSize porque
 * cada invalidateSize redimensiona painéis internos, o observer dispara,
 * dispara invalidateSize de novo, etc. Consequência: ~30% de CPU constante
 * e scroll lento na página inteira.
 */
function AjusteDeTamanho() {
  const map = useMap();
  useEffect(() => {
    let cancelado = false;
    const fix = () => {
      if (!cancelado) map.invalidateSize();
    };
    const rafId = requestAnimationFrame(fix);
    const t1 = window.setTimeout(fix, 100);
    const t2 = window.setTimeout(fix, 500);

    window.addEventListener('resize', fix);
    window.addEventListener('orientationchange', fix);

    return () => {
      cancelado = true;
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', fix);
      window.removeEventListener('orientationchange', fix);
    };
  }, [map]);
  return null;
}

export function MapaCasas({ casas }: Props) {
  const comCoord = useMemo(() => casas.filter((c) => c.coordenadas !== null), [casas]);
  // key estável evita double-mount em Strict Mode (bug conhecido react-leaflet v4).
  const idRef = useRef('mapa-itajai-singleton');

  return (
    <MapContainer
      key={idRef.current}
      center={CENTRO_ITAJAI}
      zoom={13}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      // Animações do Leaflet rodam em rAF contínuo mesmo quando nada acontece.
      // Pra mapa estático (poucos pins, sem realtime), desabilitar libera CPU.
      zoomAnimation={false}
      fadeAnimation={false}
      markerZoomAnimation={false}
      aria-label="Mapa com casas"
    >
      <AjusteDeTamanho />
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
