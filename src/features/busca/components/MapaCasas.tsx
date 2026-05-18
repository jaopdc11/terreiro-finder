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

/**
 * Leaflet renderiza os botões de zoom como `<a title="Zoom in">` em inglês,
 * sem `aria-label`. Substituímos title/aria-label em pt-BR e adicionamos
 * `role="button"` (são <a> sem href real, screen readers tratam mal por default).
 */
function ZoomA11y() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const inBtn = container.querySelector<HTMLElement>('.leaflet-control-zoom-in');
    const outBtn = container.querySelector<HTMLElement>('.leaflet-control-zoom-out');
    if (inBtn) {
      inBtn.setAttribute('aria-label', 'Aproximar mapa');
      inBtn.setAttribute('title', 'Aproximar mapa');
      inBtn.setAttribute('role', 'button');
    }
    if (outBtn) {
      outBtn.setAttribute('aria-label', 'Afastar mapa');
      outBtn.setAttribute('title', 'Afastar mapa');
      outBtn.setAttribute('role', 'button');
    }
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
      <ZoomA11y />
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
            <Popup minWidth={260} maxWidth={300} closeButton>
              <article className="w-[260px]">
                <div className="px-4 pb-3 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    {casa.tradicaoPrincipal}
                    {casa.bairro ? (
                      <span className="ml-1 text-muted-foreground">
                        · {casa.bairro}
                      </span>
                    ) : null}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold leading-tight tracking-tight text-foreground">
                    {casa.nome}
                  </h3>
                  {casa.sacerdoteNome ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      com{' '}
                      <span className="italic text-foreground">
                        {casa.sacerdoteNome}
                      </span>
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <BadgesAbertura casa={casa} />
                  </div>
                </div>
                <Link
                  to={`/casa/${casa.slug.toString()}`}
                  style={{ color: 'hsl(var(--primary-foreground))' }}
                  className="flex items-center justify-between border-t border-border bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Ver detalhes
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
