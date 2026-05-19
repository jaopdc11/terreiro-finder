import { useCallback, useState } from 'react';

export interface LocalizacaoUsuario {
  lat: number;
  lng: number;
  precisaoMetros: number;
}

export type StatusGeo =
  | { kind: 'idle' }
  | { kind: 'pedindo' }
  | { kind: 'ok'; loc: LocalizacaoUsuario }
  | { kind: 'erro'; mensagem: string };

/**
 * Hook que orquestra a chamada ao `navigator.geolocation`. Não mostra UI —
 * quem usa decide quando chamar `pedir()` (geralmente depois de consentimento
 * customizado).
 *
 * Erros do browser são traduzidos pra pt-BR.
 */
export function useGeolocalizacao() {
  const [status, setStatus] = useState<StatusGeo>({ kind: 'idle' });

  const pedir = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus({
        kind: 'erro',
        mensagem: 'Seu navegador não suporta geolocalização.',
      });
      return;
    }
    setStatus({ kind: 'pedindo' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus({
          kind: 'ok',
          loc: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            precisaoMetros: pos.coords.accuracy,
          },
        });
      },
      (err) => {
        setStatus({ kind: 'erro', mensagem: traduzirErroGeo(err) });
      },
      {
        enableHighAccuracy: false, // suficiente pra ordenar casas por distância
        timeout: 10_000,
        maximumAge: 60_000, // aceita cache de 1min se browser tiver
      },
    );
  }, []);

  const limpar = useCallback(() => setStatus({ kind: 'idle' }), []);

  return { status, pedir, limpar };
}

function traduzirErroGeo(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Você negou o acesso à localização. Pra usar de novo, libere nas permissões do navegador.';
    case err.POSITION_UNAVAILABLE:
      return 'Não foi possível obter sua localização agora. Tente de novo em alguns segundos.';
    case err.TIMEOUT:
      return 'Demorou demais pra obter sua localização. Tente de novo.';
    default:
      return 'Falha ao obter localização.';
  }
}
