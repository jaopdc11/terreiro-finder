import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Arco, Riscos } from '@/shared/components/ornamentos/Ornamentos';

export function NaoEncontrado() {
  return (
    <div className="hero-gradient flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-24 text-center">
      <Arco className="mx-auto h-12 w-32 opacity-30" />

      <p className="eyebrow eyebrow-ornado mt-8 inline-flex items-center">404</p>

      <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
        Página não{' '}
        <span className="display-serif italic text-primary">encontrada</span>.
      </h1>

      <p className="mt-4 max-w-sm text-muted-foreground">
        Talvez a casa tenha mudado de endereço.
      </p>

      <Riscos className="mx-auto my-8 h-3 w-24" accent="hsl(var(--terra-pemba))" />

      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button variant="primary">Voltar ao início</Button>
        </Link>
        <Link to="/mapa">
          <Button variant="outline">Abrir o mapa</Button>
        </Link>
      </div>
    </div>
  );
}
