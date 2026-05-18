import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';

export function NaoEncontrado() {
  return (
    <section className="container max-w-xl py-24 text-center">
      <p className="eyebrow eyebrow-ornado inline-flex items-center">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        Página não encontrada.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Talvez a casa tenha mudado de endereço.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/">
          <Button variant="primary">Voltar ao início</Button>
        </Link>
        <Link to="/mapa">
          <Button variant="outline">Abrir o mapa</Button>
        </Link>
      </div>
    </section>
  );
}
