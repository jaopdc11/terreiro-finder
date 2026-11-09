import { Link, useParams } from 'react-router-dom';
import { useCasa } from '../hooks/useCasa';
import { FichaCasa } from '../components/FichaCasa';

export function CasaFicha() {
  const { slug } = useParams<{ slug: string }>();
  const { data: casa, isLoading, error } = useCasa(slug);

  if (isLoading) return <SkeletonFicha />;

  if (error) {
    return (
      <div className="container py-12 text-center" role="alert">
        <h1 className="font-display text-3xl">Deu ruim carregando essa casa.</h1>
        <p className="mt-2 text-muted-foreground">Tenta de novo daqui a pouco.</p>
      </div>
    );
  }

  if (!casa) {
    return (
      <div className="container py-12 text-center">
        <h1 className="font-display text-3xl">Casa não encontrada</h1>
        <p className="mt-2 text-muted-foreground">
          Pode ter sido arquivada ou o link está fora.
        </p>
        <Link to="/" className="mt-6 inline-block text-primary hover:underline">
          Voltar ao mapa
        </Link>
      </div>
    );
  }

  return <FichaCasa casa={casa} />;
}

function SkeletonFicha() {
  return (
    <div className="animate-pulse" aria-hidden="true" aria-label="Carregando casa">
      {/* Hero */}
      <div className="bg-foreground/10">
        <div className="container max-w-5xl px-4 pb-10 pt-8">
          <div className="h-3 w-20 rounded bg-foreground/10" />
          <div className="mt-8 space-y-3">
            <div className="h-2.5 w-24 rounded bg-foreground/8" />
            <div className="h-10 w-64 rounded bg-foreground/10" />
            <div className="h-4 w-36 rounded bg-foreground/8" />
          </div>
        </div>
      </div>
      {/* Conteúdo */}
      <div className="container max-w-5xl px-4 py-8 space-y-4">
        <div className="flex gap-2">
          <div className="h-5 w-24 rounded-full bg-foreground/8" />
          <div className="h-5 w-28 rounded-full bg-foreground/8" />
          <div className="h-5 w-20 rounded-full bg-foreground/8" />
        </div>
        <div className="mt-6 h-48 rounded-md bg-foreground/8" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            <div className="h-3 w-20 rounded bg-foreground/8" />
            <div className="h-4 w-full rounded bg-foreground/6" />
            <div className="h-4 w-5/6 rounded bg-foreground/6" />
            <div className="h-4 w-4/6 rounded bg-foreground/6" />
          </div>
          <div className="h-44 rounded-md bg-foreground/8" />
        </div>
      </div>
    </div>
  );
}
