import { useEffect, useRef } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import { pinVerificada } from '@/features/busca/components/PinIcons';

const CENTRO_BR: [number, number] = [-14.235, -51.9253];
const ZOOM_PONTO = 16;
const ZOOM_BR = 4;

interface Props {
  lat: number | null;
  lng: number | null;
  onMudar(lat: number, lng: number): void;
}

/**
 * Mini-mapa com pino arrastável. O dirigente vê onde o pino caiu (do
 * geocoding por endereço) e ajusta arrastando — sem precisar mexer em
 * coordenadas numéricas.
 *
 * Quando lat/lng vêm de fora (geocode novo após digitar CEP), o mapa
 * re-centraliza no pino.
 */
export function MapaSeletorPino({ lat, lng, onMudar }: Props) {
  const temPin = lat !== null && lng !== null;
  const centerInicial: [number, number] = temPin ? [lat, lng] : CENTRO_BR;
  const zoomInicial = temPin ? ZOOM_PONTO : ZOOM_BR;

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-md border border-border">
      <MapContainer
        center={centerInicial}
        zoom={zoomInicial}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
        zoomAnimation={false}
        fadeAnimation={false}
        markerZoomAnimation={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecentralizaQuandoCoordsMudam lat={lat} lng={lng} />
        {temPin ? (
          <PinoArrastavel lat={lat} lng={lng} onMudar={onMudar} />
        ) : null}
      </MapContainer>
    </div>
  );
}

function PinoArrastavel({
  lat,
  lng,
  onMudar,
}: {
  lat: number;
  lng: number;
  onMudar(lat: number, lng: number): void;
}) {
  const ref = useRef<LeafletMarker | null>(null);
  return (
    <Marker
      position={[lat, lng]}
      draggable
      icon={pinVerificada}
      ref={(m) => {
        ref.current = m;
      }}
      eventHandlers={{
        dragend: (e) => {
          const m = e.target as LeafletMarker;
          const pos = m.getLatLng();
          onMudar(pos.lat, pos.lng);
        },
      }}
    />
  );
}

/**
 * Re-centraliza o mapa quando lat/lng mudam por fora (geocode novo).
 * Usa setView sem animação pra evitar conflito com dragend acontecendo no
 * mesmo tick.
 */
function RecentralizaQuandoCoordsMudam({
  lat,
  lng,
}: {
  lat: number | null;
  lng: number | null;
}) {
  const map = useMap();
  const ultimoRef = useRef<string | null>(null);
  useEffect(() => {
    if (lat === null || lng === null) return;
    const chave = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (ultimoRef.current === chave) return;
    ultimoRef.current = chave;
    map.setView([lat, lng], Math.max(map.getZoom(), ZOOM_PONTO));
  }, [lat, lng, map]);

  // Força redimensionar quando o container monta dentro de um flex/grid
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 100);
    return () => window.clearTimeout(t);
  }, [map]);

  return null;
}
