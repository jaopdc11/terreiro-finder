import L from 'leaflet';

/**
 * Ícones customizados em SVG inline pra evitar problema clássico do Leaflet
 * com marker-icon.png em bundlers (Vite). Verde-pemba pra verificada,
 * tracejado pra não-verificada (regra cravada em Casa.estaVerificada).
 */

const VERIFICADA_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
  <path d="M16 0C7.16 0 0 6.93 0 15.5 0 27 16 40 16 40s16-13 16-24.5C32 6.93 24.84 0 16 0z"
        fill="hsl(0, 65%, 38%)" stroke="hsl(38, 50%, 97%)" stroke-width="2"/>
  <circle cx="16" cy="15" r="5" fill="hsl(38, 50%, 97%)"/>
</svg>`;

const NAO_VERIFICADA_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
  <path d="M16 0C7.16 0 0 6.93 0 15.5 0 27 16 40 16 40s16-13 16-24.5C32 6.93 24.84 0 16 0z"
        fill="hsl(35, 35%, 78%)" stroke="hsl(0, 65%, 38%)" stroke-width="2" stroke-dasharray="3 2"/>
  <circle cx="16" cy="15" r="4" fill="none" stroke="hsl(220, 12%, 18%)" stroke-width="1.5"/>
</svg>`;

export const pinVerificada = L.divIcon({
  html: VERIFICADA_SVG,
  className: 'pin-casa pin-verificada',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36],
});

export const pinNaoVerificada = L.divIcon({
  html: NAO_VERIFICADA_SVG,
  className: 'pin-casa pin-nao-verificada',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36],
});

// Pin "você está aqui" — círculo azul com aro branco e pulse leve.
// Distinto dos pins de casa (formato pin-drop com sombra terra-pemba).
const VOCE_AQUI_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="11" fill="hsl(210, 90%, 56%)" fill-opacity="0.2"/>
  <circle cx="12" cy="12" r="6" fill="hsl(210, 90%, 56%)" stroke="hsl(38, 50%, 97%)" stroke-width="2"/>
</svg>`;

export const pinVoceAqui = L.divIcon({
  html: VOCE_AQUI_SVG,
  className: 'pin-voce-aqui',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
