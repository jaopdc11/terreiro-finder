import { MessageCircle, Navigation } from 'lucide-react';
import type { Casa } from '../domain/Casa';

interface Props {
  casa: Casa;
  whatsappLink: string | null;
}

/**
 * Barra fixa no fundo da tela em mobile com as ações primárias.
 * Some no desktop (md+) — lá o hero já tem os CTAs visíveis e não rolam.
 */
export function StickyCtaBar({ casa, whatsappLink }: Props) {
  // Com localização aproximada não há rota a oferecer.
  const temRota = casa.coordenadas !== null && !casa.localizacaoAproximada;
  if (!whatsappLink && !temRota) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
      <div className="container max-w-5xl px-4 py-3">
        <div className="flex gap-2">
          {whatsappLink ? (
            <a
              href={whatsappLink}
              data-analytics="contato_whatsapp"
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-terra-pemba px-4 py-3 text-sm font-semibold text-white"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          ) : null}
          {temRota ? (
            <a
              href="#como-chegar"
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground"
            >
              <Navigation size={16} />
              Como chegar
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
