import { useRef } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { MAX_FOTOS_POR_CASA } from '@/features/casas/api/CasaFotosRepository';
import { useAdicionarFoto, useFotosDaCasa, useRemoverFoto } from '../hooks/usePainelFotos';

interface Props {
  casaId: string;
}

export function AbaFotos({ casaId }: Props) {
  const { data: fotos, isLoading } = useFotosDaCasa(casaId);
  const adicionar = useAdicionarFoto(casaId);
  const remover = useRemoverFoto(casaId);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await adicionar.mutateAsync(file);
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const total = fotos?.length ?? 0;
  const cheio = total >= MAX_FOTOS_POR_CASA;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Até {MAX_FOTOS_POR_CASA} fotos por casa. Compressão automática — lado
        maior ≤ 1600 px, arquivo ≤ 1 MB. A primeira foto vira a capa na busca.
      </p>

      {/* Zona de upload */}
      {cheio ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
          Limite de {MAX_FOTOS_POR_CASA} fotos atingido. Remova uma para
          adicionar outra.
        </p>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={adicionar.isPending}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-4 py-12 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adicionar.isPending ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm font-medium">
                  Comprimindo e enviando…
                </span>
              </>
            ) : (
              <>
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm font-medium">
                  Clique para adicionar uma foto
                </span>
                <span className="text-xs">JPEG, PNG ou WEBP</span>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onPickFile}
            disabled={adicionar.isPending}
            className="sr-only"
            aria-label="Adicionar foto"
          />
        </div>
      )}

      {adicionar.error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          {adicionar.error.message}
        </p>
      ) : null}

      {/* Grade de fotos */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando fotos…
        </div>
      ) : !fotos || fotos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nenhuma foto ainda. Adicione uma pra a casa aparecer com imagem na
          busca.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((f) => (
            <li
              key={f.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <img
                src={f.url}
                alt={`Foto da casa, posição ${f.ordem + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                disabled={remover.isPending}
                onClick={() => remover.mutate(f)}
                aria-label="Remover foto"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 disabled:opacity-50 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <span className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 text-center font-mono text-[10px] text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                #{f.ordem + 1}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
