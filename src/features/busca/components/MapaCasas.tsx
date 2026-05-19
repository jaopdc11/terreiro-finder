import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLngBoundsLiteral, Marker as LeafletMarker } from 'leaflet';
import { Link } from 'react-router-dom';
import type { Casa } from '@/features/casas/domain/Casa';
import { BadgesAbertura } from '@/features/casas/components/BadgesAbertura';
import { pinNaoVerificada, pinVerificada, pinVoceAqui } from './PinIcons';

const CENTRO_BR: [number, number] = [-14.235, -51.9253];
const ZOOM_BR = 4;
const ZOOM_PONTUAL = 13;

function casasComCoord(
  casas: ReadonlyArray<Casa>,
): ReadonlyArray<{ lat: number; lng: number }> {
  return casas
    .filter((c) => c.coordenadas !== null)
    .map((c) => ({ lat: c.coordenadas!.lat, lng: c.coordenadas!.lng }));
}

function centroMedio(coords: ReadonlyArray<{ lat: number; lng: number }>): [number, number] {
  if (coords.length === 0) return CENTRO_BR;
  const sum = coords.reduce(
    (acc, c) => ({ lat: acc.lat + c.lat, lng: acc.lng + c.lng }),
    { lat: 0, lng: 0 },
  );
  return [sum.lat / coords.length, sum.lng / coords.length];
}

interface Props {
  casas: ReadonlyArray<Casa>;
  /** Casa a ser focada no mapa (centraliza + abre popup). */
  casaAtivaId?: string | null;
  /** Callback quando o popup fecha (sincroniza com o pai). */
  onPopupFechado?: () => void;
  /** Quando muda, dispara reset de zoom/centro pro estado inicial. */
  resetTicker?: number;
  /** Localização do usuário (opt-in). Quando definida, renderiza pin "você
   * está aqui" e centraliza o mapa nela. */
  localizacaoUsuario?: { lat: number; lng: number } | null;
}

/**
 * Reage à mudança de casaAtivaId centralizando o mapa e abrindo o popup
 * correspondente. Precisa estar dentro do MapContainer para ter acesso ao
 * `useMap()`.
 */
function FocoEmCasa({
  casaAtivaId,
  refs,
  casasIndex,
}: {
  casaAtivaId: string | null | undefined;
  refs: React.MutableRefObject<Map<string, LeafletMarker>>;
  casasIndex: Map<string, { lat: number; lng: number }>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!casaAtivaId) return;
    const coord = casasIndex.get(casaAtivaId);
    const marker = refs.current.get(casaAtivaId);
    if (!coord || !marker) return;
    map.flyTo([coord.lat, coord.lng], Math.max(map.getZoom(), 15), {
      duration: 0.6,
    });
    // Pequeno delay pra animação rolar antes de abrir popup
    const t = window.setTimeout(() => marker.openPopup(), 350);
    return () => window.clearTimeout(t);
  }, [casaAtivaId, map, refs, casasIndex]);
  return null;
}

/**
 * Ajusta center/zoom do mapa pras casas carregadas. Roda quando `ticker`
 * muda (reset manual via clique no card ativo) ou quando o conjunto de casas
 * muda (filtros, refetch). Pula o primeiro render porque o center inicial
 * já é calculado a partir das casas no mount.
 *
 * - 0 casas: volta pro centro do Brasil
 * - 1 casa: flyTo direto
 * - N casas: fitBounds pra enquadrar todas
 */
function AjusteAutomatico({
  casas,
  ticker,
}: {
  casas: ReadonlyArray<Casa>;
  ticker: number | undefined;
}) {
  const map = useMap();
  const primeiroRender = useRef(true);
  useEffect(() => {
    if (primeiroRender.current) {
      primeiroRender.current = false;
      return;
    }
    map.closePopup();
    const coords = casasComCoord(casas);
    if (coords.length === 0) {
      map.flyTo(CENTRO_BR, ZOOM_BR, { duration: 0.6 });
      return;
    }
    if (coords.length === 1) {
      map.flyTo([coords[0]!.lat, coords[0]!.lng], ZOOM_PONTUAL, { duration: 0.6 });
      return;
    }
    const bounds: LatLngBoundsLiteral = coords.map(
      (c) => [c.lat, c.lng] as [number, number],
    );
    map.flyToBounds(bounds, { padding: [40, 40], duration: 0.6 });
  }, [ticker, casas, map]);
  return null;
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
/**
 * Centraliza no usuário (zoom de bairro) sempre que `loc` muda. Tem
 * prioridade sobre o AjusteAutomatico — se ambos disparam no mesmo tick,
 * este roda depois (filhos do MapContainer rodam efeitos em ordem JSX).
 */
function FocoNoUsuario({
  loc,
}: {
  loc: { lat: number; lng: number } | null | undefined;
}) {
  const map = useMap();
  const ultimoRef = useRef<string | null>(null);
  useEffect(() => {
    if (!loc) return;
    const chave = `${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}`;
    if (ultimoRef.current === chave) return;
    ultimoRef.current = chave;
    map.flyTo([loc.lat, loc.lng], 14, { duration: 0.6 });
  }, [loc, map]);
  return null;
}

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

export function MapaCasas({
  casas,
  casaAtivaId,
  onPopupFechado,
  resetTicker,
  localizacaoUsuario,
}: Props) {
  const comCoord = useMemo(
    () => casas.filter((c) => c.coordenadas !== null),
    [casas],
  );
  // key estável evita double-mount em Strict Mode (bug conhecido react-leaflet v4).
  const idRef = useRef('mapa-casas-singleton');
  // Refs dos markers + índice de coordenadas por casaId — usado pelo FocoEmCasa.
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const casasIndex = useMemo(() => {
    const m = new Map<string, { lat: number; lng: number }>();
    for (const casa of comCoord) {
      if (casa.coordenadas) {
        m.set(casa.id, { lat: casa.coordenadas.lat, lng: casa.coordenadas.lng });
      }
    }
    return m;
  }, [comCoord]);

  // Center inicial calculado a partir das casas no primeiro render. Mantido
  // estável depois — mudanças subsequentes vão pelo AjusteAutomatico.
  const [centroInicial] = useState<[number, number]>(() =>
    centroMedio(casasComCoord(casas)),
  );
  const [zoomInicial] = useState<number>(() =>
    casasComCoord(casas).length === 0 ? ZOOM_BR : ZOOM_PONTUAL,
  );

  return (
    <MapContainer
      key={idRef.current}
      center={centroInicial}
      zoom={zoomInicial}
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
      <FocoEmCasa
        casaAtivaId={casaAtivaId ?? null}
        refs={markersRef}
        casasIndex={casasIndex}
      />
      <AjusteAutomatico casas={casas} ticker={resetTicker} />
      <FocoNoUsuario loc={localizacaoUsuario ?? null} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {localizacaoUsuario ? (
        <Marker
          position={[localizacaoUsuario.lat, localizacaoUsuario.lng]}
          icon={pinVoceAqui}
          interactive={false}
        />
      ) : null}
      {comCoord.map((casa) => {
        const c = casa.coordenadas!;
        return (
          <Marker
            key={casa.id}
            position={[c.lat, c.lng]}
            icon={casa.estaVerificada() ? pinVerificada : pinNaoVerificada}
            ref={(ref) => {
              if (ref) markersRef.current.set(casa.id, ref);
              else markersRef.current.delete(casa.id);
            }}
            eventHandlers={{
              popupclose: () => onPopupFechado?.(),
            }}
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
