import { Link, useParams } from 'react-router-dom';
import { useCasa } from '../hooks/useCasa';
import { FichaCasa } from '../components/FichaCasa';

export function CasaFicha() {
  const { slug } = useParams<{ slug: string }>();
  const { data: casa, isLoading, error } = useCasa(slug);

  if (isLoading) {
    return (
      <div className="container py-12 text-muted-foreground" role="status">
        Carregando casa…
      </div>
    );
  }

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
          Voltar pra busca
        </Link>
      </div>
    );
  }

  return <FichaCasa casa={casa} />;
}
