import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { MapPin, Navigation } from 'lucide-react';
import type { Casa } from '../domain/Casa';
import { pinVerificada, pinNaoVerificada } from '@/features/busca/components/PinIcons';

export function SecaoMapaCasa({ casa }: { casa: Casa }) {
  const endereco = casa.enderecoPublico();
  const coord = casa.coordenadas;
  const pin = casa.estaVerificada() ? pinVerificada : pinNaoVerificada;
  // Coordenada arredondada (~1 km): serve pro mapa, não pra rota.
  const aproximada = casa.localizacaoAproximada;

  const gmapsUrl = aproximada
    ? null
    : coord
    ? `https://www.google.com/maps?q=${coord.lat},${coord.lng}`
    : endereco
      ? `https://www.google.com/maps/search/${encodeURIComponent(endereco)}`
      : null;
  const wazeUrl = coord && !aproximada
    ? `https://waze.com/ul?ll=${coord.lat}%2C${coord.lng}&navigate=yes`
    : null;

  return (
    <div
      id="como-chegar"
      className="card-soft grid grid-cols-1 overflow-hidden lg:grid-cols-[1fr_320px]"
    >
      {/* Mapa */}
      <div className="relative h-72 w-full bg-muted lg:h-[420px]">
        {coord ? (
          <MapContainer
            center={[coord.lat, coord.lng]}
            zoom={aproximada ? 14 : 16}
            scrollWheelZoom={false}
            dragging={true}
            doubleClickZoom={true}
            keyboard={false}
            zoomControl={true}
            attributionControl={false}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[coord.lat, coord.lng]} icon={pin} />
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MapPin size={32} strokeWidth={1.25} className="mx-auto text-muted-foreground/60" />
              <p className="mt-3 text-sm text-muted-foreground">
                Coordenadas não disponíveis
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Painel lateral */}
      <div className="flex flex-col gap-6 border-t border-border bg-background p-6 lg:border-l lg:border-t-0">
        {aproximada ? (
          <p
            data-testid="localizacao-aproximada"
            className="rounded-md border border-border bg-muted/50 p-3 text-sm leading-relaxed text-foreground"
          >
            Localização aproximada (cerca de 1 km). O endereço exato é passado pela casa
            no contato.
          </p>
        ) : null}
        <div>
          <p className="eyebrow text-muted-foreground">Endereço</p>
          {endereco ? (
            <p className="mt-2 text-sm leading-relaxed text-foreground">{endereco}</p>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-foreground/50">
              {casa.perfilAbertura.enderecoVisibilidade === 'sob_contato'
                ? 'Fornecido após contato direto com a casa.'
                : 'Endereço não divulgado publicamente.'}
            </p>
          )}
        </div>

        {casa.bairro || casa.cidade ? (
          <div>
            <p className="eyebrow text-muted-foreground">Bairro / cidade</p>
            <p className="mt-2 text-sm text-foreground">
              {casa.bairro ? `${casa.bairro} · ` : ''}
              {casa.cidade}/{casa.estado}
            </p>
          </div>
        ) : null}

        {gmapsUrl || wazeUrl ? (
          <div className="mt-auto space-y-2 pt-2">
            {gmapsUrl ? (
              <a
                href={gmapsUrl}
                data-analytics="rota_google_maps"
                target="_blank"
                rel="noreferrer noopener"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted/40"
              >
                <Navigation size={14} />
                Abrir no Google Maps
              </a>
            ) : null}
            {wazeUrl ? (
              <a
                href={wazeUrl}
                data-analytics="rota_waze"
                target="_blank"
                rel="noreferrer noopener"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted/40"
              >
                <Navigation size={14} />
                Abrir no Waze
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
