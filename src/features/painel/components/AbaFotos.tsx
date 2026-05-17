import { useRef } from 'react';
import { Button } from '@/shared/ui/button';
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
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Até {MAX_FOTOS_POR_CASA} fotos por casa. Compressão é automática (lado
        maior ≤ 1600 px, ≤ 1 MB). Você pode reordenar removendo e re-enviando.
      </p>

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          disabled={adicionar.isPending || cheio}
          aria-label="Adicionar foto"
          className="block text-sm"
        />
        {adicionar.isPending ? (
          <span className="text-sm text-muted-foreground">Comprimindo e enviando…</span>
        ) : null}
        {cheio ? (
          <span className="text-sm text-destructive">
            Limite de {MAX_FOTOS_POR_CASA} fotos atingido.
          </span>
        ) : null}
      </div>

      {adicionar.error ? (
        <p role="alert" className="text-sm text-destructive">
          {adicionar.error.message}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando fotos…</p>
      ) : !fotos || fotos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhuma foto ainda. Adiciona uma pra a casa aparecer com imagem na busca.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((f) => (
            <li
              key={f.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <img
                src={f.url}
                alt={`Foto da casa, ordem ${f.ordem + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={remover.isPending}
                onClick={() => remover.mutate(f)}
                className="absolute right-2 top-2"
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
