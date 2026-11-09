import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useGaleriaCasa } from '../hooks/useGaleriaCasa';
import type { CasaFotoView } from '../api/CasaFotosRepository';
import { useTeclaEsc } from '@/shared/hooks/useTeclaEsc';

interface Props {
  casaId: string;
}

export function CardGaleriaCasa({ casaId }: Props) {
  const { data: fotos } = useGaleriaCasa(casaId);
  const [selected, setSelected] = useState<number | null>(null);

  const fechar = useCallback(() => setSelected(null), []);
  useTeclaEsc(selected !== null, fechar);

  if (!fotos || fotos.length === 0) return null;

  const total = fotos.length;
  const fotoAtiva = selected !== null ? fotos[selected] : null;

  const navPrev = () => setSelected((i) => ((i ?? 0) - 1 + total) % total);
  const navNext = () => setSelected((i) => ((i ?? 0) + 1) % total);

  return (
    <>
      <section aria-label="Galeria de fotos">
        <div className="container max-w-6xl px-4">
          <Bento fotos={fotos} total={total} onSelect={setSelected} />
        </div>
      </section>

      {fotoAtiva != null && selected !== null ? (
        <Lightbox
          foto={fotoAtiva}
          idx={selected}
          total={total}
          onFechar={fechar}
          onPrev={navPrev}
          onNext={navNext}
        />
      ) : null}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  BENTO — layout assimétrico                                     */
/* ─────────────────────────────────────────────────────────────── */

function Bento({
  fotos,
  total,
  onSelect,
}: {
  fotos: ReadonlyArray<CasaFotoView>;
  total: number;
  onSelect: (i: number) => void;
}) {
  if (fotos.length === 1) {
    return (
      <div className="h-80 overflow-hidden rounded-lg sm:h-96 md:h-[460px]">
        <FotoBtn
          foto={fotos[0]!}
          idx={0}
          total={total}
          onSelect={onSelect}
          className="h-full w-full"
        />
      </div>
    );
  }

  if (fotos.length === 2) {
    return (
      <div className="grid h-72 grid-cols-2 gap-2 sm:h-80 md:h-96">
        {fotos.map((f, i) => (
          <FotoBtn key={f.id} foto={f} idx={i} total={total} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  if (fotos.length === 3) {
    return (
      <div className="grid h-80 grid-cols-3 grid-rows-2 gap-2 sm:h-96 md:h-[460px]">
        <FotoBtn
          foto={fotos[0]!}
          idx={0}
          total={total}
          onSelect={onSelect}
          className="col-span-2 row-span-2"
        />
        <FotoBtn foto={fotos[1]!} idx={1} total={total} onSelect={onSelect} />
        <FotoBtn foto={fotos[2]!} idx={2} total={total} onSelect={onSelect} />
      </div>
    );
  }

  // 4+ fotos: bento — 1 hero à esquerda + 2x2 à direita
  const visivel = fotos.slice(0, 5);
  const extra = total - 5;

  return (
    <div className="grid h-80 grid-cols-4 grid-rows-2 gap-2 sm:h-96 md:h-[460px]">
      <FotoBtn
        foto={visivel[0]!}
        idx={0}
        total={total}
        onSelect={onSelect}
        className="col-span-2 row-span-2"
      />
      {visivel.slice(1).map((f, i) => {
        const realIdx = i + 1;
        const isUltima = realIdx === visivel.length - 1;
        const showExtra = isUltima && extra > 0;
        return (
          <FotoBtn
            key={f.id}
            foto={f}
            idx={realIdx}
            total={total}
            extra={showExtra ? extra : undefined}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

function FotoBtn({
  foto,
  idx,
  total,
  extra,
  onSelect,
  className = '',
}: {
  foto: CasaFotoView;
  idx: number;
  total: number;
  extra?: number | undefined;
  onSelect: (i: number) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(idx)}
      className={`group relative block overflow-hidden rounded-md bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      aria-label={
        extra && extra > 0
          ? `Ver todas as ${total} fotos`
          : `Abrir foto ${idx + 1} de ${total}`
      }
    >
      <img
        src={foto.url}
        alt={`Foto da casa, ${idx + 1} de ${total}`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/10" />
      {extra && extra > 0 ? (
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/65 text-white">
          <span className="text-2xl font-semibold">+{extra}</span>
        </div>
      ) : null}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  LIGHTBOX                                                       */
/* ─────────────────────────────────────────────────────────────── */

function Lightbox({
  foto,
  idx,
  total,
  onFechar,
  onPrev,
  onNext,
}: {
  foto: CasaFotoView;
  idx: number;
  total: number;
  onFechar: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90"
      onClick={onFechar}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onFechar();
        }}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Fechar"
        autoFocus
      >
        <X size={20} />
      </button>

      <div
        className="flex items-center gap-2 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {total > 1 ? (
          <button
            type="button"
            onClick={onPrev}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={22} />
          </button>
        ) : null}

        <div className="relative">
          <img
            src={foto.url}
            alt={`Foto da casa, ${idx + 1} de ${total}`}
            className="max-h-[85vh] max-w-[80vw] rounded-md object-contain"
          />
          {total > 1 ? (
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground/60 px-3 py-1 text-xs font-medium text-white">
              {idx + 1} / {total}
            </span>
          ) : null}
        </div>

        {total > 1 ? (
          <button
            type="button"
            onClick={onNext}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Próxima foto"
          >
            <ChevronRight size={22} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
