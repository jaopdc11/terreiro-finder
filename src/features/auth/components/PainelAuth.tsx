import type { ReactNode } from 'react';
import { Riscos } from '@/shared/components/ornamentos/Ornamentos';

/** Moldura das telas de auth: painel editorial à esquerda (desktop) + conteúdo. */
export function PainelAuth({ frase, rodape, children }: { frase: ReactNode; rodape: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="relative hidden w-[46%] overflow-hidden lg:flex hero-gradient">
        <div className="relative z-10 flex flex-col justify-between p-14 text-primary-foreground">
          <p className="eyebrow text-primary-foreground/70">Acesso</p>
          <div className="space-y-6">
            <Riscos className="h-6 w-auto text-primary-foreground/30" />
            <p className="display-serif text-4xl italic leading-snug">{frase}</p>
          </div>
          <p className="text-sm text-primary-foreground/50">{rodape}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm space-y-8">{children}</div>
      </div>
    </div>
  );
}
