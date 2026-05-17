import { Link } from 'react-router-dom';

export function NaoEncontrado() {
  return (
    <section className="container py-16 text-center">
      <h1 className="font-display text-4xl">Página não encontrada</h1>
      <p className="mt-2 text-muted-foreground">
        Talvez a casa tenha mudado de endereço.
      </p>
      <Link to="/" className="mt-6 inline-block text-primary hover:underline">
        Voltar pra busca
      </Link>
    </section>
  );
}
